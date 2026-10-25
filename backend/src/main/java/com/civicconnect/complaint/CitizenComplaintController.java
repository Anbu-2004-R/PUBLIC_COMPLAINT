package com.civicconnect.complaint;

import com.civicconnect.common.PaginatedResult;
import com.civicconnect.user.User;
import com.civicconnect.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/complaints")
public class CitizenComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    public CitizenComplaintController(ComplaintService complaintService, UserRepository userRepository) {
        this.complaintService = complaintService;
        this.userRepository = userRepository;
    }

    @GetMapping("/mine")
    public ResponseEntity<PaginatedResult<Complaint>> getMyComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String citizenId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.getCitizenComplaints(citizenId, search, status, category, priority, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable String id, Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow();
        return ResponseEntity.ok(complaintService.getComplaintById(id, user));
    }

    @PostMapping("/duplicate-check")
    public ResponseEntity<Map<String, Object>> checkDuplicates(@RequestBody Map<String, String> body,
                                                              Authentication authentication) {
        String citizenId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.checkDuplicates(
                body.get("categoryId"), body.get("wardZoneId"), body.get("title"), citizenId
        ));
    }

    @PostMapping
    public ResponseEntity<Complaint> submitComplaint(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            Authentication authentication) {
        String citizenId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.submitComplaint(body, idempotencyKey, citizenId));
    }

    @PostMapping("/{id}/info-responses")
    public ResponseEntity<Complaint> replyToInfoRequest(@PathVariable String id,
                                                        @RequestBody Map<String, String> body,
                                                        Authentication authentication) {
        String citizenId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.replyToInfoRequest(id, body.get("response"), citizenId));
    }

    @PostMapping("/{id}/objections")
    public ResponseEntity<Complaint> submitObjection(@PathVariable String id,
                                                    @RequestBody Map<String, String> body,
                                                    Authentication authentication) {
        String citizenId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.submitObjection(id, body.get("reason"), citizenId));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<Complaint> submitFeedback(@PathVariable String id,
                                                    @RequestBody Map<String, Object> body,
                                                    Authentication authentication) {
        String citizenId = (String) authentication.getPrincipal();
        int rating = ((Number) body.get("rating")).intValue();
        String comment = (String) body.get("comment");
        return ResponseEntity.ok(complaintService.submitFeedback(id, rating, comment, citizenId));
    }

    @PostMapping("/{id}/reopen-requests")
    public ResponseEntity<Complaint> requestReopening(@PathVariable String id,
                                                      @RequestBody Map<String, String> body,
                                                      Authentication authentication) {
        String citizenId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.requestReopening(id, body.get("reason"), citizenId));
    }

    @PostMapping("/{id}/withdrawal-requests")
    public ResponseEntity<Complaint> requestWithdrawal(@PathVariable String id,
                                                       @RequestBody Map<String, String> body,
                                                       Authentication authentication) {
        String citizenId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(complaintService.requestWithdrawal(id, body.get("reason"), citizenId));
    }
}
