package com.civicconnect.auth;

import com.civicconnect.auth.dto.*;
import com.civicconnect.common.ApiException;
import com.civicconnect.config.JwtUtils;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.user.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.verification-base-url:http://localhost:3000/verify-email}")
    private String verificationBaseUrl;

    @Value("${app.mail.reset-password-base-url:http://localhost:3000/reset-password}")
    private String resetPasswordBaseUrl;

    @Value("${app.mail.from:noreply@civicconnect.gov}")
    private String mailFrom;

    @Transactional
    public LoginResponse login(LoginRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS",
                        "Invalid email or password. Please verify your credentials or reset your password."
                ));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS",
                    "Invalid email or password. Please verify your credentials or reset your password."
            );
        }

        if (req.getRole() != null && !req.getRole().isBlank()) {
            String requested = req.getRole().trim().toUpperCase();
            if (!user.getRole().name().equals(requested)) {
                String actualRoleName = formatRoleName(user.getRole().name());
                String requestedRoleName = formatRoleName(requested);
                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "ROLE_MISMATCH",
                        "Access denied: This account is registered as a " + actualRoleName +
                                ". You cannot sign in under the " + requestedRoleName +
                                " workspace. Please select the " + actualRoleName + " role tab above."
                );
            }
        }

        if ("DEACTIVATED".equalsIgnoreCase(user.getAccountStatus())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "ACCOUNT_DEACTIVATED",
                    "This account has been deactivated. Please contact the municipal administrator."
            );
        }

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user);
    }

    @Transactional
    public RegisterResponse register(RegisterRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_EXISTS",
                    "An account with this email address is already registered.",
                    Map.of("email", "Email address already in use")
            );
        }

        User user = new User();
        user.setId("usr-cit-" + UUID.randomUUID().toString().substring(0, 8));
        user.setFullName(req.getFullName().trim());
        user.setEmail(cleanEmail);
        user.setPhone(req.getPhone().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(UserRole.CITIZEN);
        user.setEmailVerified(false);
        user.setAccountStatus("ACTIVE");

        userRepository.save(user);

        // Generate email verification token
        String tokenStr = UUID.randomUUID().toString();
        EmailVerificationToken evt = new EmailVerificationToken(
                UUID.randomUUID().toString(),
                tokenStr,
                user,
                Instant.now().plus(24, ChronoUnit.HOURS)
        );
        emailVerificationTokenRepository.save(evt);

        // Send Email
        sendVerificationEmail(user.getEmail(), tokenStr);

        return new RegisterResponse(
                "Registration successful. A verification link has been sent to your email address.",
                true
        );
    }

    @Transactional
    public Map<String, Object> verifyEmail(String tokenStr) {
        EmailVerificationToken evt = emailVerificationTokenRepository.findByTokenAndUsedFalse(tokenStr)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "INVALID_TOKEN",
                        "This verification token is invalid or has expired. Please request a new verification email."
                ));

        if (evt.isExpired()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TOKEN",
                    "This verification token is invalid or has expired. Please request a new verification email."
            );
        }

        evt.setUsed(true);
        emailVerificationTokenRepository.save(evt);

        User user = evt.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        return Map.of(
                "success", true,
                "message", "Your email has been successfully verified! You can now sign in to submit complaints."
        );
    }

    @Transactional
    public Map<String, String> resendVerification(String email) {
        String cleanEmail = email.trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(cleanEmail).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                String tokenStr = UUID.randomUUID().toString();
                EmailVerificationToken evt = new EmailVerificationToken(
                        UUID.randomUUID().toString(),
                        tokenStr,
                        user,
                        Instant.now().plus(24, ChronoUnit.HOURS)
                );
                emailVerificationTokenRepository.save(evt);
                sendVerificationEmail(user.getEmail(), tokenStr);
            }
        });

        return Map.of("message", "If an account exists for this email, a new verification link has been dispatched.");
    }

    @Transactional
    public Map<String, String> forgotPassword(String email) {
        String cleanEmail = email.trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(cleanEmail).ifPresent(user -> {
            String tokenStr = UUID.randomUUID().toString();
            PasswordResetToken prt = new PasswordResetToken(
                    UUID.randomUUID().toString(),
                    tokenStr,
                    user,
                    Instant.now().plus(1, ChronoUnit.HOURS)
            );
            passwordResetTokenRepository.save(prt);
            sendPasswordResetEmail(user.getEmail(), tokenStr);
        });

        return Map.of("message", "If your email is registered, you will receive password reset instructions shortly.");
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest req) {
        PasswordResetToken prt = passwordResetTokenRepository.findByTokenAndUsedFalse(req.getToken())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "EXPIRED_TOKEN",
                        "Password reset link has expired. Please request a new link."
                ));

        if (prt.isExpired()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "EXPIRED_TOKEN",
                    "Password reset link has expired. Please request a new link."
            );
        }

        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);

        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return Map.of("message", "Your password has been reset successfully. Please log in with your new credentials.");
    }

    private void sendVerificationEmail(String toEmail, String token) {
        String link = verificationBaseUrl + "?token=" + token;
        log.info("Email verification link generated for {}: {}", toEmail, link);
        if (mailSender != null) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(mailFrom);
                msg.setTo(toEmail);
                msg.setSubject("CivicConnect - Verify your email address");
                msg.setText("Please click the link below to verify your email address:\n\n" + link +
                        "\n\nThis link will expire in 24 hours.");
                mailSender.send(msg);
            } catch (Exception e) {
                log.warn("Failed to dispatch email verification to {}: {}", toEmail, e.getMessage());
            }
        }
    }

    private void sendPasswordResetEmail(String toEmail, String token) {
        String link = resetPasswordBaseUrl + "?token=" + token;
        log.info("Password reset link generated for {}: {}", toEmail, link);
        if (mailSender != null) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(mailFrom);
                msg.setTo(toEmail);
                msg.setSubject("CivicConnect - Reset your password");
                msg.setText("Please click the link below to reset your password:\n\n" + link +
                        "\n\nThis link will expire in 1 hour.");
                mailSender.send(msg);
            } catch (Exception e) {
                log.warn("Failed to dispatch password reset email to {}: {}", toEmail, e.getMessage());
            }
        }
    }

    private String formatRoleName(String role) {
        if ("CITIZEN".equalsIgnoreCase(role)) return "Citizen";
        if ("OFFICER".equalsIgnoreCase(role)) return "Department Officer";
        if ("ADMIN".equalsIgnoreCase(role)) return "Administrator";
        return role;
    }
}
