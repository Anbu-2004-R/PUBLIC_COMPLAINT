package com.civicconnect.complaint;

import com.civicconnect.common.PaginatedResult;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/officer/complaints")
@PreAuthorize("hasRole('OFFICER')")
public class OfficerComplaintController {

    private final ComplaintService complaintService;

    public OfficerComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResult<Complaint>> getAssignedComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Boolean overdueOnly,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String officerId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.getOfficerComplaints(officerId, search, status, priority, overdueOnly, page, size));
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<Complaint> acknowledgeComplaint(@PathVariable String id, Authentication authentication) {
        String officerId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.acknowledgeComplaint(id, officerId));
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<Complaint> addProgressUpdate(@PathVariable String id,
                                                       @RequestBody Map<String, String> body,
                                                       Authentication authentication) {
        String officerId = (String) authentication.getPrincipal();
        String note = body.get("note");
        String visibility = body.getOrDefault("visibility", "CITIZEN_VISIBLE");
        return ResponseEntity.ok(complaintService.addProgressUpdate(id, note, visibility, officerId));
    }

    @PostMapping("/{id}/info-requests")
    public ResponseEntity<Complaint> requestCitizenInfo(@PathVariable String id,
                                                        @RequestBody Map<String, String> body,
                                                        Authentication authentication) {
        String officerId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.requestCitizenInfo(id, body.get("message"), officerId));
    }

    @PostMapping("/{id}/resolution-reports")
    public ResponseEntity<Complaint> submitResolutionReport(@PathVariable String id,
                                                            @RequestBody Map<String, Object> body,
                                                            Authentication authentication) {
        String officerId = (String) authentication.getPrincipal();
        body.put("complaintId", id);
        return ResponseEntity.ok(complaintService.submitResolutionReport(body, officerId));
    }
}
