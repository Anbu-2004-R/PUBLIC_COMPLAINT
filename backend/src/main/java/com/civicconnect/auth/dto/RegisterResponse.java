package com.civicconnect.auth.dto;

public class RegisterResponse {
    private String message;
    private boolean emailVerificationSent;

    public RegisterResponse() {}

    public RegisterResponse(String message, boolean emailVerificationSent) {
        this.message = message;
        this.emailVerificationSent = emailVerificationSent;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isEmailVerificationSent() { return emailVerificationSent; }
    public void setEmailVerificationSent(boolean emailVerificationSent) { this.emailVerificationSent = emailVerificationSent; }
}
