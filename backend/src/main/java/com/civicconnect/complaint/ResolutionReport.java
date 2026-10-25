package com.civicconnect.complaint;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    @Column(name = "officer_name", nullable = false)
    private String officerName;

    @Column(name = "actions_taken", nullable = false, columnDefinition = "TEXT")
    private String actionsTaken;

    @Column(name = "outcome_description", nullable = false, columnDefinition = "TEXT")
    private String outcomeDescription;

    @Column(name = "completion_date", nullable = false, length = 64)
    private String completionDate;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();

    @Column(name = "review_status", nullable = false, length = 32)
    private String reviewStatus = "PENDING_REVIEW"; // PENDING_REVIEW, APPROVED, REJECTED

    @Column(name = "reviewer_name")
    private String reviewerName;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "admin_reason", columnDefinition = "TEXT")
    private String adminReason;

    @Transient
    private List<ComplaintAttachment> evidenceAttachments = new ArrayList<>();

    public ResolutionReport() {
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

    public String getOfficerId() {
        return officerId;
    }

    public void setOfficerId(String officerId) {
        this.officerId = officerId;
    }

    public String getOfficerName() {
        return officerName;
    }

    public void setOfficerName(String officerName) {
        this.officerName = officerName;
    }

    public String getActionsTaken() {
        return actionsTaken;
    }

    public void setActionsTaken(String actionsTaken) {
        this.actionsTaken = actionsTaken;
    }

    public String getOutcomeDescription() {
        return outcomeDescription;
    }

    public void setOutcomeDescription(String outcomeDescription) {
        this.outcomeDescription = outcomeDescription;
    }

    public String getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(String completionDate) {
        this.completionDate = completionDate;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getAdminReason() {
        return adminReason;
    }

    public void setAdminReason(String adminReason) {
        this.adminReason = adminReason;
    }

    public List<ComplaintAttachment> getEvidenceAttachments() {
        return evidenceAttachments;
    }

    public void setEvidenceAttachments(List<ComplaintAttachment> evidenceAttachments) {
        this.evidenceAttachments = evidenceAttachments;
    }

    @JsonProperty("adminDecision")
    public Map<String, Object> getAdminDecision() {
        if (reviewerName != null || reviewedAt != null) {
            return Map.of(
                    "decision", "APPROVED".equalsIgnoreCase(reviewStatus) ? "APPROVED" : "REJECTED",
                    "reviewerName", reviewerName != null ? reviewerName : "Administrator",
                    "reviewedAt", reviewedAt != null ? reviewedAt.toString() : Instant.now().toString(),
                    "reason", adminReason != null ? adminReason : ""
            );
        }
        return null;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "rep-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (submittedAt == null) {
            submittedAt = Instant.now();
        }
    }
}
