package com.civicconnect.user;

import java.time.Instant;
import java.util.Set;

public class UserDto {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private boolean emailVerified;
    private String accountStatus;
    private String employeeId;
    private String departmentId;
    private String departmentName;
    private String availabilityStatus;
    private Set<String> eligibleCategoryIds;
    private Set<String> eligibleZoneIds;
    private Instant createdAt;

    public UserDto() {}

    public static UserDto fromEntity(User user, String departmentName) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setEmailVerified(user.isEmailVerified());
        dto.setAccountStatus(user.getAccountStatus().name());
        dto.setEmployeeId(user.getEmployeeId());
        dto.setDepartmentId(user.getDepartmentId());
        dto.setDepartmentName(departmentName);
        dto.setAvailabilityStatus(user.getAvailabilityStatus());
        dto.setEligibleCategoryIds(user.getEligibleCategoryIds());
        dto.setEligibleZoneIds(user.getEligibleZoneIds());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }
    public Set<String> getEligibleCategoryIds() { return eligibleCategoryIds; }
    public void setEligibleCategoryIds(Set<String> eligibleCategoryIds) { this.eligibleCategoryIds = eligibleCategoryIds; }
    public Set<String> getEligibleZoneIds() { return eligibleZoneIds; }
    public void setEligibleZoneIds(Set<String> eligibleZoneIds) { this.eligibleZoneIds = eligibleZoneIds; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
