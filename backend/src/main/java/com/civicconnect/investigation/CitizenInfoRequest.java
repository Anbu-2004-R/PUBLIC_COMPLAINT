package com.civicconnect.investigation;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "citizen_information_requests")
public class CitizenInfoRequest {
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
    private String message;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "responded_at")
    private Instant respondedAt;

    public CitizenInfoRequest() {}

    public CitizenInfoRequest(String complaintId, String officerId, String officerName, String message) {
        this.id = "cir-" + java.util.UUID.randomUUID().toString();
        this.complaintId = complaintId;
        this.officerId = officerId;
        this.officerName = officerName;
        this.message = message;
        this.requestedAt = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) id = "cir-" + java.util.UUID.randomUUID().toString();
        if (requestedAt == null) requestedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
    public String getOfficerId() { return officerId; }
    public void setOfficerId(String officerId) { this.officerId = officerId; }
    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public Instant getRequestedAt() { return requestedAt; }
    public void setRequestedAt(Instant requestedAt) { this.requestedAt = requestedAt; }
    public Instant getRespondedAt() { return respondedAt; }
    public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }
}
