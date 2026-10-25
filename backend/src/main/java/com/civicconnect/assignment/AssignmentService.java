package com.civicconnect.assignment;

import com.civicconnect.audit.AuditLogService;
import com.civicconnect.complaint.Complaint;
import com.civicconnect.complaint.ComplaintPriority;
import com.civicconnect.complaint.ComplaintRepository;
import com.civicconnect.complaint.ComplaintStatus;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.user.AccountStatus;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.user.UserRole;
import com.civicconnect.workflow.StatusHistory;
import com.civicconnect.workflow.StatusHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class AssignmentService {
    private static final Logger log = LoggerFactory.getLogger(AssignmentService.class);

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Value("${app.sla.critical.ack-minutes:15}")
    private long criticalAckMinutes;

    @Value("${app.sla.critical.action-minutes:60}")
    private long criticalActionMinutes;

    @Value("${app.sla.high.ack-hours:4}")
    private long highAckHours;

    @Value("${app.sla.high.action-hours:24}")
    private long highActionHours;

    @Value("${app.sla.medium.ack-hours:24}")
    private long mediumAckHours;

    @Value("${app.sla.medium.action-hours:72}")
    private long mediumActionHours;

    @Value("${app.sla.low.ack-hours:72}")
    private long lowAckHours;

    @Value("${app.sla.low.action-hours:168}")
    private long lowActionHours;

    public AssignmentService(
            UserRepository userRepository,
            ComplaintRepository complaintRepository,
            StatusHistoryRepository statusHistoryRepository,
            NotificationService notificationService,
            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public void assignComplaintAutomatically(Complaint complaint) {
        // Query eligible officers
        List<User> eligibleOfficers = userRepository.findEligibleOfficers(
                complaint.getDepartmentId(),
                complaint.getCategoryId(),
                complaint.getWardZoneId()
        );

        // Filter for available officers
        List<User> availableOfficers = eligibleOfficers.stream()
                .filter(u -> "AVAILABLE".equalsIgnoreCase(u.getAvailabilityStatus()))
                .toList();

        if (availableOfficers.isEmpty()) {
            // No eligible officer found -> Mark as UNASSIGNED
            log.info("No eligible officer available for complaint {}. Marking UNASSIGNED.", complaint.getId());
            complaint.setStatus(ComplaintStatus.UNASSIGNED);
            complaintRepository.save(complaint);

            statusHistoryRepository.save(new StatusHistory(
                    complaint.getId(),
                    ComplaintStatus.SUBMITTED,
                    ComplaintStatus.UNASSIGNED,
                    "SYSTEM",
                    "Automated Routing Engine",
                    UserRole.ADMIN,
                    "No eligible officer found matching Department, Category, and Ward/Zone."
            ));

            // Notify administrators
            List<User> admins = userRepository.findByRoleAndAccountStatus(UserRole.ADMIN, AccountStatus.ACTIVE);
            for (User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        UserRole.ADMIN,
                        "Unassigned Complaint Requires Routing",
                        "Complaint " + complaint.getId() + " (" + complaint.getTitle() + ") could not be assigned automatically.",
                        "UNASSIGNED_QUEUE",
                        complaint.getId()
                );
            }
            return;
        }

        // Workload balancing: choose officer with lowest active complaint count
        List<ComplaintStatus> finished = List.of(ComplaintStatus.CLOSED, ComplaintStatus.RESOLVED_AWAITING_FEEDBACK, ComplaintStatus.WITHDRAWN);
        User selectedOfficer = availableOfficers.stream()
                .min(Comparator.comparingLong(o -> complaintRepository.countByAssignedOfficerIdAndStatusNotIn(o.getId(), finished)))
                .orElse(availableOfficers.get(0));

        // Assign
        assignToOfficer(complaint, selectedOfficer, "SYSTEM", "Automated Workload Balancing", "AUTOMATIC");
    }

    @Transactional
    public void assignToOfficer(Complaint complaint, User officer, String actorId, String actorName, String reason) {
        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setAssignedOfficerId(officer.getId());
        complaint.setAssignedAt(Instant.now());
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        // Calculate SLA targets
        calculateSlaDeadlines(complaint);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                complaint.getId(),
                oldStatus,
                ComplaintStatus.ASSIGNED,
                actorId,
                actorName,
                UserRole.ADMIN,
                "Assigned to " + officer.getFullName() + ". Reason: " + reason
        ));

        // Notify officer
        notificationService.createNotification(
                officer.getId(),
                UserRole.OFFICER,
                "New Case Assigned: " + complaint.getId(),
                "You have been assigned complaint: " + complaint.getTitle() + " (Priority: " + complaint.getPriority() + ")",
                "NEW_ASSIGNMENT",
                complaint.getId()
        );

        auditLogService.recordLog(
                actorId,
                actorName,
                "ADMIN",
                "ASSIGN_OFFICER",
                "Complaint",
                complaint.getId(),
                "Assigned to officer " + officer.getFullName() + " (" + officer.getId() + "). Reason: " + reason,
                "SYSTEM"
        );
    }

    public void calculateSlaDeadlines(Complaint complaint) {
        Instant now = Instant.now();
        ComplaintPriority priority = complaint.getPriority();

        if (priority == ComplaintPriority.CRITICAL) {
            complaint.setAckDeadline(now.plus(criticalAckMinutes, ChronoUnit.MINUTES));
            complaint.setActionDeadline(now.plus(criticalActionMinutes, ChronoUnit.MINUTES));
        } else if (priority == ComplaintPriority.HIGH) {
            complaint.setAckDeadline(now.plus(highAckHours, ChronoUnit.HOURS));
            complaint.setActionDeadline(now.plus(highActionHours, ChronoUnit.HOURS));
        } else if (priority == ComplaintPriority.MEDIUM) {
            complaint.setAckDeadline(now.plus(mediumAckHours, ChronoUnit.HOURS));
            complaint.setActionDeadline(now.plus(mediumActionHours, ChronoUnit.HOURS));
        } else {
            complaint.setAckDeadline(now.plus(lowAckHours, ChronoUnit.HOURS));
            complaint.setActionDeadline(now.plus(lowActionHours, ChronoUnit.HOURS));
        }
    }
}
