package com.civicconnect.department;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "head_officer_name")
    private String headOfficerName;

    @Column(name = "active_status", nullable = false)
    private boolean activeStatus = true;

    public Department() {}

    public Department(String id, String name, String code, String description, String headOfficerName, boolean activeStatus) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.headOfficerName = headOfficerName;
        this.activeStatus = activeStatus;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHeadOfficerName() { return headOfficerName; }
    public void setHeadOfficerName(String headOfficerName) { this.headOfficerName = headOfficerName; }

    public boolean isActiveStatus() { return activeStatus; }
    public void setActiveStatus(boolean activeStatus) { this.activeStatus = activeStatus; }
}
