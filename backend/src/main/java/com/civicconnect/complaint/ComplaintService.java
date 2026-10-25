package com.civicconnect.complaint;

import com.civicconnect.assignment.AssignmentService;
import com.civicconnect.attachment.EvidenceAttachment;
import com.civicconnect.attachment.EvidenceAttachmentRepository;
import com.civicconnect.audit.AuditLogService;
import com.civicconnect.category.Category;
import com.civicconnect.category.CategoryRepository;
import com.civicconnect.common.ApiException;
import com.civicconnect.common.PaginatedResult;
import com.civicconnect.department.Department;
import com.civicconnect.department.DepartmentRepository;
import com.civicconnect.feedback.Feedback;
import com.civicconnect.feedback.FeedbackRepository;
import com.civicconnect.investigation.*;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.resolution.ResolutionReport;
import com.civicconnect.resolution.ResolutionReportRepository;
import com.civicconnect.user.AccountStatus;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.user.UserRole;
import com.civicconnect.ward.WardZone;
import com.civicconnect.ward.WardZoneRepository;
import com.civicconnect.workflow.StatusHistory;
import com.civicconnect.workflow.StatusHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final WardZoneRepository wardZoneRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final ProgressUpdateRepository progressUpdateRepository;
    private final CitizenInfoRequestRepository citizenInfoRequestRepository;
    private final ResolutionReportRepository resolutionReportRepository;
    private final EvidenceAttachmentRepository evidenceAttachmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final AssignmentService assignmentService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            CategoryRepository categoryRepository,
            DepartmentRepository departmentRepository,
            WardZoneRepository wardZoneRepository,
            UserRepository userRepository,
            StatusHistoryRepository statusHistoryRepository,
            ProgressUpdateRepository progressUpdateRepository,
            CitizenInfoRequestRepository citizenInfoRequestRepository,
            ResolutionReportRepository resolutionReportRepository,
            EvidenceAttachmentRepository evidenceAttachmentRepository,
            FeedbackRepository feedbackRepository,
            AssignmentService assignmentService,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.complaintRepository = complaintRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.wardZoneRepository = wardZoneRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.progressUpdateRepository = progressUpdateRepository;
        this.citizenInfoRequestRepository = citizenInfoRequestRepository;
        this.resolutionReportRepository = resolutionReportRepository;
        this.evidenceAttachmentRepository = evidenceAttachmentRepository;
        this.feedbackRepository = feedbackRepository;
        this.assignmentService = assignmentService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ComplaintDto submitComplaint(SubmitComplaintRequest req, User citizen, String idempotencyKey, String ipAddress) {
        // Idempotency check
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Complaint> existing = complaintRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                return toDto(existing.get(), citizen);
            }
        }

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CATEGORY", "Category not found."));

        Department department = departmentRepository.findById(category.getDepartmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DEPARTMENT", "Associated department not found."));

        WardZone wardZone = wardZoneRepository.findById(req.getWardZoneId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WARD", "Ward/Zone not found."));

        // Generate unique human-readable complaint reference number CP-2026-XXXX
        long count = complaintRepository.count() + 1001;
        String complaintId = "CP-2026-" + count;

        Complaint complaint = new Complaint();
        complaint.setId(complaintId);
        complaint.setCitizenId(citizen.getId());
        complaint.setCategoryId(category.getId());
        complaint.setDepartmentId(department.getId());
        complaint.setWardZoneId(wardZone.getId());
        complaint.setTitle(req.getTitle().trim());
        complaint.setDescription(req.getDescription().trim());
        complaint.setExactLocation(req.getExactLocation().trim());
        complaint.setIncidentDate(req.getIncidentDate());
        complaint.setIdempotencyKey(idempotencyKey);

        // Determine Priority from Category
        ComplaintPriority priority = ComplaintPriority.MEDIUM;
        try {
            priority = ComplaintPriority.valueOf(category.getDefaultPriority());
        } catch (Exception ignored) {}
        complaint.setPriority(priority);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaintRepository.save(complaint);

        // Record submission history
        statusHistoryRepository.save(new StatusHistory(
                complaint.getId(),
                null,
                ComplaintStatus.SUBMITTED,
                citizen.getId(),
                citizen.getFullName(),
                UserRole.CITIZEN,
                "Complaint filed by citizen."
        ));

        // Save attachments if any
        if (req.getAttachments() != null) {
            for (SubmitComplaintRequest.AttachmentInput att : req.getAttachments()) {
                EvidenceAttachment ea = new EvidenceAttachment(
                        complaint.getId(),
                        null,
                        att.getFilename(),
                        att.getUrl() != null ? att.getUrl() : "storage/" + att.getFilename(),
                        att.getFileSize(),
                        att.getFileType() != null ? att.getFileType() : "application/octet-stream",
                        citizen.getId(),
                        citizen.getFullName()
                );
                evidenceAttachmentRepository.save(ea);
            }
        }

        // Automatic Assignment
        assignmentService.assignComplaintAutomatically(complaint);

        // Notify Citizen
        notificationService.createNotification(
                citizen.getId(),
                UserRole.CITIZEN,
                "Complaint Submitted: " + complaint.getId(),
                "Your grievance regarding '" + complaint.getTitle() + "' has been registered. You can track progress in real time.",
                "SUBMISSION_CONFIRMATION",
                complaint.getId()
        );

        auditLogService.recordLog(
                citizen.getId(),
                citizen.getFullName(),
                "CITIZEN",
                "CREATE_COMPLAINT",
                "Complaint",
                complaint.getId(),
                "Complaint submitted with priority " + priority,
                ipAddress
        );

        return toDto(complaint, citizen);
    }

    public Map<String, Object> checkDuplicates(String categoryId, String wardZoneId, String title, String citizenId) {
        String cleanTitle = title != null ? title.trim() : "";
        List<Complaint> ownMatches = complaintRepository.findPotentialCitizenDuplicates(citizenId, categoryId, wardZoneId, cleanTitle);
        List<Complaint> systemMatches = complaintRepository.findPotentialSystemDuplicates(categoryId, wardZoneId, cleanTitle);

        List<Map<String, Object>> ownList = ownMatches.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("title", c.getTitle());
            m.put("status", c.getStatus().name());
            return m;
        }).toList();

        boolean hasDuplicates = !ownMatches.isEmpty() || systemMatches.size() > ownMatches.size();
        String notice = null;
        if (systemMatches.size() > ownMatches.size()) {
            notice = "A similar grievance in this ward/zone has already been reported by another citizen and is actively being processed by municipal officers.";
        }

        Map<String, Object> res = new HashMap<>();
        res.put("hasDuplicates", hasDuplicates);
        res.put("ownMatches", ownList);
        res.put("genericNotice", notice);
        return res;
    }

    public PaginatedResult<ComplaintDto> getMyComplaints(User citizen, String search, String status, String category, String priority, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> complaintPage = complaintRepository.findByCitizenId(citizen.getId(), pageable);

        List<ComplaintDto> dtos = complaintPage.getContent().stream()
                .map(c -> toDto(c, citizen))
                .toList();

        return new PaginatedResult<>(dtos, page, size, complaintPage.getTotalElements(), complaintPage.getTotalPages());
    }

    public ComplaintDto getComplaintById(String id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint record not found with ID: " + id));

        // Authorization check
        if (currentUser.getRole() == UserRole.CITIZEN && !complaint.getCitizenId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You are not authorized to view this complaint.");
        }

        return toDto(complaint, currentUser);
    }

    @Transactional
    public ComplaintDto replyToInfoRequest(String complaintId, String response, User citizen) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!complaint.getCitizenId().equals(citizen.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the complaint author can reply to information requests.");
        }

        List<CitizenInfoRequest> requests = citizenInfoRequestRepository.findByComplaintIdOrderByRequestedAtAsc(complaintId);
        CitizenInfoRequest latestPending = requests.stream()
                .filter(r -> r.getResponse() == null)
                .findFirst()
                .orElse(null);

        if (latestPending != null) {
            latestPending.setResponse(response);
            latestPending.setRespondedAt(Instant.now());
            citizenInfoRequestRepository.save(latestPending);
        }

        // Return status to IN_PROGRESS if was awaiting info
        if (complaint.getStatus() == ComplaintStatus.AWAITING_CITIZEN_INFO) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            complaintRepository.save(complaint);

            statusHistoryRepository.save(new StatusHistory(
                    complaintId,
                    ComplaintStatus.AWAITING_CITIZEN_INFO,
                    ComplaintStatus.IN_PROGRESS,
                    citizen.getId(),
                    citizen.getFullName(),
                    UserRole.CITIZEN,
                    "Citizen responded with additional information."
            ));

            if (complaint.getAssignedOfficerId() != null) {
                notificationService.createNotification(
                        complaint.getAssignedOfficerId(),
                        UserRole.OFFICER,
                        "Citizen Responded to Info Request: " + complaint.getId(),
                        citizen.getFullName() + " provided the requested information for case " + complaint.getId(),
                        "INFO_RESPONSE",
                        complaint.getId()
                );
            }
        }

        return toDto(complaint, citizen);
    }

    @Transactional
    public ComplaintDto submitObjection(String complaintId, String reason, User citizen) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!complaint.getCitizenId().equals(citizen.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the complaint author can submit an objection.");
        }

        if (complaint.getStatus() != ComplaintStatus.RESOLVED_AWAITING_FEEDBACK) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATE", "Objection can only be submitted during the 7-day review window after resolution.");
        }

        if (complaint.getObjectionWindowEnd() != null && complaint.getObjectionWindowEnd().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "WINDOW_EXPIRED", "The 7-day citizen objection window has expired.");
        }

        complaint.setStatus(ComplaintStatus.REOPENED);
        complaint.setPendingReopenReason(reason);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                complaintId,
                ComplaintStatus.RESOLVED_AWAITING_FEEDBACK,
                ComplaintStatus.REOPENED,
                citizen.getId(),
                citizen.getFullName(),
                UserRole.CITIZEN,
                "Citizen submitted formal objection: " + reason
        ));

        // Alert administrators
        List<User> admins = userRepository.findByRoleAndAccountStatus(UserRole.ADMIN, AccountStatus.ACTIVE);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(),
                    UserRole.ADMIN,
                    "Citizen Objection Filed: " + complaint.getId(),
                    "Citizen " + citizen.getFullName() + " filed an objection on complaint " + complaint.getId() + ". Reason: " + reason,
                    "CITIZEN_OBJECTION",
                    complaint.getId()
            );
        }

        return toDto(complaint, citizen);
    }

    @Transactional
    public ComplaintDto submitFeedback(String complaintId, int rating, String comment, User citizen) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!complaint.getCitizenId().equals(citizen.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the complaint author can submit feedback.");
        }

        if (feedbackRepository.existsByComplaintId(complaintId)) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_FEEDBACK", "Feedback has already been recorded for this complaint.");
        }

        Feedback feedback = new Feedback(complaintId, citizen.getId(), rating, comment);
        feedbackRepository.save(feedback);

        return toDto(complaint, citizen);
    }

    @Transactional
    public ComplaintDto requestReopening(String complaintId, String reason, User citizen) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!complaint.getCitizenId().equals(citizen.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the complaint author can request reopening.");
        }

        complaint.setPendingReopenReason(reason);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                complaintId,
                complaint.getStatus(),
                complaint.getStatus(),
                citizen.getId(),
                citizen.getFullName(),
                UserRole.CITIZEN,
                "Citizen requested late reopening: " + reason
        ));

        return toDto(complaint, citizen);
    }

    @Transactional
    public ComplaintDto requestWithdrawal(String complaintId, String reason, User citizen) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!complaint.getCitizenId().equals(citizen.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the complaint author can request withdrawal.");
        }

        complaint.setStatus(ComplaintStatus.WITHDRAWAL_REQUEST_PENDING);
        complaint.setPendingWithdrawalReason(reason);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                complaintId,
                complaint.getStatus(),
                ComplaintStatus.WITHDRAWAL_REQUEST_PENDING,
                citizen.getId(),
                citizen.getFullName(),
                UserRole.CITIZEN,
                "Citizen requested case withdrawal: " + reason
        ));

        return toDto(complaint, citizen);
    }

    public ComplaintDto toDto(Complaint c, User currentUser) {
        ComplaintDto dto = new ComplaintDto();
        dto.setId(c.getId());
        dto.setCitizenId(c.getCitizenId());

        User citizen = userRepository.findById(c.getCitizenId()).orElse(null);
        if (citizen != null) {
            dto.setCitizenName(citizen.getFullName());
            dto.setCitizenPhone(citizen.getPhone());
            dto.setCitizenEmail(citizen.getEmail());
        }

        dto.setCategoryId(c.getCategoryId());
        categoryRepository.findById(c.getCategoryId()).ifPresent(cat -> dto.setCategoryName(cat.getName()));

        dto.setDepartmentId(c.getDepartmentId());
        departmentRepository.findById(c.getDepartmentId()).ifPresent(dept -> dto.setDepartmentName(dept.getName()));

        dto.setWardZoneId(c.getWardZoneId());
        wardZoneRepository.findById(c.getWardZoneId()).ifPresent(wz -> dto.setWardZoneName(wz.getName()));

        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setExactLocation(c.getExactLocation());

        if (c.getLatitude() != null && c.getLongitude() != null) {
            dto.setMapCoordinates(Map.of("lat", c.getLatitude(), "lng", c.getLongitude()));
        }

        dto.setIncidentDate(c.getIncidentDate());
        dto.setPriority(c.getPriority().name());
        dto.setStatus(c.getStatus().name());

        dto.setAssignedOfficerId(c.getAssignedOfficerId());
        if (c.getAssignedOfficerId() != null) {
            userRepository.findById(c.getAssignedOfficerId()).ifPresent(off -> dto.setAssignedOfficerName(off.getFullName()));
        }

        dto.setAssignedAt(c.getAssignedAt());
        dto.setAckDeadline(c.getAckDeadline());
        dto.setActionDeadline(c.getActionDeadline());
        dto.setAcknowledgedAt(c.getAcknowledgedAt());
        dto.setActionStartedAt(c.getActionStartedAt());
        dto.setSubmittedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        dto.setObjectionWindowEnd(c.getObjectionWindowEnd());
        dto.setClosedAt(c.getClosedAt());
        dto.setPaused(c.isPaused());
        dto.setPauseReason(c.getPauseReason());
        dto.setPendingWithdrawalReason(c.getPendingWithdrawalReason());
        dto.setPendingReopenReason(c.getPendingReopenReason());

        // Attachments
        List<EvidenceAttachment> attachments = evidenceAttachmentRepository.findByComplaintId(c.getId());
        dto.setAttachments(attachments.stream().map(ComplaintDto.AttachmentDto::new).toList());

        // Status history
        List<StatusHistory> history = statusHistoryRepository.findByComplaintIdOrderByCreatedAtAsc(c.getId());
        dto.setHistory(history.stream().map(ComplaintDto.HistoryDto::new).toList());

        // Progress updates (respect visibility for citizens)
        List<ProgressUpdate> updates;
        if (currentUser.getRole() == UserRole.CITIZEN) {
            updates = progressUpdateRepository.findByComplaintIdAndVisibilityOrderByCreatedAtAsc(c.getId(), "CITIZEN_VISIBLE");
        } else {
            updates = progressUpdateRepository.findByComplaintIdOrderByCreatedAtAsc(c.getId());
        }
        dto.setProgressUpdates(updates.stream().map(ComplaintDto.ProgressDto::new).toList());

        // Citizen info requests
        List<CitizenInfoRequest> infoRequests = citizenInfoRequestRepository.findByComplaintIdOrderByRequestedAtAsc(c.getId());
        dto.setInfoRequests(infoRequests.stream().map(ComplaintDto.InfoRequestDto::new).toList());

        // Resolution reports
        List<ResolutionReport> reports = resolutionReportRepository.findByComplaintIdOrderBySubmittedAtDesc(c.getId());
        dto.setResolutionReports(reports.stream().map(r -> {
            List<EvidenceAttachment> reportAtts = evidenceAttachmentRepository.findByResolutionReportId(r.getId());
            return new ComplaintDto.ReportDto(r, reportAtts.stream().map(ComplaintDto.AttachmentDto::new).toList());
        }).toList());

        // Feedback
        feedbackRepository.findByComplaintId(c.getId()).ifPresent(fb -> dto.setFeedback(new ComplaintDto.FeedbackDto(fb)));

        // Allowed actions based on user role and complaint status
        dto.setAllowedActions(calculateAllowedActions(c, currentUser));

        return dto;
    }

    private List<String> calculateAllowedActions(Complaint c, User user) {
        List<String> actions = new ArrayList<>();
        ComplaintStatus s = c.getStatus();

        if (user.getRole() == UserRole.OFFICER && user.getId().equals(c.getAssignedOfficerId())) {
            if (s == ComplaintStatus.ASSIGNED) actions.add("ACKNOWLEDGE");
            if (s == ComplaintStatus.ACKNOWLEDGED || s == ComplaintStatus.IN_PROGRESS || s == ComplaintStatus.RESOLUTION_REPORT_REJECTED) {
                actions.add("LOG_PROGRESS");
                actions.add("REQUEST_CITIZEN_INFO");
                actions.add("SUBMIT_RESOLUTION");
            }
        }

        if (user.getRole() == UserRole.CITIZEN && user.getId().equals(c.getCitizenId())) {
            if (s == ComplaintStatus.AWAITING_CITIZEN_INFO) actions.add("REPLY_INFO");
            if (s == ComplaintStatus.RESOLVED_AWAITING_FEEDBACK) {
                actions.add("SUBMIT_OBJECTION");
                actions.add("SUBMIT_FEEDBACK");
            }
            if (s != ComplaintStatus.CLOSED && s != ComplaintStatus.WITHDRAWN) {
                actions.add("REQUEST_WITHDRAWAL");
            }
            if (s == ComplaintStatus.CLOSED) {
                actions.add("REQUEST_REOPEN");
            }
        }

        if (user.getRole() == UserRole.ADMIN) {
            actions.add("REASSIGN");
            actions.add("ESCALATE");
            actions.add("CORRECT_ROUTING");
            if (s == ComplaintStatus.RESOLUTION_REPORT_SUBMITTED) {
                actions.add("REVIEW_RESOLUTION");
            }
            if (s != ComplaintStatus.CLOSED) {
                actions.add("CLOSE");
            }
        }

        return actions;
    }
}
