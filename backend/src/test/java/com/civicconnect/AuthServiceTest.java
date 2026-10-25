package com.civicconnect;

import com.civicconnect.audit.AuditLogService;
import com.civicconnect.auth.*;
import com.civicconnect.common.ApiException;
import com.civicconnect.department.DepartmentRepository;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.security.JwtTokenProvider;
import com.civicconnect.user.AccountStatus;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                departmentRepository,
                passwordEncoder,
                jwtTokenProvider,
                emailVerificationTokenRepository,
                passwordResetTokenRepository,
                notificationService,
                auditLogService
        );
    }

    @Test
    void testLoginSuccess() {
        User user = new User();
        user.setId("u-1");
        user.setEmail("citizen@civicpulse.org");
        user.setFullName("Rahul Sharma");
        user.setPasswordHash("hashed_password");
        user.setRole(UserRole.CITIZEN);
        user.setAccountStatus(AccountStatus.ACTIVE);

        when(userRepository.findByEmailIgnoreCase("citizen@civicpulse.org")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password@123", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");

        LoginResponse res = authService.login("citizen@civicpulse.org", "Password@123", "127.0.0.1");

        assertNotNull(res);
        assertEquals("mock-jwt-token", res.getToken());
        assertEquals("Rahul Sharma", res.getUser().getFullName());
    }

    @Test
    void testLoginInvalidPasswordThrows() {
        User user = new User();
        user.setEmail("citizen@civicpulse.org");
        user.setPasswordHash("hashed_password");
        user.setAccountStatus(AccountStatus.ACTIVE);

        when(userRepository.findByEmailIgnoreCase("citizen@civicpulse.org")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        assertThrows(ApiException.class, () -> authService.login("citizen@civicpulse.org", "WrongPassword", "127.0.0.1"));
    }

    @Test
    void testRegisterDuplicateEmailThrows() {
        when(userRepository.existsByEmailIgnoreCase("taken@civicpulse.org")).thenReturn(true);

        RegisterRequest req = new RegisterRequest();
        req.setEmail("taken@civicpulse.org");
        req.setFullName("Test User");
        req.setPhone("1234567890");
        req.setPassword("secret123");

        assertThrows(ApiException.class, () -> authService.register(req, "127.0.0.1"));
    }
}
