package com.civicconnect.category;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_priority", nullable = false, length = 32)
    private String defaultPriority = "MEDIUM";

    @Column(name = "department_id", nullable = false, length = 64)
    private String departmentId;

    @Column(name = "active_status", nullable = false)
    private boolean activeStatus = true;

    public Category() {}

    public Category(String id, String name, String description, String defaultPriority, String departmentId, boolean activeStatus) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.defaultPriority = defaultPriority;
        this.departmentId = departmentId;
        this.activeStatus = activeStatus;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDefaultPriority() { return defaultPriority; }
    public void setDefaultPriority(String defaultPriority) { this.defaultPriority = defaultPriority; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public boolean isActiveStatus() { return activeStatus; }
    public void setActiveStatus(boolean activeStatus) { this.activeStatus = activeStatus; }
}
