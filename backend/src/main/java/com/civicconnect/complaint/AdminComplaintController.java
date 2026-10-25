package com.civicconnect.complaint;

import com.civicconnect.common.PaginatedResult;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminComplaintController {

    private final ComplaintService complaintService;

    public AdminComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/complaints")
    public ResponseEntity<PaginatedResult<Complaint>> getComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String wardZoneId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String officerId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(complaintService.getAdminComplaints(
                search, status, priority, departmentId, wardZoneId, categoryId, officerId, page, size
        ));
    }

    @GetMapping("/complaints/unassigned")
    public ResponseEntity<PaginatedResult<Complaint>> getUnassignedQueue(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(complaintService.getUnassignedQueue(page, size));
    }

    @PostMapping("/complaints/{id}/assign")
    public ResponseEntity<Complaint> assignOfficer(@PathVariable String id,
                                                   @RequestBody Map<String, String> body,
                                                   Authentication authentication) {
        String adminId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.assignOfficer(id, body.get("officerId"), body.get("reason"), adminId));
    }

    @PatchMapping("/complaints/{id}/correction")
    public ResponseEntity<Complaint> correctRouting(@PathVariable String id,
                                                    @RequestBody Map<String, String> body,
                                                    Authentication authentication) {
        String adminId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.correctRouting(
                id, body.get("newCategoryId"), body.get("newPriority"), body.get("reason"), adminId
        ));
    }

    @PostMapping("/complaints/{id}/escalate")
    public ResponseEntity<Complaint> escalateComplaint(@PathVariable String id,
                                                       @RequestBody Map<String, String> body,
                                                       Authentication authentication) {
        String adminId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.escalateComplaint(id, body.get("reason"), adminId));
    }

    @PostMapping("/complaints/{id}/close")
    public ResponseEntity<Complaint> closeComplaint(@PathVariable String id,
                                                    @RequestBody Map<String, String> body,
                                                    Authentication authentication) {
        String adminId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.closeComplaint(id, body.get("reason"), adminId));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<ResolutionReport>> getResolutionReviews() {
        return ResponseEntity.ok(complaintService.getResolutionReviews());
    }

    @PostMapping("/reviews/{reportId}/approve")
    public ResponseEntity<Complaint> approveResolutionReport(@PathVariable String reportId,
                                                             @RequestBody Map<String, String> body,
                                                             Authentication authentication) {
        String adminId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.reviewResolutionReport(reportId, "APPROVED", body.get("reason"), adminId));
    }

    @PostMapping("/reviews/{reportId}/reject")
    public ResponseEntity<Complaint> rejectResolutionReport(@PathVariable String reportId,
                                                            @RequestBody Map<String, String> body,
                                                            Authentication authentication) {
        String adminId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.reviewResolutionReport(reportId, "REJECTED", body.get("reason"), adminId));
    }
}
