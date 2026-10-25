package com.civicconnect.auth;

import com.civicconnect.auth.dto.*;
import com.civicconnect.user.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@Valid @RequestBody VerifyEmailRequest req) {
        return ResponseEntity.ok(authService.verifyEmail(req.getToken()));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.resendVerification(body.get("email")));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.forgotPassword(body.get("email")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(authService.resetPassword(req));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
