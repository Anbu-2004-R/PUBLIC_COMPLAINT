package com.civicconnect.complaint;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "citizen_id", nullable = false, length = 64)
    private String citizenId;

    @Column(name = "citizen_name", nullable = false)
    private String citizenName;

    @Column(name = "citizen_phone", nullable = false, length = 32)
    private String citizenPhone;

    @Column(name = "citizen_email", nullable = false)
    private String citizenEmail;

    @Column(name = "category_id", nullable = false, length = 64)
    private String categoryId;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "department_id", nullable = false, length = 64)
    private String departmentId;

    @Column(name = "department_name", nullable = false)
    private String departmentName;

    @Column(name = "ward_zone_id", nullable = false, length = 64)
    private String wardZoneId;

    @Column(name = "ward_zone_name", nullable = false)
    private String wardZoneName;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "exact_location", nullable = false, length = 500)
    private String exactLocation;

    @Column(name = "incident_date", length = 64)
    private String incidentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ComplaintPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private ComplaintStatus status;

    @Column(name = "assigned_officer_id", length = 64)
    private String assignedOfficerId;

    @Column(name = "assigned_officer_name")
    private String assignedOfficerName;

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

    @Column(name = "pause_reason", columnDefinition = "TEXT")
    private String pauseReason;

    @Column(name = "pending_withdrawal_reason", columnDefinition = "TEXT")
    private String pendingWithdrawalReason;

    @Column(name = "pending_reopen_reason", columnDefinition = "TEXT")
    private String pendingReopenReason;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @Transient
    private List<ComplaintAttachment> attachments = new ArrayList<>();

    @Transient
    private List<StatusHistoryItem> history = new ArrayList<>();

    @Transient
    private List<ProgressUpdateItem> progressUpdates = new ArrayList<>();

    @Transient
    private List<CitizenInfoRequest> infoRequests = new ArrayList<>();

    @Transient
    private List<ResolutionReport> resolutionReports = new ArrayList<>();

    @Transient
    private ComplaintFeedback feedback;

    @Transient
    private List<String> allowedActions = new ArrayList<>();

    public Complaint() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public void setCitizenName(String citizenName) {
        this.citizenName = citizenName;
    }

    public String getCitizenPhone() {
        return citizenPhone;
    }

    public void setCitizenPhone(String citizenPhone) {
        this.citizenPhone = citizenPhone;
    }

    public String getCitizenEmail() {
        return citizenEmail;
    }

    public void setCitizenEmail(String citizenEmail) {
        this.citizenEmail = citizenEmail;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getWardZoneId() {
        return wardZoneId;
    }

    public void setWardZoneId(String wardZoneId) {
        this.wardZoneId = wardZoneId;
    }

    public String getWardZoneName() {
        return wardZoneName;
    }

    public void setWardZoneName(String wardZoneName) {
        this.wardZoneName = wardZoneName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExactLocation() {
        return exactLocation;
    }

    public void setExactLocation(String exactLocation) {
        this.exactLocation = exactLocation;
    }

    public String getIncidentDate() {
        return incidentDate;
    }

    public void setIncidentDate(String incidentDate) {
        this.incidentDate = incidentDate;
    }

    public ComplaintPriority getPriority() {
        return priority;
    }

    public void setPriority(ComplaintPriority priority) {
        this.priority = priority;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(String assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
    }

    public String getAssignedOfficerName() {
        return assignedOfficerName;
    }

    public void setAssignedOfficerName(String assignedOfficerName) {
        this.assignedOfficerName = assignedOfficerName;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Instant assignedAt) {
        this.assignedAt = assignedAt;
    }

    public Instant getAckDeadline() {
        return ackDeadline;
    }

    public void setAckDeadline(Instant ackDeadline) {
        this.ackDeadline = ackDeadline;
    }

    public Instant getActionDeadline() {
        return actionDeadline;
    }

    public void setActionDeadline(Instant actionDeadline) {
        this.actionDeadline = actionDeadline;
    }

    public Instant getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(Instant acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public Instant getActionStartedAt() {
        return actionStartedAt;
    }

    public void setActionStartedAt(Instant actionStartedAt) {
        this.actionStartedAt = actionStartedAt;
    }

    public Instant getObjectionWindowEnd() {
        return objectionWindowEnd;
    }

    public void setObjectionWindowEnd(Instant objectionWindowEnd) {
        this.objectionWindowEnd = objectionWindowEnd;
    }

    public Instant getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(Instant closedAt) {
        this.closedAt = closedAt;
    }

    public boolean isPaused() {
        return isPaused;
    }

    public void setPaused(boolean paused) {
        isPaused = paused;
    }

    public String getPauseReason() {
        return pauseReason;
    }

    public void setPauseReason(String pauseReason) {
        this.pauseReason = pauseReason;
    }

    public String getPendingWithdrawalReason() {
        return pendingWithdrawalReason;
    }

    public void setPendingWithdrawalReason(String pendingWithdrawalReason) {
        this.pendingWithdrawalReason = pendingWithdrawalReason;
    }

    public String getPendingReopenReason() {
        return pendingReopenReason;
    }

    public void setPendingReopenReason(String pendingReopenReason) {
        this.pendingReopenReason = pendingReopenReason;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ComplaintAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<ComplaintAttachment> attachments) {
        this.attachments = attachments;
    }

    public List<StatusHistoryItem> getHistory() {
        return history;
    }

    public void setHistory(List<StatusHistoryItem> history) {
        this.history = history;
    }

    public List<ProgressUpdateItem> getProgressUpdates() {
        return progressUpdates;
    }

    public void setProgressUpdates(List<ProgressUpdateItem> progressUpdates) {
        this.progressUpdates = progressUpdates;
    }

    public List<CitizenInfoRequest> getInfoRequests() {
        return infoRequests;
    }

    public void setInfoRequests(List<CitizenInfoRequest> infoRequests) {
        this.infoRequests = infoRequests;
    }

    public List<ResolutionReport> getResolutionReports() {
        return resolutionReports;
    }

    public void setResolutionReports(List<ResolutionReport> resolutionReports) {
        this.resolutionReports = resolutionReports;
    }

    public ComplaintFeedback getFeedback() {
        return feedback;
    }

    public void setFeedback(ComplaintFeedback feedback) {
        this.feedback = feedback;
    }

    public List<String> getAllowedActions() {
        return allowedActions;
    }

    public void setAllowedActions(List<String> allowedActions) {
        this.allowedActions = allowedActions;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "CP-2026-" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        }
        if (submittedAt == null) {
            submittedAt = Instant.now();
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
