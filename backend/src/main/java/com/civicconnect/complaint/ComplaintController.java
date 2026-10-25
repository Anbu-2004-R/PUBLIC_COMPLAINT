package com.civicconnect.complaint;

import com.civicconnect.common.PaginatedResult;
import com.civicconnect.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
public class ComplaintController {
    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ComplaintDto> submitComplaint(
            @Valid @RequestBody SubmitComplaintRequest req,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        ComplaintDto dto = complaintService.submitComplaint(req, userPrincipal.getUser(), idempotencyKey, ip);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<PaginatedResult<ComplaintDto>> getComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PaginatedResult<ComplaintDto> result = complaintService.getMyComplaints(userPrincipal.getUser(), search, status, category, priority, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/mine")
    public ResponseEntity<PaginatedResult<ComplaintDto>> getMyComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PaginatedResult<ComplaintDto> result = complaintService.getMyComplaints(userPrincipal.getUser(), search, status, category, priority, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDto> getComplaintById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ComplaintDto dto = complaintService.getComplaintById(id, userPrincipal.getUser());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/duplicate-check")
    public ResponseEntity<Map<String, Object>> checkDuplicates(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String categoryId = body.get("categoryId");
        String wardZoneId = body.get("wardZoneId");
        String title = body.get("title");
        Map<String, Object> result = complaintService.checkDuplicates(categoryId, wardZoneId, title, userPrincipal.getId());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/info-responses")
    public ResponseEntity<ComplaintDto> replyToInfoRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String response = body.get("response");
        ComplaintDto dto = complaintService.replyToInfoRequest(id, response, userPrincipal.getUser());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/objections")
    public ResponseEntity<ComplaintDto> submitObjection(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String reason = body.get("reason");
        ComplaintDto dto = complaintService.submitObjection(id, reason, userPrincipal.getUser());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<ComplaintDto> submitFeedback(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        int rating = Integer.parseInt(body.get("rating").toString());
        String comment = body.get("comment") != null ? body.get("comment").toString() : null;
        ComplaintDto dto = complaintService.submitFeedback(id, rating, comment, userPrincipal.getUser());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/reopen-requests")
    public ResponseEntity<ComplaintDto> requestReopening(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String reason = body.get("reason");
        ComplaintDto dto = complaintService.requestReopening(id, reason, userPrincipal.getUser());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/withdrawal-requests")
    public ResponseEntity<ComplaintDto> requestWithdrawal(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String reason = body.get("reason");
        ComplaintDto dto = complaintService.requestWithdrawal(id, reason, userPrincipal.getUser());
        return ResponseEntity.ok(dto);
    }
}
