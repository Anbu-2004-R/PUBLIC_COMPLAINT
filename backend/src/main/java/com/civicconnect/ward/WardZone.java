package com.civicconnect.ward;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "wards_zones")
public class WardZone {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 64)
    private String zone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "active_status", nullable = false)
    private boolean activeStatus = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public WardZone() {}

    public WardZone(String id, String name, String code, String zone, String description, boolean activeStatus) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.zone = zone;
        this.description = description;
        this.activeStatus = activeStatus;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isActiveStatus() { return activeStatus; }
    public void setActiveStatus(boolean activeStatus) { this.activeStatus = activeStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
