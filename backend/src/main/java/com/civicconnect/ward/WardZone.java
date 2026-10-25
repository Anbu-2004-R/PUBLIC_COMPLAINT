package com.civicconnect.ward;

import jakarta.persistence.*;

@Entity
@Table(name = "ward_zones")
public class WardZone {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 64)
    private String zone; // North, South, East, West, Central

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "active_status", nullable = false)
    private boolean activeStatus = true;

    public WardZone() {}

    public WardZone(String id, String name, String code, String zone, String description, boolean activeStatus) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.zone = zone;
        this.description = description;
        this.activeStatus = activeStatus;
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
}
