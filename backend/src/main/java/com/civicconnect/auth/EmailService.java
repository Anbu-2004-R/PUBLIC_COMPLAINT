package com.civicconnect.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${civicconnect.app.client-url:http://localhost:3000}")
    private String clientUrl;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String token) {
        String verificationUrl = clientUrl + "/verify-email?token=" + token;
        String subject = "Verify Your CivicPulse Account";
        String body = String.format("Hello %s,\n\nThank you for registering on CivicPulse.\nPlease verify your email address by clicking the link below:\n\n%s\n\nThis link will expire in 24 hours.\n\nCivicPulse Administration", fullName, verificationUrl);

        sendMail(toEmail, subject, body);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
        String resetUrl = clientUrl + "/reset-password?token=" + token;
        String subject = "Reset Your CivicPulse Password";
        String body = String.format("Hello %s,\n\nA password reset request was received for your CivicPulse account.\nYou can reset your password using the link below:\n\n%s\n\nThis link will expire in 1 hour.\nIf you did not request this, please ignore this email.\n\nCivicPulse Administration", fullName, resetUrl);

        sendMail(toEmail, subject, body);
    }

    private void sendMail(String to, String subject, String text) {
        if (mailSender == null || fromEmail == null || fromEmail.trim().isEmpty()) {
            log.info("[CivicPulse Mail Mock/Dev] To: {} | Subject: {}\nBody:\n{}", to, subject, text);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
        } catch (Exception e) {
            log.warn("Failed to dispatch email to {}: {}. Link/message was: {}", to, e.getMessage(), text);
        }
    }
}
