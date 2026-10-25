package com.civicconnect.user;

import com.civicconnect.audit.AuditLog;
import com.civicconnect.audit.AuditLogRepository;
import com.civicconnect.common.ApiException;
import com.civicconnect.department.DepartmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditLogRepository;

    public UserController(UserRepository userRepository,
                          DepartmentRepository departmentRepository,
                          AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(@RequestParam(required = false) String role,
                                               @RequestParam(required = false) String search) {
        List<User> list = userRepository.findAll();
        if (role != null && !role.trim().isEmpty()) {
            list = list.stream()
                    .filter(u -> u.getRole().name().equalsIgnoreCase(role))
                    .collect(Collectors.toList());
        }
        if (search != null && !search.trim().isEmpty()) {
            String s = search.toLowerCase();
            list = list.stream()
                    .filter(u -> u.getFullName().toLowerCase().contains(s) || u.getEmail().toLowerCase().contains(s))
                    .collect(Collectors.toList());
        }
        list.forEach(this::enrichDepartment);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/users/{userId}/status")
    @Transactional
    public ResponseEntity<User> updateUserStatus(@PathVariable String userId,
                                                 @RequestBody Map<String, String> body,
                                                 Authentication authentication) {
        String status = body.get("status");
        String reason = body.get("reason");

        if (status == null || (!status.equalsIgnoreCase("ACTIVE") && !status.equalsIgnoreCase("DEACTIVATED"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Status must be ACTIVE or DEACTIVATED");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        String oldStatus = user.getAccountStatus();
        user.setAccountStatus(status.toUpperCase());
        User updated = userRepository.save(user);
        enrichDepartment(updated);

        // Audit Log
        String adminId = (String) authentication.getPrincipal();
        User admin = userRepository.findById(adminId).orElse(null);
        auditLogRepository.save(new AuditLog(
                adminId,
                admin != null ? admin.getFullName() : "Administrator",
                UserRole.ADMIN,
                "USER_STATUS_CHANGE",
                "USER",
                userId,
                reason,
                oldStatus,
                status.toUpperCase()
        ));

        return ResponseEntity.ok(updated);
    }

    @GetMapping("/officers")
    public ResponseEntity<List<User>> getOfficers() {
        List<User> officers = userRepository.findByRole(UserRole.OFFICER);
        officers.forEach(this::enrichDepartment);
        return ResponseEntity.ok(officers);
    }

    @PutMapping("/officers/{officerId}/eligibility")
    @Transactional
    public ResponseEntity<User> updateOfficerEligibility(@PathVariable String officerId,
                                                         @RequestBody Map<String, Set<String>> body,
                                                         Authentication authentication) {
        User user = userRepository.findById(officerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Officer not found"));

        if (user.getRole() != UserRole.OFFICER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NOT_AN_OFFICER", "Selected user is not an officer");
        }

        Set<String> categories = body.get("eligibleCategoryIds");
        Set<String> zones = body.get("eligibleZoneIds");

        if (categories != null) user.setEligibleCategoryIds(categories);
        if (zones != null) user.setEligibleZoneIds(zones);

        User saved = userRepository.save(user);
        enrichDepartment(saved);

        String adminId = (String) authentication.getPrincipal();
        User admin = userRepository.findById(adminId).orElse(null);
        auditLogRepository.save(new AuditLog(
                adminId,
                admin != null ? admin.getFullName() : "Administrator",
                UserRole.ADMIN,
                "OFFICER_ELIGIBILITY_UPDATE",
                "USER",
                officerId,
                "Updated eligible categories and ward zones",
                null,
                null
        ));

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/officers/{officerId}/availability")
    @Transactional
    public ResponseEntity<User> updateOfficerAvailability(@PathVariable String officerId,
                                                          @RequestBody Map<String, String> body) {
        User user = userRepository.findById(officerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Officer not found"));

        String availability = body.get("availabilityStatus");
        if (availability == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_AVAILABILITY", "availabilityStatus is required");
        }

        user.setAvailabilityStatus(availability.toUpperCase());
        User saved = userRepository.save(user);
        enrichDepartment(saved);
        return ResponseEntity.ok(saved);
    }

    private void enrichDepartment(User user) {
        if (user.getDepartmentId() != null) {
            departmentRepository.findById(user.getDepartmentId())
                    .ifPresent(d -> user.setDepartmentName(d.getName()));
        }
    }
}
