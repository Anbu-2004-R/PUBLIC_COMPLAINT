package com.civicconnect.resolution;

import com.civicconnect.attachment.EvidenceAttachment;
import com.civicconnect.attachment.EvidenceAttachmentRepository;
import com.civicconnect.audit.AuditLogService;
import com.civicconnect.common.ApiException;
import com.civicconnect.complaint.Complaint;
import com.civicconnect.complaint.ComplaintRepository;
import com.civicconnect.complaint.ComplaintStatus;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.user.AccountStatus;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.user.UserRole;
import com.civicconnect.workflow.StatusHistory;
import com.civicconnect.workflow.StatusHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ResolutionService {
    private final ComplaintRepository complaintRepository;
    private final ResolutionReportRepository resolutionReportRepository;
    private final EvidenceAttachmentRepository evidenceAttachmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Value("${app.workflow.objection-window-days:7}")
    private long objectionWindowDays;

    public ResolutionService(
            ComplaintRepository complaintRepository,
            ResolutionReportRepository resolutionReportRepository,
            EvidenceAttachmentRepository evidenceAttachmentRepository,
            StatusHistoryRepository statusHistoryRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.complaintRepository = complaintRepository;
        this.resolutionReportRepository = resolutionReportRepository;
        this.evidenceAttachmentRepository = evidenceAttachmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ResolutionReport submitResolutionReport(SubmitResolutionRequest req, User officer, String ipAddress) {
        Complaint complaint = complaintRepository.findById(req.getComplaintId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint record not found."));

        if (!officer.getId().equals(complaint.getAssignedOfficerId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the assigned officer can submit a resolution report.");
        }

        if (req.getEvidenceAttachments() == null || req.getEvidenceAttachments().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EVIDENCE_MANDATORY", "At least one supporting photographic evidence attachment is mandatory (SRS FR-14).");
        }

        ResolutionReport report = new ResolutionReport(
                complaint.getId(),
                officer.getId(),
                officer.getFullName(),
                req.getActionsTaken().trim(),
                req.getOutcomeDescription().trim(),
                req.getCompletionDate()
        );
        resolutionReportRepository.save(report);

        // Attach evidence files
        for (SubmitResolutionRequest.AttachmentInput att : req.getEvidenceAttachments()) {
            EvidenceAttachment ea = new EvidenceAttachment(
                    complaint.getId(),
                    report.getId(),
                    att.getFilename(),
                    att.getUrl() != null ? att.getUrl() : "storage/" + att.getFilename(),
                    att.getFileSize(),
                    att.getFileType() != null ? att.getFileType() : "application/octet-stream",
                    officer.getId(),
                    officer.getFullName()
            );
            evidenceAttachmentRepository.save(ea);
        }

        // Transition status to RESOLUTION_REPORT_SUBMITTED
        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.RESOLUTION_REPORT_SUBMITTED);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                complaint.getId(),
                oldStatus,
                ComplaintStatus.RESOLUTION_REPORT_SUBMITTED,
                officer.getId(),
                officer.getFullName(),
                UserRole.OFFICER,
                "Officer submitted resolution report with evidence for administrative review."
        ));

        // Alert administrators for review queue
        List<User> admins = userRepository.findByRoleAndAccountStatus(UserRole.ADMIN, AccountStatus.ACTIVE);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(),
                    UserRole.ADMIN,
                    "Resolution Report Awaiting Review",
                    "Resolution report submitted by " + officer.getFullName() + " for complaint " + complaint.getId(),
                    "REPORT_SUBMITTED",
                    complaint.getId()
            );
        }

        auditLogService.recordLog(
                officer.getId(),
                officer.getFullName(),
                "OFFICER",
                "SUBMIT_RESOLUTION_REPORT",
                "ResolutionReport",
                report.getId(),
                "Submitted resolution report for complaint " + complaint.getId(),
                ipAddress
        );

        return report;
    }

    @Transactional
    public Complaint reviewResolutionReport(String reportId, String decision, String reason, User admin, String ipAddress) {
        ResolutionReport report = resolutionReportRepository.findById(reportId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Resolution report not found."));

        Complaint complaint = complaintRepository.findById(report.getComplaintId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Associated complaint not found."));

        if ("REJECTED".equalsIgnoreCase(decision)) {
            if (reason == null || reason.trim().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "REJECTION_REASON_MANDATORY", "A mandatory explanation reason must be provided when rejecting a resolution report (SRS FR-15).");
            }

            report.setReviewStatus("REJECTED");
            report.setReviewerId(admin.getId());
            report.setReviewerName(admin.getFullName());
            report.setReviewReason(reason.trim());
            report.setReviewedAt(Instant.now());
            resolutionReportRepository.save(report);

            complaint.setStatus(ComplaintStatus.RESOLUTION_REPORT_REJECTED);
            complaintRepository.save(complaint);

            statusHistoryRepository.save(new StatusHistory(
                    complaint.getId(),
                    ComplaintStatus.RESOLUTION_REPORT_SUBMITTED,
                    ComplaintStatus.RESOLUTION_REPORT_REJECTED,
                    admin.getId(),
                    admin.getFullName(),
                    UserRole.ADMIN,
                    "Resolution report rejected by administrator: " + reason.trim()
            ));

            // Notify officer
            if (complaint.getAssignedOfficerId() != null) {
                notificationService.createNotification(
                        complaint.getAssignedOfficerId(),
                        UserRole.OFFICER,
                        "Resolution Report Rejected: " + complaint.getId(),
                        "Your resolution report was rejected by Administrator: " + reason.trim(),
                        "REPORT_REJECTED",
                        complaint.getId()
                );
            }

            auditLogService.recordLog(
                    admin.getId(),
                    admin.getFullName(),
                    "ADMIN",
                    "REJECT_RESOLUTION",
                    "ResolutionReport",
                    report.getId(),
                    "Rejected resolution report for complaint " + complaint.getId() + ". Reason: " + reason,
                    ipAddress
            );

            return complaint;
        }

        // APPROVED
        report.setReviewStatus("APPROVED");
        report.setReviewerId(admin.getId());
        report.setReviewerName(admin.getFullName());
        report.setReviewReason(reason);
        report.setReviewedAt(Instant.now());
        resolutionReportRepository.save(report);

        Instant windowEnd = Instant.now().plus(objectionWindowDays, ChronoUnit.DAYS);
        complaint.setStatus(ComplaintStatus.RESOLVED_AWAITING_FEEDBACK);
        complaint.setObjectionWindowEnd(windowEnd);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                complaint.getId(),
                ComplaintStatus.RESOLUTION_REPORT_SUBMITTED,
                ComplaintStatus.RESOLVED_AWAITING_FEEDBACK,
                admin.getId(),
                admin.getFullName(),
                UserRole.ADMIN,
                "Resolution report approved. 7-day citizen objection window initiated."
        ));

        // Notify citizen
        notificationService.createNotification(
                complaint.getCitizenId(),
                UserRole.CITIZEN,
                "Resolution Approved: " + complaint.getId(),
                "Your grievance has been resolved! You have 7 days to review the evidence and raise an objection if unsatisfied.",
                "CASE_RESOLVED",
                complaint.getId()
        );

        auditLogService.recordLog(
                admin.getId(),
                admin.getFullName(),
                "ADMIN",
                "APPROVE_RESOLUTION",
                "ResolutionReport",
                report.getId(),
                "Approved resolution report for complaint " + complaint.getId(),
                ipAddress
        );

        return complaint;
    }
}
