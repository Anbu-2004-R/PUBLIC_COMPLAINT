package com.civicconnect.audit;

import com.civicconnect.user.UserRole;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    @Column(name = "actor_id", nullable = false, length = 64)
    private String actorId;

    @Column(name = "actor_name", nullable = false)
    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_role", nullable = false, length = 32)
    private UserRole actorRole;

    @Column(nullable = false, length = 128)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 64)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "before_value", columnDefinition = "TEXT")
    private String beforeValue;

    @Column(name = "after_value", columnDefinition = "TEXT")
    private String afterValue;

    public AuditLog() {
    }

    public AuditLog(String actorId, String actorName, UserRole actorRole, String action,
                    String entityType, String entityId, String reason, String beforeValue, String afterValue) {
        this.actorId = actorId;
        this.actorName = actorName;
        this.actorRole = actorRole;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.reason = reason;
        this.beforeValue = beforeValue;
        this.afterValue = afterValue;
        this.timestamp = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public void setActorName(String actorName) {
        this.actorName = actorName;
    }

    public UserRole getActorRole() {
        return actorRole;
    }

    public void setActorRole(UserRole actorRole) {
        this.actorRole = actorRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getBeforeValue() {
        return beforeValue;
    }

    public void setBeforeValue(String beforeValue) {
        this.beforeValue = beforeValue;
    }

    public String getAfterValue() {
        return afterValue;
    }

    public void setAfterValue(String afterValue) {
        this.afterValue = afterValue;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "aud-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
