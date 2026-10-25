package com.civicconnect.common;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {
    private String code;
    private String message;
    private int status;
    private Instant timestamp;
    private Map<String, String> fieldErrors;

    public ErrorResponse() {
        this.timestamp = Instant.now();
    }

    public ErrorResponse(String code, String message, int status) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.timestamp = Instant.now();
    }

    public ErrorResponse(String code, String message, int status, Map<String, String> fieldErrors) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.fieldErrors = fieldErrors;
        this.timestamp = Instant.now();
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public Map<String, String> getFieldErrors() { return fieldErrors; }
    public void setFieldErrors(Map<String, String> fieldErrors) { this.fieldErrors = fieldErrors; }
}
