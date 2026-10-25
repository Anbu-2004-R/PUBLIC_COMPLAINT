package com.civicconnect.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyEmailRequest {
    @NotBlank(message = "Verification token is required")
    private String token;

    public VerifyEmailRequest() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
