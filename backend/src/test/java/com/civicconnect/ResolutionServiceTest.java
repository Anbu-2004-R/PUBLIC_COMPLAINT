package com.civicconnect;

import com.civicconnect.attachment.EvidenceAttachmentRepository;
import com.civicconnect.audit.AuditLogService;
import com.civicconnect.common.ApiException;
import com.civicconnect.complaint.Complaint;
import com.civicconnect.complaint.ComplaintRepository;
import com.civicconnect.complaint.ComplaintStatus;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.resolution.ResolutionReport;
import com.civicconnect.resolution.ResolutionReportRepository;
import com.civicconnect.resolution.ResolutionService;
import com.civicconnect.resolution.SubmitResolutionRequest;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.workflow.StatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ResolutionServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;
    @Mock
    private ResolutionReportRepository resolutionReportRepository;
    @Mock
    private EvidenceAttachmentRepository evidenceAttachmentRepository;
    @Mock
    private StatusHistoryRepository statusHistoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    private ResolutionService resolutionService;

    @BeforeEach
    void setUp() {
        resolutionService = new ResolutionService(
                complaintRepository,
                resolutionReportRepository,
                evidenceAttachmentRepository,
                statusHistoryRepository,
                userRepository,
                notificationService,
                auditLogService
        );
    }

    @Test
    void testSubmitResolutionRequiresMandatoryEvidence() {
        User officer = new User();
        officer.setId("off-1");
        officer.setFullName("Er. Rajesh Kumar");

        Complaint complaint = new Complaint();
        complaint.setId("CP-2026-1001");
        complaint.setAssignedOfficerId("off-1");

        when(complaintRepository.findById("CP-2026-1001")).thenReturn(Optional.of(complaint));

        SubmitResolutionRequest req = new SubmitResolutionRequest();
        req.setComplaintId("CP-2026-1001");
        req.setActionsTaken("Road asphalt repaired");
        req.setOutcomeDescription("Smooth surface restored");
        req.setCompletionDate(LocalDate.now());
        req.setEvidenceAttachments(List.of()); // Empty evidence!

        assertThrows(ApiException.class, () -> resolutionService.submitResolutionReport(req, officer, "127.0.0.1"));
    }

    @Test
    void testRejectResolutionRequiresMandatoryReason() {
        User admin = new User();
        admin.setId("adm-1");
        admin.setFullName("Suresh Admin");

        ResolutionReport report = new ResolutionReport();
        report.setId("rr-1");
        report.setComplaintId("CP-2026-1001");

        Complaint complaint = new Complaint();
        complaint.setId("CP-2026-1001");

        when(resolutionReportRepository.findById("rr-1")).thenReturn(Optional.of(report));
        when(complaintRepository.findById("CP-2026-1001")).thenReturn(Optional.of(complaint));

        // Blank rejection reason should throw ApiException per SRS FR-15
        assertThrows(ApiException.class, () -> resolutionService.reviewResolutionReport("rr-1", "REJECTED", "", admin, "127.0.0.1"));
    }

    @Test
    void testApproveResolutionSetsSevenDayObjectionWindow() {
        User admin = new User();
        admin.setId("adm-1");
        admin.setFullName("Suresh Admin");

        ResolutionReport report = new ResolutionReport();
        report.setId("rr-1");
        report.setComplaintId("CP-2026-1001");

        Complaint complaint = new Complaint();
        complaint.setId("CP-2026-1001");
        complaint.setCitizenId("cit-1");

        when(resolutionReportRepository.findById("rr-1")).thenReturn(Optional.of(report));
        when(complaintRepository.findById("CP-2026-1001")).thenReturn(Optional.of(complaint));

        Complaint approved = resolutionService.reviewResolutionReport("rr-1", "APPROVED", "Satisfactory work", admin, "127.0.0.1");

        assertEquals(ComplaintStatus.RESOLVED_AWAITING_FEEDBACK, approved.getStatus());
        assertNotNull(approved.getObjectionWindowEnd());
        assertEquals("APPROVED", report.getReviewStatus());
    }
}
