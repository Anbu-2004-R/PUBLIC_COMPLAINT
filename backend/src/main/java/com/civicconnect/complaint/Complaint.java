package com.civicconnect.complaint;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "complaints")
public class Complaint {
    @Id
    @Column(length = 64)
    private String id; // e.g. "CP-2026-1001"

    @Column(name = "citizen_id", nullable = false, length = 64)
    private String citizenId;

    @Column(name = "category_id", nullable = false, length = 64)
    private String categoryId;

    @Column(name = "department_id", nullable = false, length = 64)
    private String departmentId;

    @Column(name = "ward_zone_id", nullable = false, length = 64)
    private String wardZoneId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "exact_location", nullable = false)
    private String exactLocation;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "incident_date")
    private LocalDate incidentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ComplaintPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @Column(name = "assigned_officer_id", length = 64)
    private String assignedOfficerId;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Column(name = "ack_deadline")
    private Instant ackDeadline;

    @Column(name = "action_deadline")
    private Instant actionDeadline;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;

    @Column(name = "action_started_at")
    private Instant actionStartedAt;

    @Column(name = "objection_window_end")
    private Instant objectionWindowEnd;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "is_paused", nullable = false)
    private boolean isPaused = false;

    @Column(name = "pause_reason")
    private String pauseReason;

    @Column(name = "pending_withdrawal_reason")
    private String pendingWithdrawalReason;

    @Column(name = "pending_reopen_reason")
    private String pendingReopenReason;

    @Column(name = "idempotency_key", unique = true, length = 128)
    private String idempotencyKey;

    @Version
    private Long version = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Complaint() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public String getWardZoneId() { return wardZoneId; }
    public void setWardZoneId(String wardZoneId) { this.wardZoneId = wardZoneId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getExactLocation() { return exactLocation; }
    public void setExactLocation(String exactLocation) { this.exactLocation = exactLocation; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }
    public ComplaintPriority getPriority() { return priority; }
    public void setPriority(ComplaintPriority priority) { this.priority = priority; }
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public String getAssignedOfficerId() { return assignedOfficerId; }
    public void setAssignedOfficerId(String assignedOfficerId) { this.assignedOfficerId = assignedOfficerId; }
    public Instant getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }
    public Instant getAckDeadline() { return ackDeadline; }
    public void setAckDeadline(Instant ackDeadline) { this.ackDeadline = ackDeadline; }
    public Instant getActionDeadline() { return actionDeadline; }
    public void setActionDeadline(Instant actionDeadline) { this.actionDeadline = actionDeadline; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public Instant getActionStartedAt() { return actionStartedAt; }
    public void setActionStartedAt(Instant actionStartedAt) { this.actionStartedAt = actionStartedAt; }
    public Instant getObjectionWindowEnd() { return objectionWindowEnd; }
    public void setObjectionWindowEnd(Instant objectionWindowEnd) { this.objectionWindowEnd = objectionWindowEnd; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public boolean isPaused() { return isPaused; }
    public void setPaused(boolean paused) { isPaused = paused; }
    public String getPauseReason() { return pauseReason; }
    public void setPauseReason(String pauseReason) { this.pauseReason = pauseReason; }
    public String getPendingWithdrawalReason() { return pendingWithdrawalReason; }
    public void setPendingWithdrawalReason(String pendingWithdrawalReason) { this.pendingWithdrawalReason = pendingWithdrawalReason; }
    public String getPendingReopenReason() { return pendingReopenReason; }
    public void setPendingReopenReason(String pendingReopenReason) { this.pendingReopenReason = pendingReopenReason; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
