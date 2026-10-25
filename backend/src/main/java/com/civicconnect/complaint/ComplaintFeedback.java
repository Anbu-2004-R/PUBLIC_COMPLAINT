package com.civicconnect.complaint;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "complaint_feedback")
public class ComplaintFeedback {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "complaint_id", nullable = false, length = 64, unique = true)
    private String complaintId;

    @Column(name = "citizen_id", nullable = false, length = 64)
    private String citizenId;

    @Column(nullable = false)
    private int rating; // 1-5

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();

    public ComplaintFeedback() {
    }

    public ComplaintFeedback(String complaintId, String citizenId, int rating, String comment) {
        this.complaintId = complaintId;
        this.citizenId = citizenId;
        this.rating = rating;
        this.comment = comment;
        this.submittedAt = Instant.now();
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

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "fb-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (submittedAt == null) {
            submittedAt = Instant.now();
        }
    }
}
