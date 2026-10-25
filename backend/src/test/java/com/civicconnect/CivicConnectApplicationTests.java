package com.civicconnect;

import com.civicconnect.auth.AuthService;
import com.civicconnect.auth.dto.LoginRequest;
import com.civicconnect.auth.dto.LoginResponse;
import com.civicconnect.auth.dto.RegisterRequest;
import com.civicconnect.auth.dto.RegisterResponse;
import com.civicconnect.category.Category;
import com.civicconnect.category.CategoryRepository;
import com.civicconnect.complaint.Complaint;
import com.civicconnect.complaint.ComplaintPriority;
import com.civicconnect.complaint.ComplaintService;
import com.civicconnect.complaint.ComplaintStatus;
import com.civicconnect.department.Department;
import com.civicconnect.department.DepartmentRepository;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import com.civicconnect.user.UserRole;
import com.civicconnect.ward.WardZone;
import com.civicconnect.ward.WardZoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class CivicConnectApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private WardZoneRepository wardZoneRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ComplaintService complaintService;

    @BeforeEach
    void setUp() {
        if (departmentRepository.count() == 0) {
            Department dept = new Department();
            dept.setId("dept-pwd");
            dept.setName("Public Works Department");
            dept.setCode("PWD");
            departmentRepository.save(dept);
        }

        if (wardZoneRepository.count() == 0) {
            WardZone zone = new WardZone();
            zone.setId("w-1");
            zone.setName("Ward 1 - Gandhi Nagar");
            zone.setCode("W-01");
            zone.setZone("North");
            wardZoneRepository.save(zone);
        }

        if (categoryRepository.count() == 0) {
            Category cat = new Category();
            cat.setId("cat-roads");
            cat.setName("Roads and Infrastructure");
            cat.setDefaultPriority("HIGH");
            cat.setDepartmentId("dept-pwd");
            categoryRepository.save(cat);
        }

        if (userRepository.findByEmailIgnoreCase("officer.pwd@civicpulse.org").isEmpty()) {
            User officer = new User();
            officer.setId("usr-off-1");
            officer.setFullName("Er. Test Officer");
            officer.setEmail("officer.pwd@civicpulse.org");
            officer.setPhone("+91 99999 11111");
            officer.setPasswordHash("$2a$10$w8.1PzTzLdE2vYh.4K7Z6L2eF1/G8B7uF.xS2o2Lp1/pZ4K7Z6L2e");
            officer.setRole(UserRole.OFFICER);
            officer.setDepartmentId("dept-pwd");
            officer.setEligibleCategoryIds(Set.of("cat-roads"));
            officer.setEligibleZoneIds(Set.of("w-1"));
            officer.setEmailVerified(true);
            userRepository.save(officer);
        }
    }

    @Test
    void testCitizenRegistrationAndLogin() {
        String email = "test.citizen." + System.currentTimeMillis() + "@civicpulse.org";
        RegisterRequest regReq = new RegisterRequest("Test Citizen", email, "+91 98765 00000", "SecurePass@123");
        RegisterResponse regResp = authService.register(regReq);
        assertNotNull(regResp);
        assertTrue(regResp.isEmailVerificationSent());

        // Attempt duplicate registration
        assertThrows(Exception.class, () -> authService.register(regReq));

        // Login with valid credentials
        LoginRequest loginReq = new LoginRequest(email, "SecurePass@123", "CITIZEN");
        LoginResponse loginResp = authService.login(loginReq);
        assertNotNull(loginResp);
        assertNotNull(loginResp.getToken());
        assertEquals("Test Citizen", loginResp.getUser().getFullName());

        // Login with invalid password
        LoginRequest badLogin = new LoginRequest(email, "WrongPassword@123", "CITIZEN");
        assertThrows(Exception.class, () -> authService.login(badLogin));
    }

    @Test
    void testComplaintSubmissionAndLifecycle() {
        String citizenEmail = "lifecycle.citizen." + System.currentTimeMillis() + "@civicpulse.org";
        authService.register(new RegisterRequest("Lifecycle User", citizenEmail, "+91 98765 12345", "Lifecycle@123"));
        User citizen = userRepository.findByEmailIgnoreCase(citizenEmail).orElseThrow();

        Map<String, Object> complaintData = Map.of(
                "title", "Deep Pothole on MG Road",
                "description", "Dangerous road depression causing traffic issues near junction",
                "categoryId", "cat-roads",
                "wardZoneId", "w-1",
                "exactLocation", "MG Road 4th Cross",
                "attachments", Collections.emptyList()
        );

        // Submit complaint
        Complaint submitted = complaintService.submitComplaint(complaintData, "idem-key-" + System.currentTimeMillis(), citizen.getId());
        assertNotNull(submitted);
        assertNotNull(submitted.getId());
        assertEquals(ComplaintStatus.ASSIGNED, submitted.getStatus());
        assertEquals("usr-off-1", submitted.getAssignedOfficerId());
        assertNotNull(submitted.getAckDeadline());
        assertNotNull(submitted.getActionDeadline());

        // Officer acknowledges
        Complaint ack = complaintService.acknowledgeComplaint(submitted.getId(), "usr-off-1");
        assertEquals(ComplaintStatus.ACKNOWLEDGED, ack.getStatus());
        assertNotNull(ack.getAcknowledgedAt());

        // Officer adds progress
        Complaint inProg = complaintService.addProgressUpdate(submitted.getId(), "Inspection completed, asphalt repair crew dispatched", "CITIZEN_VISIBLE", "usr-off-1");
        assertEquals(ComplaintStatus.IN_PROGRESS, inProg.getStatus());
        assertNotNull(inProg.getActionStartedAt());

        // Officer submits resolution report
        Map<String, Object> reportData = Map.of(
                "actionsTaken", "Filled depression with bitumen and leveled road surface",
                "outcomeDescription", "Roadway restored to safe operational conditions",
                "completionDate", "2026-10-25",
                "evidenceAttachments", Collections.singletonList(Map.of(
                        "filename", "repair_proof.jpg",
                        "fileSize", 102400,
                        "fileType", "image/jpeg",
                        "url", "https://example.com/repair_proof.jpg"
                ))
        );
        Complaint underReview = complaintService.submitResolutionReport(
                new java.util.HashMap<>(Map.of("complaintId", submitted.getId(), "actionsTaken", reportData.get("actionsTaken"), "outcomeDescription", reportData.get("outcomeDescription"), "completionDate", reportData.get("completionDate"), "evidenceAttachments", reportData.get("evidenceAttachments"))),
                "usr-off-1"
        );
        assertEquals(ComplaintStatus.RESOLUTION_REPORT_SUBMITTED, underReview.getStatus());
    }
}
