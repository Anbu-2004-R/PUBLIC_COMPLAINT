package com.civicconnect.admin;

import com.civicconnect.analytics.AnalyticsService;
import com.civicconnect.assignment.AssignmentService;
import com.civicconnect.audit.AuditLog;
import com.civicconnect.audit.AuditLogRepository;
import com.civicconnect.audit.AuditLogService;
import com.civicconnect.category.Category;
import com.civicconnect.category.CategoryRepository;
import com.civicconnect.common.ApiException;
import com.civicconnect.common.PaginatedResult;
import com.civicconnect.complaint.*;
import com.civicconnect.department.Department;
import com.civicconnect.department.DepartmentRepository;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.resolution.ResolutionService;
import com.civicconnect.security.UserPrincipal;
import com.civicconnect.user.*;
import com.civicconnect.ward.WardZone;
import com.civicconnect.ward.WardZoneRepository;
import com.civicconnect.workflow.StatusHistory;
import com.civicconnect.workflow.StatusHistoryRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final WardZoneRepository wardZoneRepository;
    private final CategoryRepository categoryRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final AssignmentService assignmentService;
    private final ResolutionService resolutionService;
    private final NotificationService notificationService;
    private final AnalyticsService analyticsService;

    public AdminController(
            ComplaintRepository complaintRepository,
            ComplaintService complaintService,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            WardZoneRepository wardZoneRepository,
            CategoryRepository categoryRepository,
            StatusHistoryRepository statusHistoryRepository,
            AuditLogRepository auditLogRepository,
            AuditLogService auditLogService,
            AssignmentService assignmentService,
            ResolutionService resolutionService,
            NotificationService notificationService,
            AnalyticsService analyticsService) {
        this.complaintRepository = complaintRepository;
        this.complaintService = complaintService;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.wardZoneRepository = wardZoneRepository;
        this.categoryRepository = categoryRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
        this.assignmentService = assignmentService;
        this.resolutionService = resolutionService;
        this.notificationService = notificationService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/complaints")
    public ResponseEntity<PaginatedResult<ComplaintDto>> getComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String officerId,
            @RequestParam(required = false) String wardZoneId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        ComplaintStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = ComplaintStatus.valueOf(status); } catch (Exception ignored) {}
        }

        ComplaintPriority priorityEnum = null;
        if (priority != null && !priority.isBlank()) {
            try { priorityEnum = ComplaintPriority.valueOf(priority); } catch (Exception ignored) {}
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> complaintPage = complaintRepository.searchAdminComplaints(
                statusEnum,
                priorityEnum,
                departmentId != null && !departmentId.isBlank() ? departmentId : null,
                wardZoneId != null && !wardZoneId.isBlank() ? wardZoneId : null,
                categoryId != null && !categoryId.isBlank() ? categoryId : null,
                officerId != null && !officerId.isBlank() ? officerId : null,
                search != null && !search.isBlank() ? search : null,
                pageable
        );

        List<ComplaintDto> dtos = complaintPage.getContent().stream()
                .map(c -> complaintService.toDto(c, userPrincipal.getUser()))
                .toList();

        return ResponseEntity.ok(new PaginatedResult<>(dtos, page, size, complaintPage.getTotalElements(), complaintPage.getTotalPages()));
    }

    @GetMapping("/complaints/unassigned")
    public ResponseEntity<PaginatedResult<ComplaintDto>> getUnassignedQueue(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> queue = complaintRepository.findByStatus(ComplaintStatus.UNASSIGNED, pageable);

        List<ComplaintDto> dtos = queue.getContent().stream()
                .map(c -> complaintService.toDto(c, userPrincipal.getUser()))
                .toList();

        return ResponseEntity.ok(new PaginatedResult<>(dtos, page, size, queue.getTotalElements(), queue.getTotalPages()));
    }

    @PostMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintDto> assignOfficer(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String officerId = body.get("officerId");
        String reason = body.get("reason");

        if (reason == null || reason.trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "REASON_REQUIRED", "A justification reason is required for administrative assignment.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Officer not found."));

        assignmentService.assignToOfficer(complaint, officer, userPrincipal.getId(), userPrincipal.getUser().getFullName(), reason);

        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @PatchMapping("/complaints/{id}/correction")
    public ResponseEntity<ComplaintDto> correctRouting(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String reason = body.get("reason");
        if (reason == null || reason.trim().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "REASON_REQUIRED", "A reason is required when correcting routing or priority.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        String newCategoryId = body.get("newCategoryId");
        if (newCategoryId != null && !newCategoryId.isBlank()) {
            Category cat = categoryRepository.findById(newCategoryId).orElseThrow();
            complaint.setCategoryId(cat.getId());
            complaint.setDepartmentId(cat.getDepartmentId());
        }

        String newPriority = body.get("newPriority");
        if (newPriority != null && !newPriority.isBlank()) {
            complaint.setPriority(ComplaintPriority.valueOf(newPriority));
            assignmentService.calculateSlaDeadlines(complaint);
        }

        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                id,
                complaint.getStatus(),
                complaint.getStatus(),
                userPrincipal.getId(),
                userPrincipal.getUser().getFullName(),
                UserRole.ADMIN,
                "Administrative correction: " + reason
        ));

        auditLogService.recordLog(
                userPrincipal.getId(),
                userPrincipal.getUser().getFullName(),
                "ADMIN",
                "CORRECT_ROUTING",
                "Complaint",
                id,
                "Routing / Priority adjusted: " + reason,
                request.getRemoteAddr()
        );

        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @PostMapping("/complaints/{id}/escalate")
    public ResponseEntity<ComplaintDto> escalateComplaint(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String reason = body.get("reason");
        Complaint complaint = complaintRepository.findById(id).orElseThrow();

        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.ESCALATED);
        complaint.setPriority(ComplaintPriority.CRITICAL);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                id,
                old,
                ComplaintStatus.ESCALATED,
                userPrincipal.getId(),
                userPrincipal.getUser().getFullName(),
                UserRole.ADMIN,
                "Escalated to critical priority: " + reason
        ));

        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @PostMapping("/complaints/{id}/close")
    public ResponseEntity<ComplaintDto> closeComplaint(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String reason = body.get("reason");
        Complaint complaint = complaintRepository.findById(id).orElseThrow();

        ComplaintStatus old = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.CLOSED);
        complaint.setClosedAt(Instant.now());
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                id,
                old,
                ComplaintStatus.CLOSED,
                userPrincipal.getId(),
                userPrincipal.getUser().getFullName(),
                UserRole.ADMIN,
                "Closed by administrator: " + reason
        ));

        notificationService.createNotification(
                complaint.getCitizenId(),
                UserRole.CITIZEN,
                "Complaint Closed: " + complaint.getId(),
                "Your case has been marked as closed. Note: " + reason,
                "CASE_CLOSED",
                complaint.getId()
        );

        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<ComplaintDto>> getResolutionReviews(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Complaint> reviews = complaintRepository.findByStatus(ComplaintStatus.RESOLUTION_REPORT_SUBMITTED);
        List<ComplaintDto> dtos = reviews.stream()
                .map(c -> complaintService.toDto(c, userPrincipal.getUser()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/reviews/{reportId}/approve")
    public ResponseEntity<ComplaintDto> approveResolutionReport(
            @PathVariable String reportId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String reason = body != null ? body.get("reason") : null;
        Complaint complaint = resolutionService.reviewResolutionReport(reportId, "APPROVED", reason, userPrincipal.getUser(), request.getRemoteAddr());
        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @PostMapping("/reviews/{reportId}/reject")
    public ResponseEntity<ComplaintDto> rejectResolutionReport(
            @PathVariable String reportId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String reason = body.get("reason");
        Complaint complaint = resolutionService.reviewResolutionReport(reportId, "REJECTED", reason, userPrincipal.getUser(), request.getRemoteAddr());
        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        List<User> list;
        if (role != null && !role.isBlank()) {
            try {
                list = userRepository.findByRole(UserRole.valueOf(role));
            } catch (Exception e) {
                list = userRepository.findAll();
            }
        } else {
            list = userRepository.findAll();
        }

        if (search != null && !search.isBlank()) {
            String s = search.toLowerCase();
            list = list.stream().filter(u -> u.getFullName().toLowerCase().contains(s) || u.getEmail().toLowerCase().contains(s)).toList();
        }

        List<UserDto> dtos = list.stream().map(u -> {
            String deptName = u.getDepartmentId() != null ? departmentRepository.findById(u.getDepartmentId()).map(Department::getName).orElse(null) : null;
            return UserDto.fromEntity(u, deptName);
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String status = body.get("status");
        String reason = body.get("reason");

        User user = userRepository.findById(id).orElseThrow();
        user.setAccountStatus(AccountStatus.valueOf(status));
        userRepository.save(user);

        auditLogService.recordLog(
                userPrincipal.getId(),
                userPrincipal.getUser().getFullName(),
                "ADMIN",
                "UPDATE_USER_STATUS",
                "User",
                id,
                "Account status set to " + status + ". Reason: " + reason,
                request.getRemoteAddr()
        );

        String deptName = user.getDepartmentId() != null ? departmentRepository.findById(user.getDepartmentId()).map(Department::getName).orElse(null) : null;
        return ResponseEntity.ok(UserDto.fromEntity(user, deptName));
    }

    @GetMapping("/officers")
    public ResponseEntity<List<UserDto>> getOfficers() {
        List<User> officers = userRepository.findByRole(UserRole.OFFICER);
        List<UserDto> dtos = officers.stream().map(u -> {
            String deptName = u.getDepartmentId() != null ? departmentRepository.findById(u.getDepartmentId()).map(Department::getName).orElse(null) : null;
            return UserDto.fromEntity(u, deptName);
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/officers/{id}/eligibility")
    public ResponseEntity<UserDto> updateOfficerEligibility(
            @PathVariable String id,
            @RequestBody Map<String, Set<String>> body) {
        User user = userRepository.findById(id).orElseThrow();
        if (body.containsKey("eligibleCategoryIds")) {
            user.setEligibleCategoryIds(body.get("eligibleCategoryIds"));
        }
        if (body.containsKey("eligibleZoneIds")) {
            user.setEligibleZoneIds(body.get("eligibleZoneIds"));
        }
        userRepository.save(user);

        String deptName = user.getDepartmentId() != null ? departmentRepository.findById(user.getDepartmentId()).map(Department::getName).orElse(null) : null;
        return ResponseEntity.ok(UserDto.fromEntity(user, deptName));
    }

    @PatchMapping("/officers/{id}/availability")
    public ResponseEntity<UserDto> updateOfficerAvailability(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id).orElseThrow();
        user.setAvailabilityStatus(body.get("availabilityStatus"));
        userRepository.save(user);

        String deptName = user.getDepartmentId() != null ? departmentRepository.findById(user.getDepartmentId()).map(Department::getName).orElse(null) : null;
        return ResponseEntity.ok(UserDto.fromEntity(user, deptName));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> saveDepartment(@RequestBody Department dept) {
        if (dept.getId() == null) dept.setId("dept-" + UUID.randomUUID().toString());
        return ResponseEntity.ok(departmentRepository.save(dept));
    }

    @GetMapping("/zones")
    public ResponseEntity<List<WardZone>> getZones() {
        return ResponseEntity.ok(wardZoneRepository.findAll());
    }

    @PostMapping("/zones")
    public ResponseEntity<WardZone> saveZone(@RequestBody WardZone zone) {
        if (zone.getId() == null) zone.setId("ward-" + UUID.randomUUID().toString());
        return ResponseEntity.ok(wardZoneRepository.save(zone));
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> saveCategory(@RequestBody Category cat) {
        if (cat.getId() == null) cat.setId("cat-" + UUID.randomUUID().toString());
        return ResponseEntity.ok(categoryRepository.save(cat));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(@RequestParam(required = false) String entityType) {
        if (entityType != null && !entityType.isBlank()) {
            return ResponseEntity.ok(auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType));
        }
        return ResponseEntity.ok(auditLogRepository.findTop100ByOrderByCreatedAtDesc());
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/analytics/status-distribution")
    public ResponseEntity<List<Map<String, Object>>> getAnalyticsStatusDistribution() {
        return ResponseEntity.ok(analyticsService.getStatusDistribution());
    }

    @GetMapping("/analytics/department-workload")
    public ResponseEntity<List<Map<String, Object>>> getAnalyticsDepartmentWorkload() {
        return ResponseEntity.ok(analyticsService.getDepartmentWorkload());
    }

    @GetMapping("/analytics/trends")
    public ResponseEntity<List<Map<String, Object>>> getAnalyticsTrends() {
        return ResponseEntity.ok(analyticsService.getTrends());
    }
}
