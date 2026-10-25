package com.civicconnect.officer;

import com.civicconnect.common.ApiException;
import com.civicconnect.common.PaginatedResult;
import com.civicconnect.complaint.Complaint;
import com.civicconnect.complaint.ComplaintDto;
import com.civicconnect.complaint.ComplaintPriority;
import com.civicconnect.complaint.ComplaintRepository;
import com.civicconnect.complaint.ComplaintService;
import com.civicconnect.complaint.ComplaintStatus;
import com.civicconnect.investigation.CitizenInfoRequest;
import com.civicconnect.investigation.CitizenInfoRequestRepository;
import com.civicconnect.investigation.ProgressUpdate;
import com.civicconnect.investigation.ProgressUpdateRepository;
import com.civicconnect.notification.NotificationService;
import com.civicconnect.resolution.ResolutionReport;
import com.civicconnect.resolution.ResolutionService;
import com.civicconnect.resolution.SubmitResolutionRequest;
import com.civicconnect.security.UserPrincipal;
import com.civicconnect.user.UserRole;
import com.civicconnect.workflow.StatusHistory;
import com.civicconnect.workflow.StatusHistoryRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/officer")
public class OfficerController {
    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;
    private final StatusHistoryRepository statusHistoryRepository;
    private final ProgressUpdateRepository progressUpdateRepository;
    private final CitizenInfoRequestRepository citizenInfoRequestRepository;
    private final ResolutionService resolutionService;
    private final NotificationService notificationService;

    public OfficerController(
            ComplaintRepository complaintRepository,
            ComplaintService complaintService,
            StatusHistoryRepository statusHistoryRepository,
            ProgressUpdateRepository progressUpdateRepository,
            CitizenInfoRequestRepository citizenInfoRequestRepository,
            ResolutionService resolutionService,
            NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.complaintService = complaintService;
        this.statusHistoryRepository = statusHistoryRepository;
        this.progressUpdateRepository = progressUpdateRepository;
        this.citizenInfoRequestRepository = citizenInfoRequestRepository;
        this.resolutionService = resolutionService;
        this.notificationService = notificationService;
    }

    @GetMapping("/complaints")
    public ResponseEntity<PaginatedResult<ComplaintDto>> getAssignedComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ComplaintStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = ComplaintStatus.valueOf(status); } catch (Exception ignored) {}
        }

        ComplaintPriority priorityEnum = null;
        if (priority != null && !priority.isBlank()) {
            try { priorityEnum = ComplaintPriority.valueOf(priority); } catch (Exception ignored) {}
        }

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> complaintPage = complaintRepository.searchOfficerComplaints(
                userPrincipal.getId(),
                statusEnum,
                priorityEnum,
                search != null && !search.isBlank() ? search : null,
                pageable
        );

        List<ComplaintDto> dtos = complaintPage.getContent().stream()
                .map(c -> complaintService.toDto(c, userPrincipal.getUser()))
                .toList();

        return ResponseEntity.ok(new PaginatedResult<>(dtos, page, size, complaintPage.getTotalElements(), complaintPage.getTotalPages()));
    }

    @PostMapping("/complaints/{id}/acknowledge")
    public ResponseEntity<ComplaintDto> acknowledgeComplaint(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!userPrincipal.getId().equals(complaint.getAssignedOfficerId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the assigned officer can acknowledge this complaint.");
        }

        complaint.setStatus(ComplaintStatus.ACKNOWLEDGED);
        complaint.setAcknowledgedAt(Instant.now());
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                id,
                ComplaintStatus.ASSIGNED,
                ComplaintStatus.ACKNOWLEDGED,
                userPrincipal.getId(),
                userPrincipal.getUser().getFullName(),
                UserRole.OFFICER,
                "Officer acknowledged complaint assignment."
        ));

        // Notify citizen
        notificationService.createNotification(
                complaint.getCitizenId(),
                UserRole.CITIZEN,
                "Complaint Acknowledged: " + complaint.getId(),
                "Officer " + userPrincipal.getUser().getFullName() + " has acknowledged your grievance and initiated preliminary investigation.",
                "CASE_ACKNOWLEDGED",
                complaint.getId()
        );

        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @PostMapping("/complaints/{id}/progress")
    public ResponseEntity<ComplaintDto> addProgressUpdate(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!userPrincipal.getId().equals(complaint.getAssignedOfficerId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the assigned officer can add progress notes.");
        }

        String note = body.get("note");
        String visibility = body.getOrDefault("visibility", "CITIZEN_VISIBLE");

        ProgressUpdate pu = new ProgressUpdate(id, userPrincipal.getId(), userPrincipal.getUser().getFullName(), note, visibility);
        progressUpdateRepository.save(pu);

        if (complaint.getStatus() == ComplaintStatus.ACKNOWLEDGED) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            complaint.setActionStartedAt(Instant.now());
            complaintRepository.save(complaint);

            statusHistoryRepository.save(new StatusHistory(
                    id,
                    ComplaintStatus.ACKNOWLEDGED,
                    ComplaintStatus.IN_PROGRESS,
                    userPrincipal.getId(),
                    userPrincipal.getUser().getFullName(),
                    UserRole.OFFICER,
                    "Investigation work commenced."
            ));
        }

        if ("CITIZEN_VISIBLE".equalsIgnoreCase(visibility)) {
            notificationService.createNotification(
                    complaint.getCitizenId(),
                    UserRole.CITIZEN,
                    "Progress Update on " + complaint.getId(),
                    "Officer note: " + note,
                    "PROGRESS_UPDATE",
                    complaint.getId()
            );
        }

        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @PostMapping("/complaints/{id}/info-requests")
    public ResponseEntity<ComplaintDto> requestCitizenInfo(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Complaint not found."));

        if (!userPrincipal.getId().equals(complaint.getAssignedOfficerId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the assigned officer can request information.");
        }

        String message = body.get("message");
        CitizenInfoRequest cir = new CitizenInfoRequest(id, userPrincipal.getId(), userPrincipal.getUser().getFullName(), message);
        citizenInfoRequestRepository.save(cir);

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.AWAITING_CITIZEN_INFO);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(new StatusHistory(
                id,
                oldStatus,
                ComplaintStatus.AWAITING_CITIZEN_INFO,
                userPrincipal.getId(),
                userPrincipal.getUser().getFullName(),
                UserRole.OFFICER,
                "Requested additional details from citizen: " + message
        ));

        // Alert citizen
        notificationService.createNotification(
                complaint.getCitizenId(),
                UserRole.CITIZEN,
                "Information Requested: " + complaint.getId(),
                "The investigating officer requested clarification: " + message,
                "ACTION_REQUIRED",
                complaint.getId()
        );

        return ResponseEntity.ok(complaintService.toDto(complaint, userPrincipal.getUser()));
    }

    @PostMapping("/complaints/{id}/resolution-reports")
    public ResponseEntity<ComplaintDto> submitResolutionReport(
            @PathVariable String id,
            @Valid @RequestBody SubmitResolutionRequest req,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {
        req.setComplaintId(id);
        resolutionService.submitResolutionReport(req, userPrincipal.getUser(), request.getRemoteAddr());
        Complaint updated = complaintRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(complaintService.toDto(updated, userPrincipal.getUser()));
    }
}
