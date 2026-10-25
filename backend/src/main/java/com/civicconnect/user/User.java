package com.civicconnect.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 32)
    private String phone;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private UserRole role;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "account_status", nullable = false, length = 32)
    private String accountStatus = "ACTIVE"; // ACTIVE, DEACTIVATED

    @Column(name = "employee_id", length = 64)
    private String employeeId;

    @Column(name = "department_id", length = 64)
    private String departmentId;

    @Transient
    private String departmentName;

    @Column(name = "availability_status", length = 32)
    private String availabilityStatus = "AVAILABLE"; // AVAILABLE, ON_LEAVE, BUSY

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "officer_eligible_categories", joinColumns = @JoinColumn(name = "officer_id"))
    @Column(name = "category_id")
    private Set<String> eligibleCategoryIds = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "officer_eligible_zones", joinColumns = @JoinColumn(name = "officer_id"))
    @Column(name = "ward_zone_id")
    private Set<String> eligibleZoneIds = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public User() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @JsonIgnore
    public String getPasswordHash() {
        return passwordHash;
    }

    @JsonProperty
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public Set<String> getEligibleCategoryIds() {
        return eligibleCategoryIds;
    }

    public void setEligibleCategoryIds(Set<String> eligibleCategoryIds) {
        this.eligibleCategoryIds = eligibleCategoryIds;
    }

    public Set<String> getEligibleZoneIds() {
        return eligibleZoneIds;
    }

    public void setEligibleZoneIds(Set<String> eligibleZoneIds) {
        this.eligibleZoneIds = eligibleZoneIds;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "usr-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
