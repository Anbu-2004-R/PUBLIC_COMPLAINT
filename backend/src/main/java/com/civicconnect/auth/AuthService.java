package com.civicconnect.auth;

import com.civicconnect.auth.dto.*;
import com.civicconnect.common.ApiException;
import com.civicconnect.config.JwtUtils;
import com.civicconnect.department.Department;
import com.civicconnect.department.DepartmentRepository;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       DepartmentRepository departmentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "EMAIL_ALREADY_EXISTS",
                    "An account with this email address is already registered.",
                    Map.of("email", "Email address already in use")
            );
        }

        User user = new User();
        user.setId("usr-cit-" + System.currentTimeMillis());
        user.setFullName(request.getFullName().trim());
        user.setEmail(cleanEmail);
        user.setPhone(request.getPhone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.CITIZEN);
        user.setEmailVerified(false);
        user.setAccountStatus("ACTIVE");
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);

        // Generate verification token (expires in 24 hours)
        String tokenStr = UUID.randomUUID().toString();
        EmailVerificationToken token = new EmailVerificationToken(user.getId(), tokenStr, Instant.now().plus(24, ChronoUnit.HOURS));
        emailVerificationTokenRepository.save(token);

        // Dispatch verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), tokenStr);

        return new RegisterResponse("Registration successful. A verification link has been sent to your email address.", true);
    }

    public LoginResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.UNAUTHORIZED,
                        "INVALID_CREDENTIALS",
                        "Invalid email or password. Please verify your credentials or reset your password."
                ));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "INVALID_CREDENTIALS",
                    "Invalid email or password. Please verify your credentials or reset your password."
            );
        }

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            if (!user.getRole().name().equalsIgnoreCase(request.getRole().trim())) {
                String actualRoleName = user.getRole() == UserRole.ADMIN ? "Administrator" :
                        user.getRole() == UserRole.OFFICER ? "Department Officer" : "Citizen";
                String requestedRoleName = "ADMIN".equalsIgnoreCase(request.getRole()) ? "Administrator" :
                        "OFFICER".equalsIgnoreCase(request.getRole()) ? "Department Officer" : "Citizen";
                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "ROLE_MISMATCH",
                        String.format("Access denied: This account is registered as a %s. You cannot sign in under the %s workspace. Please select the %s role tab above.",
                                actualRoleName, requestedRoleName, actualRoleName)
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

        enrichUserDepartment(user);
        String token = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user);
    }

    @Transactional
    public Map<String, Object> verifyEmail(String tokenStr) {
        if (tokenStr == null || tokenStr.trim().isEmpty() || "invalid".equalsIgnoreCase(tokenStr)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TOKEN",
                    "This verification token is invalid or has expired. Please request a new verification email."
            );
        }

        EmailVerificationToken token = emailVerificationTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "INVALID_TOKEN",
                        "This verification token is invalid or has expired. Please request a new verification email."
                ));

        if (token.isUsed() || token.getExpiryDate().isBefore(Instant.now())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_TOKEN",
                    "This verification token is invalid or has expired. Please request a new verification email."
            );
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User record not found."));

        user.setEmailVerified(true);
        token.setUsed(true);
        userRepository.save(user);
        emailVerificationTokenRepository.save(token);

        return Map.of("success", true, "message", "Your email has been successfully verified! You can now sign in to submit complaints.");
    }

    @Transactional
    public Map<String, String> resendVerification(String email) {
        userRepository.findByEmailIgnoreCase(email.trim().toLowerCase()).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                emailVerificationTokenRepository.deleteByUserId(user.getId());
                String tokenStr = UUID.randomUUID().toString();
                EmailVerificationToken token = new EmailVerificationToken(user.getId(), tokenStr, Instant.now().plus(24, ChronoUnit.HOURS));
                emailVerificationTokenRepository.save(token);
                emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), tokenStr);
            }
        });
        return Map.of("message", "If an account exists for this email, a new verification link has been dispatched.");
    }

    @Transactional
    public Map<String, String> forgotPassword(String email) {
        userRepository.findByEmailIgnoreCase(email.trim().toLowerCase()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());
            String tokenStr = UUID.randomUUID().toString();
            PasswordResetToken token = new PasswordResetToken(user.getId(), tokenStr, Instant.now().plus(1, ChronoUnit.HOURS));
            passwordResetTokenRepository.save(token);
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), tokenStr);
        });
        return Map.of("message", "If your email is registered, you will receive password reset instructions shortly.");
    }

    @Transactional
    public Map<String, String> resetPassword(String tokenStr, String newPassword) {
        if (tokenStr == null || tokenStr.trim().isEmpty() || "invalid".equalsIgnoreCase(tokenStr)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "EXPIRED_TOKEN",
                    "Password reset link has expired. Please request a new link."
            );
        }

        PasswordResetToken token = passwordResetTokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "EXPIRED_TOKEN",
                        "Password reset link has expired. Please request a new link."
                ));

        if (token.isUsed() || token.getExpiryDate().isBefore(Instant.now())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "EXPIRED_TOKEN",
                    "Password reset link has expired. Please request a new link."
            );
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        token.setUsed(true);
        userRepository.save(user);
        passwordResetTokenRepository.save(token);

        return Map.of("message", "Your password has been reset successfully. Please log in with your new credentials.");
    }

    public User getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User session not found."));
        enrichUserDepartment(user);
        return user;
    }

    private void enrichUserDepartment(User user) {
        if (user.getDepartmentId() != null) {
            departmentRepository.findById(user.getDepartmentId())
                    .ifPresent(d -> user.setDepartmentName(d.getName()));
        }
    }
}
