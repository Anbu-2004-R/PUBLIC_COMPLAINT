package com.civicconnect.complaint;

import com.civicconnect.user.UserRole;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "complaint_status_history")
public class StatusHistoryItem {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "complaint_id", nullable = false, length = 64)
    private String complaintId;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 64)
    private ComplaintStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 64)
    private ComplaintStatus newStatus;

    @Column(name = "changed_by", nullable = false, length = 64)
    private String changedBy;

    @Column(name = "changed_by_name", nullable = false)
    private String changedByName;

    @Enumerated(EnumType.STRING)
    @Column(name = "changed_by_role", nullable = false, length = 32)
    private UserRole changedByRole;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt = Instant.now();

    public StatusHistoryItem() {
    }

    public StatusHistoryItem(String complaintId, ComplaintStatus oldStatus, ComplaintStatus newStatus,
                             String changedBy, String changedByName, UserRole changedByRole, String reason) {
        this.complaintId = complaintId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.changedByName = changedByName;
        this.changedByRole = changedByRole;
        this.reason = reason;
        this.changedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(String complaintId) {
        this.complaintId = complaintId;
    }

    public ComplaintStatus getOldStatus() {
        return oldStatus;
    }

    public void setOldStatus(ComplaintStatus oldStatus) {
        this.oldStatus = oldStatus;
    }

    public ComplaintStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ComplaintStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public String getChangedByName() {
        return changedByName;
    }

    public void setChangedByName(String changedByName) {
        this.changedByName = changedByName;
    }

    public UserRole getChangedByRole() {
        return changedByRole;
    }

    public void setChangedByRole(UserRole changedByRole) {
        this.changedByRole = changedByRole;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Instant getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(Instant changedAt) {
        this.changedAt = changedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "hist-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (changedAt == null) {
            changedAt = Instant.now();
        }
    }
}
