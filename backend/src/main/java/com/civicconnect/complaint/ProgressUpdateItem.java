package com.civicconnect.complaint;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "complaint_progress_updates")
public class ProgressUpdateItem {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "complaint_id", nullable = false, length = 64)
    private String complaintId;

    @Column(name = "officer_id", nullable = false, length = 64)
    private String officerId;

    @Column(name = "officer_name", nullable = false)
    private String officerName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false, length = 32)
    private String visibility = "CITIZEN_VISIBLE"; // CITIZEN_VISIBLE, INTERNAL_NOTE

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    public ProgressUpdateItem() {
    }

    public ProgressUpdateItem(String complaintId, String officerId, String officerName, String note, String visibility) {
        this.complaintId = complaintId;
        this.officerId = officerId;
        this.officerName = officerName;
        this.note = note;
        this.visibility = visibility;
        this.timestamp = Instant.now();
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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "upd-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
