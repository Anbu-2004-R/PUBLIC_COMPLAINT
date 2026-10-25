package com.civicconnect.complaint;

import com.civicconnect.audit.AuditLog;
import com.civicconnect.audit.AuditLogRepository;
import com.civicconnect.category.Category;
import com.civicconnect.category.CategoryRepository;
import com.civicconnect.common.ApiException;
import com.civicconnect.common.PaginatedResult;
import com.civicconnect.department.Department;
import com.civicconnect.department.DepartmentRepository;
import com.civicconnect.notification.Notification;
import com.civicconnect.notification.NotificationRepository;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.user.UserRole;
import com.civicconnect.ward.WardZone;
import com.civicconnect.ward.WardZoneRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintAttachmentRepository attachmentRepository;
    private final StatusHistoryRepository historyRepository;
    private final ProgressUpdateRepository progressRepository;
    private final CitizenInfoRequestRepository infoRequestRepository;
    private final ResolutionReportRepository resolutionRepository;
    private final ComplaintFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final WardZoneRepository wardZoneRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintAttachmentRepository attachmentRepository,
                            StatusHistoryRepository historyRepository,
                            ProgressUpdateRepository progressRepository,
                            CitizenInfoRequestRepository infoRequestRepository,
                            ResolutionReportRepository resolutionRepository,
                            ComplaintFeedbackRepository feedbackRepository,
                            UserRepository userRepository,
                            CategoryRepository categoryRepository,
                            DepartmentRepository departmentRepository,
                            WardZoneRepository wardZoneRepository,
                            NotificationRepository notificationRepository,
                            AuditLogRepository auditLogRepository) {
        this.complaintRepository = complaintRepository;
        this.attachmentRepository = attachmentRepository;
        this.historyRepository = historyRepository;
        this.progressRepository = progressRepository;
        this.infoRequestRepository = infoRequestRepository;
        this.resolutionRepository = resolutionRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.wardZoneRepository = wardZoneRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public PaginatedResult<Complaint> getCitizenComplaints(String citizenId, String search, String status,
                                                           String categoryId, String priority, int page, int size) {
        Specification<Complaint> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("citizenId"), citizenId));

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("id")), pattern)
                ));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), ComplaintStatus.valueOf(status.toUpperCase())));
            }
            if (categoryId != null && !categoryId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }
            if (priority != null && !priority.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("priority"), ComplaintPriority.valueOf(priority.toUpperCase())));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<Complaint> resultPage = complaintRepository.findAll(spec, pageRequest);

        List<Complaint> items = resultPage.getContent().stream()
                .map(c -> populateDetails(c, UserRole.CITIZEN, citizenId))
                .collect(Collectors.toList());

        return new PaginatedResult<>(items, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    public PaginatedResult<Complaint> getOfficerComplaints(String officerId, String search, String status,
                                                           String priority, Boolean overdueOnly, int page, int size) {
        Specification<Complaint> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("assignedOfficerId"), officerId));

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("id")), pattern)
                ));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), ComplaintStatus.valueOf(status.toUpperCase())));
            }
            if (priority != null && !priority.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("priority"), ComplaintPriority.valueOf(priority.toUpperCase())));
            }
            if (Boolean.TRUE.equals(overdueOnly)) {
                predicates.add(cb.lessThan(root.get("actionDeadline"), Instant.now()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<Complaint> resultPage = complaintRepository.findAll(spec, pageRequest);

        List<Complaint> items = resultPage.getContent().stream()
                .map(c -> populateDetails(c, UserRole.OFFICER, officerId))
                .collect(Collectors.toList());

        return new PaginatedResult<>(items, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    public PaginatedResult<Complaint> getAdminComplaints(String search, String status, String priority,
                                                         String departmentId, String wardZoneId, String categoryId,
                                                         String officerId, int page, int size) {
        Specification<Complaint> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("id")), pattern),
                        cb.like(cb.lower(root.get("citizenName")), pattern)
                ));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), ComplaintStatus.valueOf(status.toUpperCase())));
            }
            if (priority != null && !priority.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("priority"), ComplaintPriority.valueOf(priority.toUpperCase())));
            }
            if (departmentId != null && !departmentId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("departmentId"), departmentId));
            }
            if (wardZoneId != null && !wardZoneId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("wardZoneId"), wardZoneId));
            }
            if (categoryId != null && !categoryId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }
            if (officerId != null && !officerId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("assignedOfficerId"), officerId));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<Complaint> resultPage = complaintRepository.findAll(spec, pageRequest);

        List<Complaint> items = resultPage.getContent().stream()
                .map(c -> populateDetails(c, UserRole.ADMIN, null))
                .collect(Collectors.toList());

        return new PaginatedResult<>(items, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    public PaginatedResult<Complaint> getUnassignedQueue(int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<Complaint> resultPage = complaintRepository.findByStatus(ComplaintStatus.UNASSIGNED, pageRequest);

        List<Complaint> items = resultPage.getContent().stream()
                .map(c -> populateDetails(c, UserRole.ADMIN, null))
                .collect(Collectors.toList());

        return new PaginatedResult<>(items, page, size, resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    public Complaint getComplaintById(String id, User user) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint record not found."));

        if (user.getRole() == UserRole.CITIZEN && !complaint.getCitizenId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to view this complaint.");
        }
        if (user.getRole() == UserRole.OFFICER && !user.getId().equals(complaint.getAssignedOfficerId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You are not assigned to this complaint.");
        }

        return populateDetails(complaint, user.getRole(), user.getId());
    }

    public Map<String, Object> checkDuplicates(String categoryId, String wardZoneId, String title, String citizenId) {
        List<Complaint> existing = complaintRepository.findByCategoryIdAndWardZoneId(categoryId, wardZoneId);
        List<Map<String, Object>> ownMatches = new ArrayList<>();
        boolean otherFound = false;

        String queryWords = title.toLowerCase();
        for (Complaint c : existing) {
            if (c.getStatus() == ComplaintStatus.CLOSED || c.getStatus() == ComplaintStatus.WITHDRAWN) continue;
            boolean match = c.getTitle().toLowerCase().contains(queryWords) || queryWords.contains(c.getTitle().toLowerCase());
            if (match) {
                if (c.getCitizenId().equals(citizenId)) {
                    ownMatches.add(Map.of(
                            "id", c.getId(),
                            "title", c.getTitle(),
                            "status", c.getStatus().name()
                    ));
                } else {
                    otherFound = true;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("hasDuplicates", !ownMatches.isEmpty() || otherFound);
        result.put("ownMatches", ownMatches);
        if (otherFound) {
            result.put("genericNotice", "A similar active complaint has already been submitted in this ward. It is being tracked by municipal authorities.");
        }
        return result;
    }

    @Transactional
    public Complaint submitComplaint(Map<String, Object> body, String idempotencyKey, String citizenId) {
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            Optional<Complaint> existing = complaintRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                return populateDetails(existing.get(), UserRole.CITIZEN, citizenId);
            }
        }

        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Citizen user not found"));

        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String categoryId = (String) body.get("categoryId");
        String wardZoneId = (String) body.get("wardZoneId");
        String exactLocation = (String) body.get("exactLocation");
        String incidentDate = (String) body.get("incidentDate");

        if (title == null || description == null || categoryId == null || wardZoneId == null || exactLocation == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_REQUIRED_FIELDS", "All required fields must be supplied.");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found"));
        Department dept = departmentRepository.findById(category.getDepartmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "DEPARTMENT_NOT_FOUND", "Department not found"));
        WardZone ward = wardZoneRepository.findById(wardZoneId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "WARD_NOT_FOUND", "Ward zone not found"));

        Complaint complaint = new Complaint();
        complaint.setCitizenId(citizen.getId());
        complaint.setCitizenName(citizen.getFullName());
        complaint.setCitizenEmail(citizen.getEmail());
        complaint.setCitizenPhone(citizen.getPhone());
        complaint.setCategoryId(category.getId());
        complaint.setCategoryName(category.getName());
        complaint.setDepartmentId(dept.getId());
        complaint.setDepartmentName(dept.getName());
        complaint.setWardZoneId(ward.getId());
        complaint.setWardZoneName(ward.getName());
        complaint.setTitle(title.trim());
        complaint.setDescription(description.trim());
        complaint.setExactLocation(exactLocation.trim());
        complaint.setIncidentDate(incidentDate);
        complaint.setIdempotencyKey(idempotencyKey);
        complaint.setPriority(ComplaintPriority.valueOf(category.getDefaultPriority()));

        // Automatic routing to eligible officer
        User assignedOfficer = findEligibleOfficer(category.getId(), dept.getId(), ward.getId());
        if (assignedOfficer != null) {
            complaint.setStatus(ComplaintStatus.ASSIGNED);
            complaint.setAssignedOfficerId(assignedOfficer.getId());
            complaint.setAssignedOfficerName(assignedOfficer.getFullName());
            complaint.setAssignedAt(Instant.now());
            calculateSlaDeadlines(complaint);
        } else {
            complaint.setStatus(ComplaintStatus.UNASSIGNED);
        }

        Complaint saved = complaintRepository.save(complaint);

        // Save attachments if any
        List<Map<String, Object>> attachmentsList = (List<Map<String, Object>>) body.get("attachments");
        if (attachmentsList != null) {
            for (Map<String, Object> att : attachmentsList) {
                ComplaintAttachment attachment = new ComplaintAttachment();
                attachment.setComplaintId(saved.getId());
                attachment.setFilename((String) att.get("filename"));
                attachment.setFileSize(((Number) att.get("fileSize")).longValue());
                attachment.setFileType((String) att.get("fileType"));
                attachment.setUrl((String) att.get("url"));
                attachment.setUploadedBy(citizen.getId());
                attachmentRepository.save(attachment);
            }
        }

        // Record initial status in history
        historyRepository.save(new StatusHistoryItem(
                saved.getId(),
                null,
                saved.getStatus(),
                citizen.getId(),
                citizen.getFullName(),
                UserRole.CITIZEN,
                "Complaint filed by citizen"
        ));

        // Create Notifications
        notificationRepository.save(new Notification(
                citizen.getId(),
                UserRole.CITIZEN,
                "Complaint Registered",
                "Your grievance #" + saved.getId() + " has been registered and is tracking under " + saved.getStatus(),
                "COMPLAINT_SUBMITTED",
                saved.getId()
        ));

        if (assignedOfficer != null) {
            notificationRepository.save(new Notification(
                    assignedOfficer.getId(),
                    UserRole.OFFICER,
                    "New Case Assigned",
                    "New grievance #" + saved.getId() + " assigned to you in " + ward.getName(),
                    "ASSIGNMENT_NEW",
                    saved.getId()
            ));
        }

        // Audit Log
        auditLogRepository.save(new AuditLog(
                citizen.getId(),
                citizen.getFullName(),
                UserRole.CITIZEN,
                "COMPLAINT_SUBMITTED",
                "COMPLAINT",
                saved.getId(),
                "New citizen submission",
                null,
                saved.getStatus().name()
        ));

        return populateDetails(saved, UserRole.CITIZEN, citizenId);
    }

    @Transactional
    public Complaint acknowledgeComplaint(String complaintId, String officerId) {
        Complaint complaint = getComplaintForOfficer(complaintId, officerId);
        if (complaint.getStatus() != ComplaintStatus.ASSIGNED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TRANSITION", "Complaint must be in ASSIGNED status to acknowledge.");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.ACKNOWLEDGED);
        complaint.setAcknowledgedAt(Instant.now());
        Complaint updated = complaintRepository.save(complaint);

        User officer = userRepository.findById(officerId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.ACKNOWLEDGED,
                officerId, officer != null ? officer.getFullName() : "Officer", UserRole.OFFICER,
                "Case acknowledged by responsible department officer"
        ));

        notificationRepository.save(new Notification(
                complaint.getCitizenId(), UserRole.CITIZEN,
                "Case Acknowledged",
                "Officer " + complaint.getAssignedOfficerName() + " has acknowledged receipt of complaint #" + complaintId,
                "STATUS_UPDATE", complaintId
        ));

        return populateDetails(updated, UserRole.OFFICER, officerId);
    }

    @Transactional
    public Complaint addProgressUpdate(String complaintId, String note, String visibility, String officerId) {
        Complaint complaint = getComplaintForOfficer(complaintId, officerId);
        User officer = userRepository.findById(officerId).orElse(null);

        ProgressUpdateItem item = new ProgressUpdateItem(
                complaintId, officerId, officer != null ? officer.getFullName() : "Officer", note, visibility
        );
        progressRepository.save(item);

        if (complaint.getStatus() == ComplaintStatus.ACKNOWLEDGED) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            complaint.setActionStartedAt(Instant.now());
            complaintRepository.save(complaint);

            historyRepository.save(new StatusHistoryItem(
                    complaintId, ComplaintStatus.ACKNOWLEDGED, ComplaintStatus.IN_PROGRESS,
                    officerId, officer != null ? officer.getFullName() : "Officer", UserRole.OFFICER,
                    "Action commenced and in-progress status recorded"
            ));
        }

        if ("CITIZEN_VISIBLE".equalsIgnoreCase(visibility)) {
            notificationRepository.save(new Notification(
                    complaint.getCitizenId(), UserRole.CITIZEN,
                    "Investigation Update",
                    "New progress update logged for complaint #" + complaintId,
                    "PROGRESS_UPDATE", complaintId
            ));
        }

        return populateDetails(complaint, UserRole.OFFICER, officerId);
    }

    @Transactional
    public Complaint requestCitizenInfo(String complaintId, String message, String officerId) {
        Complaint complaint = getComplaintForOfficer(complaintId, officerId);
        User officer = userRepository.findById(officerId).orElse(null);

        CitizenInfoRequest request = new CitizenInfoRequest(
                complaintId, officer != null ? officer.getFullName() : "Officer", message
        );
        infoRequestRepository.save(request);

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.AWAITING_CITIZEN_INFO);
        complaintRepository.save(complaint);

        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.AWAITING_CITIZEN_INFO,
                officerId, officer != null ? officer.getFullName() : "Officer", UserRole.OFFICER,
                "Officer requested additional clarification from complainant"
        ));

        notificationRepository.save(new Notification(
                complaint.getCitizenId(), UserRole.CITIZEN,
                "Information Required",
                "Officer requested details for complaint #" + complaintId + ": " + message,
                "INFO_REQUESTED", complaintId
        ));

        return populateDetails(complaint, UserRole.OFFICER, officerId);
    }

    @Transactional
    public Complaint replyToInfoRequest(String complaintId, String response, String citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!complaint.getCitizenId().equals(citizenId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You are not the complainant.");
        }

        List<CitizenInfoRequest> requests = infoRequestRepository.findByComplaintIdOrderByRequestedAtAsc(complaintId);
        if (!requests.isEmpty()) {
            CitizenInfoRequest latest = requests.get(requests.size() - 1);
            latest.setResponse(response);
            latest.setRespondedAt(Instant.now());
            infoRequestRepository.save(latest);
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaintRepository.save(complaint);

        User citizen = userRepository.findById(citizenId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.IN_PROGRESS,
                citizenId, citizen != null ? citizen.getFullName() : "Citizen", UserRole.CITIZEN,
                "Complainant supplied requested clarification"
        ));

        if (complaint.getAssignedOfficerId() != null) {
            notificationRepository.save(new Notification(
                    complaint.getAssignedOfficerId(), UserRole.OFFICER,
                    "Information Received",
                    "Complainant responded to your clarification request for #" + complaintId,
                    "INFO_RESPONDED", complaintId
            ));
        }

        return populateDetails(complaint, UserRole.CITIZEN, citizenId);
    }

    @Transactional
    public Complaint submitResolutionReport(Map<String, Object> body, String officerId) {
        String complaintId = (String) body.get("complaintId");
        Complaint complaint = getComplaintForOfficer(complaintId, officerId);
        User officer = userRepository.findById(officerId).orElse(null);

        List<Map<String, Object>> attachments = (List<Map<String, Object>>) body.get("evidenceAttachments");
        if (attachments == null || attachments.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EVIDENCE_REQUIRED", "At least one evidence attachment is mandatory before submitting a resolution report (SRS FR-14).");
        }

        ResolutionReport report = new ResolutionReport();
        report.setComplaintId(complaintId);
        report.setOfficerId(officerId);
        report.setOfficerName(officer != null ? officer.getFullName() : "Officer");
        report.setActionsTaken((String) body.get("actionsTaken"));
        report.setOutcomeDescription((String) body.get("outcomeDescription"));
        report.setCompletionDate((String) body.get("completionDate"));
        report.setReviewStatus("PENDING_REVIEW");
        ResolutionReport savedReport = resolutionRepository.save(report);

        for (Map<String, Object> att : attachments) {
            ComplaintAttachment attachment = new ComplaintAttachment();
            attachment.setComplaintId(complaintId);
            attachment.setResolutionReportId(savedReport.getId());
            attachment.setFilename((String) att.get("filename"));
            attachment.setFileSize(((Number) att.get("fileSize")).longValue());
            attachment.setFileType((String) att.get("fileType"));
            attachment.setUrl((String) att.get("url"));
            attachment.setUploadedBy(officerId);
            attachmentRepository.save(attachment);
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.RESOLUTION_REPORT_SUBMITTED);
        complaintRepository.save(complaint);

        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.RESOLUTION_REPORT_SUBMITTED,
                officerId, officer != null ? officer.getFullName() : "Officer", UserRole.OFFICER,
                "Resolution report submitted for administrative review"
        ));

        // Notify Admins
        userRepository.findByRole(UserRole.ADMIN).forEach(admin -> {
            notificationRepository.save(new Notification(
                    admin.getId(), UserRole.ADMIN,
                    "Resolution Review Required",
                    "Resolution report submitted by " + report.getOfficerName() + " for complaint #" + complaintId,
                    "REVIEW_REQUIRED", complaintId
            ));
        });

        return populateDetails(complaint, UserRole.OFFICER, officerId);
    }

    @Transactional
    public Complaint reviewResolutionReport(String reportId, String decision, String reason, String adminId) {
        ResolutionReport report = resolutionRepository.findById(reportId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Resolution report not found."));

        Complaint complaint = complaintRepository.findById(report.getComplaintId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        User admin = userRepository.findById(adminId).orElse(null);
        String adminName = admin != null ? admin.getFullName() : "Administrator";

        if ("REJECTED".equalsIgnoreCase(decision)) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "REJECTION_REASON_MANDATORY", "A mandatory explanation reason must be provided when rejecting a resolution report (SRS FR-15).");
            }
            report.setReviewStatus("REJECTED");
            report.setReviewerName(adminName);
            report.setReviewedAt(Instant.now());
            report.setAdminReason(reason.trim());
            resolutionRepository.save(report);

            ComplaintStatus oldStatus = complaint.getStatus();
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            complaintRepository.save(complaint);

            historyRepository.save(new StatusHistoryItem(
                    complaint.getId(), oldStatus, ComplaintStatus.IN_PROGRESS,
                    adminId, adminName, UserRole.ADMIN,
                    "Resolution report rejected by admin: " + reason.trim()
            ));

            // Notify Officer (citizen is NOT notified of internal report rejection per SRS v1.1 Section 9.2)
            notificationRepository.save(new Notification(
                    report.getOfficerId(), UserRole.OFFICER,
                    "Resolution Report Rejected",
                    "Admin rejected report for complaint #" + complaint.getId() + ". Reason: " + reason.trim(),
                    "REPORT_REJECTED", complaint.getId()
            ));

        } else if ("APPROVED".equalsIgnoreCase(decision)) {
            report.setReviewStatus("APPROVED");
            report.setReviewerName(adminName);
            report.setReviewedAt(Instant.now());
            report.setAdminReason(reason);
            resolutionRepository.save(report);

            ComplaintStatus oldStatus = complaint.getStatus();
            complaint.setStatus(ComplaintStatus.RESOLVED_AWAITING_FEEDBACK);
            complaint.setObjectionWindowEnd(Instant.now().plus(7, ChronoUnit.DAYS));
            complaintRepository.save(complaint);

            historyRepository.save(new StatusHistoryItem(
                    complaint.getId(), oldStatus, ComplaintStatus.RESOLVED_AWAITING_FEEDBACK,
                    adminId, adminName, UserRole.ADMIN,
                    "Resolution report approved. 7-day citizen feedback & objection window started."
            ));

            notificationRepository.save(new Notification(
                    complaint.getCitizenId(), UserRole.CITIZEN,
                    "Resolution Approved — Action Required",
                    "Grievance #" + complaint.getId() + " is resolved. Please verify repairs and share feedback within 7 days.",
                    "RESOLUTION_APPROVED", complaint.getId()
            ));

            notificationRepository.save(new Notification(
                    report.getOfficerId(), UserRole.OFFICER,
                    "Resolution Report Approved",
                    "Your resolution report for #" + complaint.getId() + " has been approved by administrator.",
                    "REPORT_APPROVED", complaint.getId()
            ));
        }

        return populateDetails(complaint, UserRole.ADMIN, adminId);
    }

    @Transactional
    public Complaint submitObjection(String complaintId, String reason, String citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!complaint.getCitizenId().equals(citizenId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only complainant can submit an objection.");
        }

        if (complaint.getStatus() != ComplaintStatus.RESOLVED_AWAITING_FEEDBACK) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Objection can only be lodged during the 7-day citizen review window.");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.REOPENED);
        complaintRepository.save(complaint);

        User citizen = userRepository.findById(citizenId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.REOPENED,
                citizenId, citizen != null ? citizen.getFullName() : "Citizen", UserRole.CITIZEN,
                "Citizen objection lodged: " + reason
        ));

        if (complaint.getAssignedOfficerId() != null) {
            notificationRepository.save(new Notification(
                    complaint.getAssignedOfficerId(), UserRole.OFFICER,
                    "Complaint Reopened via Citizen Objection",
                    "Citizen objected to resolution of #" + complaintId + ": " + reason,
                    "OBJECTION_LODGED", complaintId
            ));
        }

        return populateDetails(complaint, UserRole.CITIZEN, citizenId);
    }

    @Transactional
    public Complaint submitFeedback(String complaintId, int rating, String comment, String citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!complaint.getCitizenId().equals(citizenId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only complainant can submit feedback.");
        }

        ComplaintFeedback feedback = new ComplaintFeedback(complaintId, citizenId, rating, comment);
        feedbackRepository.save(feedback);

        if (complaint.getStatus() == ComplaintStatus.RESOLVED_AWAITING_FEEDBACK) {
            ComplaintStatus oldStatus = complaint.getStatus();
            complaint.setStatus(ComplaintStatus.CLOSED);
            complaint.setClosedAt(Instant.now());
            complaintRepository.save(complaint);

            User citizen = userRepository.findById(citizenId).orElse(null);
            historyRepository.save(new StatusHistoryItem(
                    complaintId, oldStatus, ComplaintStatus.CLOSED,
                    citizenId, citizen != null ? citizen.getFullName() : "Citizen", UserRole.CITIZEN,
                    "Complaint closed following citizen feedback rating (" + rating + "/5 stars)"
            ));
        }

        return populateDetails(complaint, UserRole.CITIZEN, citizenId);
    }

    @Transactional
    public Complaint assignOfficer(String complaintId, String officerId, String reason, String adminId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "OFFICER_NOT_FOUND", "Officer not found."));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setAssignedOfficerId(officer.getId());
        complaint.setAssignedOfficerName(officer.getFullName());
        complaint.setAssignedAt(Instant.now());
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        calculateSlaDeadlines(complaint);
        complaintRepository.save(complaint);

        User admin = userRepository.findById(adminId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.ASSIGNED,
                adminId, admin != null ? admin.getFullName() : "Administrator", UserRole.ADMIN,
                "Administrative officer assignment: " + reason
        ));

        notificationRepository.save(new Notification(
                officer.getId(), UserRole.OFFICER,
                "New Complaint Assigned",
                "You have been assigned case #" + complaintId + " by administrator",
                "ASSIGNED", complaintId
        ));

        return populateDetails(complaint, UserRole.ADMIN, adminId);
    }

    @Transactional
    public Complaint correctRouting(String complaintId, String newCategoryId, String newPriority, String reason, String adminId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (newCategoryId != null && !newCategoryId.trim().isEmpty()) {
            Category cat = categoryRepository.findById(newCategoryId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found."));
            Department dept = departmentRepository.findById(cat.getDepartmentId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "DEPARTMENT_NOT_FOUND", "Department not found."));
            complaint.setCategoryId(cat.getId());
            complaint.setCategoryName(cat.getName());
            complaint.setDepartmentId(dept.getId());
            complaint.setDepartmentName(dept.getName());
        }

        if (newPriority != null && !newPriority.trim().isEmpty()) {
            complaint.setPriority(ComplaintPriority.valueOf(newPriority.toUpperCase()));
            calculateSlaDeadlines(complaint);
        }

        complaintRepository.save(complaint);

        User admin = userRepository.findById(adminId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, complaint.getStatus(), complaint.getStatus(),
                adminId, admin != null ? admin.getFullName() : "Administrator", UserRole.ADMIN,
                "Routing or priority correction: " + reason
        ));

        return populateDetails(complaint, UserRole.ADMIN, adminId);
    }

    @Transactional
    public Complaint escalateComplaint(String complaintId, String reason, String adminId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.ESCALATED);
        complaintRepository.save(complaint);

        User admin = userRepository.findById(adminId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.ESCALATED,
                adminId, admin != null ? admin.getFullName() : "Administrator", UserRole.ADMIN,
                "Case escalated by administrator: " + reason
        ));

        if (complaint.getAssignedOfficerId() != null) {
            notificationRepository.save(new Notification(
                    complaint.getAssignedOfficerId(), UserRole.OFFICER,
                    "Complaint Escalated",
                    "Grievance #" + complaintId + " has been escalated by administration. Reason: " + reason,
                    "ESCALATED", complaintId
            ));
        }

        return populateDetails(complaint, UserRole.ADMIN, adminId);
    }

    @Transactional
    public Complaint closeComplaint(String complaintId, String reason, String adminId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.CLOSED);
        complaint.setClosedAt(Instant.now());
        complaintRepository.save(complaint);

        User admin = userRepository.findById(adminId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.CLOSED,
                adminId, admin != null ? admin.getFullName() : "Administrator", UserRole.ADMIN,
                "Case closed by administrator: " + reason
        ));

        notificationRepository.save(new Notification(
                complaint.getCitizenId(), UserRole.CITIZEN,
                "Complaint Closed",
                "Your grievance #" + complaintId + " has been closed by administration.",
                "CLOSED", complaintId
        ));

        return populateDetails(complaint, UserRole.ADMIN, adminId);
    }

    @Transactional
    public Complaint requestReopening(String complaintId, String reason, String citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        complaint.setPendingReopenReason(reason);
        complaintRepository.save(complaint);

        User citizen = userRepository.findById(citizenId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, complaint.getStatus(), complaint.getStatus(),
                citizenId, citizen != null ? citizen.getFullName() : "Citizen", UserRole.CITIZEN,
                "Citizen requested late reopening: " + reason
        ));

        return populateDetails(complaint, UserRole.CITIZEN, citizenId);
    }

    @Transactional
    public Complaint requestWithdrawal(String complaintId, String reason, String citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.WITHDRAWAL_REQUEST_PENDING);
        complaint.setPendingWithdrawalReason(reason);
        complaintRepository.save(complaint);

        User citizen = userRepository.findById(citizenId).orElse(null);
        historyRepository.save(new StatusHistoryItem(
                complaintId, oldStatus, ComplaintStatus.WITHDRAWAL_REQUEST_PENDING,
                citizenId, citizen != null ? citizen.getFullName() : "Citizen", UserRole.CITIZEN,
                "Citizen requested withdrawal: " + reason
        ));

        return populateDetails(complaint, UserRole.CITIZEN, citizenId);
    }

    public List<ResolutionReport> getResolutionReviews() {
        List<ResolutionReport> pending = resolutionRepository.findByReviewStatus("PENDING_REVIEW");
        for (ResolutionReport r : pending) {
            r.setEvidenceAttachments(attachmentRepository.findByResolutionReportId(r.getId()));
        }
        return pending;
    }

    private Complaint getComplaintForOfficer(String complaintId, String officerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!officerId.equals(complaint.getAssignedOfficerId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You are not assigned to this complaint.");
        }
        return complaint;
    }

    private User findEligibleOfficer(String categoryId, String departmentId, String wardZoneId) {
        List<User> officers = userRepository.findByRole(UserRole.OFFICER);
        List<User> eligible = officers.stream()
                .filter(o -> "ACTIVE".equalsIgnoreCase(o.getAccountStatus()))
                .filter(o -> "AVAILABLE".equalsIgnoreCase(o.getAvailabilityStatus()))
                .filter(o -> departmentId.equals(o.getDepartmentId()))
                .filter(o -> o.getEligibleCategoryIds() != null && o.getEligibleCategoryIds().contains(categoryId))
                .filter(o -> o.getEligibleZoneIds() != null && o.getEligibleZoneIds().contains(wardZoneId))
                .collect(Collectors.toList());

        if (eligible.isEmpty()) {
            return null;
        }

        // Return officer with fewest active complaints
        return eligible.stream().min(Comparator.comparingInt(o ->
                complaintRepository.findByAssignedOfficerId(o.getId(), PageRequest.of(0, 1000)).getContent().size()
        )).orElse(null);
    }

    private void calculateSlaDeadlines(Complaint complaint) {
        Instant now = Instant.now();
        switch (complaint.getPriority()) {
            case CRITICAL:
                complaint.setAckDeadline(now.plus(2, ChronoUnit.HOURS));
                complaint.setActionDeadline(now.plus(24, ChronoUnit.HOURS));
                break;
            case HIGH:
                complaint.setAckDeadline(now.plus(4, ChronoUnit.HOURS));
                complaint.setActionDeadline(now.plus(48, ChronoUnit.HOURS));
                break;
            case MEDIUM:
                complaint.setAckDeadline(now.plus(12, ChronoUnit.HOURS));
                complaint.setActionDeadline(now.plus(72, ChronoUnit.HOURS));
                break;
            case LOW:
            default:
                complaint.setAckDeadline(now.plus(24, ChronoUnit.HOURS));
                complaint.setActionDeadline(now.plus(120, ChronoUnit.HOURS));
                break;
        }
    }

    private Complaint populateDetails(Complaint complaint, UserRole userRole, String userId) {
        complaint.setAttachments(attachmentRepository.findByComplaintId(complaint.getId()));
        complaint.setHistory(historyRepository.findByComplaintIdOrderByChangedAtAsc(complaint.getId()));

        if (userRole == UserRole.CITIZEN) {
            complaint.setProgressUpdates(progressRepository.findByComplaintIdAndVisibilityOrderByTimestampAsc(complaint.getId(), "CITIZEN_VISIBLE"));
        } else {
            complaint.setProgressUpdates(progressRepository.findByComplaintIdOrderByTimestampAsc(complaint.getId()));
        }

        complaint.setInfoRequests(infoRequestRepository.findByComplaintIdOrderByRequestedAtAsc(complaint.getId()));
        List<ResolutionReport> reports = resolutionRepository.findByComplaintIdOrderBySubmittedAtDesc(complaint.getId());
        for (ResolutionReport r : reports) {
            r.setEvidenceAttachments(attachmentRepository.findByResolutionReportId(r.getId()));
        }
        complaint.setResolutionReports(reports);

        feedbackRepository.findByComplaintId(complaint.getId()).ifPresent(complaint::setFeedback);

        // Allowed actions
        List<String> actions = new ArrayList<>();
        ComplaintStatus status = complaint.getStatus();
        if (userRole == UserRole.CITIZEN) {
            if (status == ComplaintStatus.AWAITING_CITIZEN_INFO) actions.add("CITIZEN_REPLY_INFO");
            if (status == ComplaintStatus.RESOLVED_AWAITING_FEEDBACK) {
                actions.add("CITIZEN_SUBMIT_FEEDBACK");
                actions.add("CITIZEN_SUBMIT_OBJECTION");
            }
            if (status == ComplaintStatus.CLOSED) {
                actions.add("CITIZEN_SUBMIT_FEEDBACK");
                actions.add("CITIZEN_REQUEST_REOPENING");
            }
            if (status != ComplaintStatus.CLOSED && status != ComplaintStatus.WITHDRAWN) {
                actions.add("CITIZEN_WITHDRAW");
            }
        } else if (userRole == UserRole.OFFICER) {
            if (status == ComplaintStatus.ASSIGNED) actions.add("OFFICER_ACKNOWLEDGE");
            if (status == ComplaintStatus.ACKNOWLEDGED || status == ComplaintStatus.IN_PROGRESS || status == ComplaintStatus.REOPENED) {
                actions.add("OFFICER_ADD_PROGRESS");
                actions.add("OFFICER_REQUEST_INFO");
                actions.add("OFFICER_SUBMIT_REPORT");
            }
        } else if (userRole == UserRole.ADMIN) {
            actions.add("ADMIN_ASSIGN_OFFICER");
            actions.add("ADMIN_CORRECT_ROUTING");
            actions.add("ADMIN_ESCALATE");
            if (status != ComplaintStatus.CLOSED) actions.add("ADMIN_CLOSE");
            if (status == ComplaintStatus.RESOLUTION_REPORT_SUBMITTED) actions.add("ADMIN_REVIEW_REPORT");
        }
        complaint.setAllowedActions(actions);

        return complaint;
    }
}
