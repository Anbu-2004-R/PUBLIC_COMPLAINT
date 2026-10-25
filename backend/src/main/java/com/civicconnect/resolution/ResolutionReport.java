package com.civicconnect.resolution;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "resolution_reports")
public class ResolutionReport {
    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "complaint_id", nullable = false, length = 64)
    private String complaintId;

    @Column(name = "officer_id", nullable = false, length = 64)
    private String officerId;

    @Column(name = "officer_name", nullable = false, length = 128)
    private String officerName;

    @Column(name = "actions_taken", nullable = false, columnDefinition = "TEXT")
    private String actionsTaken;

    @Column(name = "outcome_description", nullable = false, columnDefinition = "TEXT")
    private String outcomeDescription;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;

    @Column(name = "review_status", nullable = false, length = 32)
    private String reviewStatus = "PENDING_REVIEW"; // PENDING_REVIEW | APPROVED | REJECTED

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();

    @Column(name = "reviewer_id", length = 64)
    private String reviewerId;

    @Column(name = "reviewer_name", length = 128)
    private String reviewerName;

    @Column(name = "review_reason", columnDefinition = "TEXT")
    private String reviewReason;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public ResolutionReport() {}

    public ResolutionReport(String complaintId, String officerId, String officerName, String actionsTaken, String outcomeDescription, LocalDate completionDate) {
        this.id = "rr-" + java.util.UUID.randomUUID().toString();
        this.complaintId = complaintId;
        this.officerId = officerId;
        this.officerName = officerName;
        this.actionsTaken = actionsTaken;
        this.outcomeDescription = outcomeDescription;
        this.completionDate = completionDate;
        this.submittedAt = Instant.now();
        this.reviewStatus = "PENDING_REVIEW";
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) id = "rr-" + java.util.UUID.randomUUID().toString();
        if (submittedAt == null) submittedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
    public String getOfficerId() { return officerId; }
    public void setOfficerId(String officerId) { this.officerId = officerId; }
    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }
    public String getActionsTaken() { return actionsTaken; }
    public void setActionsTaken(String actionsTaken) { this.actionsTaken = actionsTaken; }
    public String getOutcomeDescription() { return outcomeDescription; }
    public void setOutcomeDescription(String outcomeDescription) { this.outcomeDescription = outcomeDescription; }
    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }
    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public String getReviewerId() { return reviewerId; }
    public void setReviewerId(String reviewerId) { this.reviewerId = reviewerId; }
    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }
    public String getReviewReason() { return reviewReason; }
    public void setReviewReason(String reviewReason) { this.reviewReason = reviewReason; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
}
