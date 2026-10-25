package com.civicconnect.notification;

import com.civicconnect.user.UserRole;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "recipient_id", nullable = false, length = 64)
    private String recipientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_role", nullable = false, length = 32)
    private UserRole recipientRole;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 64)
    private String type;

    @Column(name = "related_complaint_id", length = 64)
    private String relatedComplaintId;

    @JsonProperty("read")
    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "email_delivery_status", nullable = false, length = 32)
    private String emailDeliveryStatus = "PENDING"; // PENDING, SENT, FAILED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Notification() {
    }

    public Notification(String recipientId, UserRole recipientRole, String title, String message,
                        String type, String relatedComplaintId) {
        this.recipientId = recipientId;
        this.recipientRole = recipientRole;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedComplaintId = relatedComplaintId;
        this.read = false;
        this.emailDeliveryStatus = "SENT";
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public UserRole getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(UserRole recipientRole) {
        this.recipientRole = recipientRole;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRelatedComplaintId() {
        return relatedComplaintId;
    }

    public void setRelatedComplaintId(String relatedComplaintId) {
        this.relatedComplaintId = relatedComplaintId;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getEmailDeliveryStatus() {
        return emailDeliveryStatus;
    }

    public void setEmailDeliveryStatus(String emailDeliveryStatus) {
        this.emailDeliveryStatus = emailDeliveryStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "notif-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
