package com.civicconnect.investigation;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "progress_updates")
public class ProgressUpdate {
    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "complaint_id", nullable = false, length = 64)
    private String complaintId;

    @Column(name = "officer_id", nullable = false, length = 64)
    private String officerId;

    @Column(name = "officer_name", nullable = false, length = 128)
    private String officerName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false, length = 32)
    private String visibility = "CITIZEN_VISIBLE"; // CITIZEN_VISIBLE | INTERNAL_NOTE

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ProgressUpdate() {}

    public ProgressUpdate(String complaintId, String officerId, String officerName, String note, String visibility) {
        this.id = "pu-" + java.util.UUID.randomUUID().toString();
        this.complaintId = complaintId;
        this.officerId = officerId;
        this.officerName = officerName;
        this.note = note;
        this.visibility = visibility != null ? visibility : "CITIZEN_VISIBLE";
        this.createdAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) id = "pu-" + java.util.UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
    public String getOfficerId() { return officerId; }
    public void setOfficerId(String officerId) { this.officerId = officerId; }
    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
