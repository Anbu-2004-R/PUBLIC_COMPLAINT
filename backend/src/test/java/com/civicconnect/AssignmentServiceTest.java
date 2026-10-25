package com.civicconnect;

import com.civicconnect.assignment.AssignmentService;
import com.civicconnect.audit.AuditLogService;
import com.civicconnect.complaint.Complaint;
import com.civicconnect.complaint.ComplaintPriority;
import com.civicconnect.complaint.ComplaintRepository;
import com.civicconnect.complaint.ComplaintStatus;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.user.AccountStatus;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.workflow.StatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssignmentServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ComplaintRepository complaintRepository;
    @Mock
    private StatusHistoryRepository statusHistoryRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    private AssignmentService assignmentService;

    @BeforeEach
    void setUp() {
        assignmentService = new AssignmentService(
                userRepository,
                complaintRepository,
                statusHistoryRepository,
                notificationService,
                auditLogService
        );
    }

    @Test
    void testAutomaticAssignmentSelectsOfficerWithLeastWorkload() {
        Complaint complaint = new Complaint();
        complaint.setId("CP-2026-1001");
        complaint.setDepartmentId("dept-pwd");
        complaint.setCategoryId("cat-roads");
        complaint.setWardZoneId("ward-101");
        complaint.setPriority(ComplaintPriority.HIGH);
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        User officer1 = new User();
        officer1.setId("off-1");
        officer1.setFullName("Officer One");
        officer1.setAvailabilityStatus("AVAILABLE");

        User officer2 = new User();
        officer2.setId("off-2");
        officer2.setFullName("Officer Two");
        officer2.setAvailabilityStatus("AVAILABLE");

        when(userRepository.findEligibleOfficers("dept-pwd", "cat-roads", "ward-101"))
                .thenReturn(List.of(officer1, officer2));

        // officer 1 has 5 active complaints, officer 2 has 2 active complaints
        when(complaintRepository.countByAssignedOfficerIdAndStatusNotIn(eq("off-1"), any())).thenReturn(5L);
        when(complaintRepository.countByAssignedOfficerIdAndStatusNotIn(eq("off-2"), any())).thenReturn(2L);

        assignmentService.assignComplaintAutomatically(complaint);

        assertEquals("off-2", complaint.getAssignedOfficerId());
        assertEquals(ComplaintStatus.ASSIGNED, complaint.getStatus());
        assertNotNull(complaint.getAckDeadline());
        assertNotNull(complaint.getActionDeadline());
    }

    @Test
    void testAssignmentMarksUnassignedWhenNoEligibleOfficers() {
        Complaint complaint = new Complaint();
        complaint.setId("CP-2026-1002");
        complaint.setDepartmentId("dept-pwd");
        complaint.setCategoryId("cat-roads");
        complaint.setWardZoneId("ward-999");
        complaint.setPriority(ComplaintPriority.MEDIUM);
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        when(userRepository.findEligibleOfficers("dept-pwd", "cat-roads", "ward-999"))
                .thenReturn(List.of());

        assignmentService.assignComplaintAutomatically(complaint);

        assertEquals(ComplaintStatus.UNASSIGNED, complaint.getStatus());
        assertNull(complaint.getAssignedOfficerId());
    }
}
