package com.civicconnect.workflow;

import com.civicconnect.audit.AuditLogService;
import com.civicconnect.complaint.Complaint;
import com.civicconnect.complaint.ComplaintRepository;
import com.civicconnect.complaint.ComplaintStatus;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.user.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class ScheduledWorkflowTasks {
    private static final Logger log = LoggerFactory.getLogger(ScheduledWorkflowTasks.class);

    private final ComplaintRepository complaintRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ScheduledWorkflowTasks(
            ComplaintRepository complaintRepository,
            StatusHistoryRepository statusHistoryRepository,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.complaintRepository = complaintRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    /**
     * Automatically closes resolved complaints when the 7-day citizen objection window expires without an objection.
     */
    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void processAutoClosure() {
        Instant now = Instant.now();
        List<Complaint> eligible = complaintRepository.findComplaintsEligibleForAutoClosure(now);

        for (Complaint c : eligible) {
            log.info("Auto-closing complaint {} as 7-day objection window expired.", c.getId());
            c.setStatus(ComplaintStatus.CLOSED);
            c.setClosedAt(now);
            complaintRepository.save(c);

            statusHistoryRepository.save(new StatusHistory(
                    c.getId(),
                    ComplaintStatus.RESOLVED_AWAITING_FEEDBACK,
                    ComplaintStatus.CLOSED,
                    "SYSTEM",
                    "Automated Workflow Engine",
                    UserRole.ADMIN,
                    "Complaint automatically closed upon expiration of 7-day citizen objection window."
            ));

            notificationService.createNotification(
                    c.getCitizenId(),
                    UserRole.CITIZEN,
                    "Case Closed: " + c.getId(),
                    "Your complaint " + c.getId() + " has been closed as the 7-day objection period concluded.",
                    "CASE_CLOSED",
                    c.getId()
            );

            auditLogService.recordLog(
                    "SYSTEM",
                    "Automated Workflow Engine",
                    "SYSTEM",
                    "AUTO_CLOSE_COMPLAINT",
                    "Complaint",
                    c.getId(),
                    "Automatic closure after 7-day window",
                    "127.0.0.1"
            );
        }
    }
}
