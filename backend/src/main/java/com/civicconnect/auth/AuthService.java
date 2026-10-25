package com.civicconnect.auth;

import com.civicconnect.audit.AuditLogService;
import com.civicconnect.common.ApiException;
import com.civicconnect.department.DepartmentRepository;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.security.JwtTokenProvider;
import com.civicconnect.user.*;
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
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AuthService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public LoginResponse login(String email, String password, String ipAddress) {
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password. Please verify your credentials."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password. Please verify your credentials.");
        }

        if (user.getAccountStatus() == AccountStatus.DEACTIVATED) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ACCOUNT_DEACTIVATED", "This account has been deactivated. Please contact the administrator.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        auditLogService.recordLog(user.getId(), user.getFullName(), user.getRole().name(), "LOGIN_SUCCESS", "User", user.getId(), "User logged in successfully", ipAddress);

        String deptName = null;
        if (user.getDepartmentId() != null) {
            deptName = departmentRepository.findById(user.getDepartmentId()).map(d -> d.getName()).orElse(null);
        }

        return new LoginResponse(token, UserDto.fromEntity(user, deptName));
    }

    @Transactional
    public RegisterResponse register(RegisterRequest req, String ipAddress) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "An account with this email address is already registered.", Map.of("email", "Email address already in use"));
        }

        User user = new User();
        user.setId("user-" + UUID.randomUUID().toString());
        user.setEmail(email);
        user.setFullName(req.getFullName().trim());
        user.setPhone(req.getPhone().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(UserRole.CITIZEN);
        user.setEmailVerified(false);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        // Generate email verification token
        String tokenString = UUID.randomUUID().toString();
        EmailVerificationToken token = new EmailVerificationToken(user.getId(), tokenString, Instant.now().plus(24, ChronoUnit.HOURS));
        emailVerificationTokenRepository.save(token);

        notificationService.sendEmail(
                user.getEmail(),
                "CivicConnect — Verify your email address",
                "Hello " + user.getFullName() + ",\n\nWelcome to CivicConnect! Please verify your email by clicking: http://localhost:3000/verify-email?token=" + tokenString
        );

        auditLogService.recordLog(user.getId(), user.getFullName(), "CITIZEN", "REGISTER", "User", user.getId(), "Citizen registered account", ipAddress);

        return new RegisterResponse("Registration successful. A verification link has been sent to your email address.", true);
    }

    @Transactional
    public VerifyEmailResponse verifyEmail(String tokenString) {
        EmailVerificationToken token = emailVerificationTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "This verification token is invalid or has expired. Please request a new verification email."));

        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "This verification token is invalid or has expired. Please request a new verification email.");
        }

        token.setUsed(true);
        emailVerificationTokenRepository.save(token);

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));
        user.setEmailVerified(true);
        userRepository.save(user);

        return new VerifyEmailResponse(true, "Your email has been successfully verified! You can now sign in to submit complaints.");
    }

    @Transactional
    public MessageResponse forgotPassword(String email) {
        userRepository.findByEmailIgnoreCase(email.trim()).ifPresent(user -> {
            String tokenString = UUID.randomUUID().toString();
            PasswordResetToken prt = new PasswordResetToken(user.getId(), tokenString, Instant.now().plus(1, ChronoUnit.HOURS));
            passwordResetTokenRepository.save(prt);

            notificationService.sendEmail(
                    user.getEmail(),
                    "CivicConnect — Password Reset Request",
                    "Hello " + user.getFullName() + ",\n\nReset your CivicConnect password: http://localhost:3000/reset-password?token=" + tokenString
            );
        });

        // Always return generic message to avoid email enumeration
        return new MessageResponse("If your email is registered, you will receive password reset instructions shortly.");
    }

    @Transactional
    public MessageResponse resetPassword(String tokenString, String newPassword, String ipAddress) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "EXPIRED_TOKEN", "Password reset link has expired. Please request a new link."));

        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EXPIRED_TOKEN", "Password reset link has expired. Please request a new link.");
        }

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User record not found."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditLogService.recordLog(user.getId(), user.getFullName(), user.getRole().name(), "PASSWORD_RESET", "User", user.getId(), "Password was reset via token", ipAddress);

        return new MessageResponse("Your password has been reset successfully. Please log in with your new credentials.");
    }

    public UserDto getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));
        String deptName = null;
        if (user.getDepartmentId() != null) {
            deptName = departmentRepository.findById(user.getDepartmentId()).map(d -> d.getName()).orElse(null);
        }
        return UserDto.fromEntity(user, deptName);
    }
}
