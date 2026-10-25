package com.civicconnect.complaint;

import com.civicconnect.attachment.EvidenceAttachment;
import com.civicconnect.feedback.Feedback;
import com.civicconnect.investigation.CitizenInfoRequest;
import com.civicconnect.investigation.ProgressUpdate;
import com.civicconnect.resolution.ResolutionReport;
import com.civicconnect.workflow.StatusHistory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ComplaintDto {
    private String id;
    private String citizenId;
    private String citizenName;
    private String citizenPhone;
    private String citizenEmail;
    private String categoryId;
    private String categoryName;
    private String departmentId;
    private String departmentName;
    private String wardZoneId;
    private String wardZoneName;
    private String title;
    private String description;
    private String exactLocation;
    private Map<String, BigDecimal> mapCoordinates;
    private LocalDate incidentDate;
    private String priority;
    private String status;
    private String assignedOfficerId;
    private String assignedOfficerName;
    private Instant assignedAt;
    private Instant ackDeadline;
    private Instant actionDeadline;
    private Instant acknowledgedAt;
    private Instant actionStartedAt;
    private Instant submittedAt;
    private Instant updatedAt;
    private Instant objectionWindowEnd;
    private Instant closedAt;
    private boolean isPaused;
    private String pauseReason;
    private String pendingWithdrawalReason;
    private String pendingReopenReason;
    private List<AttachmentDto> attachments = new ArrayList<>();
    private List<String> allowedActions = new ArrayList<>();
    private List<HistoryDto> history = new ArrayList<>();
    private List<ProgressDto> progressUpdates = new ArrayList<>();
    private List<InfoRequestDto> infoRequests = new ArrayList<>();
    private List<ReportDto> resolutionReports = new ArrayList<>();
    private FeedbackDto feedback;

    public ComplaintDto() {}

    public static class AttachmentDto {
        private String id;
        private String filename;
        private long fileSize;
        private String fileType;
        private Instant uploadedAt;
        private String uploadedBy;
        private String url;

        public AttachmentDto() {}

        public AttachmentDto(EvidenceAttachment ea) {
            this.id = ea.getId();
            this.filename = ea.getFilename();
            this.fileSize = ea.getFileSize();
            this.fileType = ea.getFileType();
            this.uploadedAt = ea.getCreatedAt();
            this.uploadedBy = ea.getUploadedBy();
            this.url = "/api/v1/attachments/" + ea.getId();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }
        public Instant getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
        public String getUploadedBy() { return uploadedBy; }
        public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    public static class HistoryDto {
        private String id;
        private String complaintId;
        private String oldStatus;
        private String newStatus;
        private String changedBy;
        private String changedByName;
        private String changedByRole;
        private Instant changedAt;
        private String reason;

        public HistoryDto() {}

        public HistoryDto(StatusHistory sh) {
            this.id = sh.getId();
            this.complaintId = sh.getComplaintId();
            this.oldStatus = sh.getOldStatus() != null ? sh.getOldStatus().name() : null;
            this.newStatus = sh.getNewStatus().name();
            this.changedBy = sh.getChangedBy();
            this.changedByName = sh.getChangedByName();
            this.changedByRole = sh.getChangedByRole().name();
            this.changedAt = sh.getCreatedAt();
            this.reason = sh.getReason();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getComplaintId() { return complaintId; }
        public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
        public String getOldStatus() { return oldStatus; }
        public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }
        public String getNewStatus() { return newStatus; }
        public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
        public String getChangedBy() { return changedBy; }
        public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
        public String getChangedByName() { return changedByName; }
        public void setChangedByName(String changedByName) { this.changedByName = changedByName; }
        public String getChangedByRole() { return changedByRole; }
        public void setChangedByRole(String changedByRole) { this.changedByRole = changedByRole; }
        public Instant getChangedAt() { return changedAt; }
        public void setChangedAt(Instant changedAt) { this.changedAt = changedAt; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class ProgressDto {
        private String id;
        private String complaintId;
        private String officerId;
        private String officerName;
        private Instant timestamp;
        private String note;
        private String visibility;

        public ProgressDto() {}

        public ProgressDto(ProgressUpdate pu) {
            this.id = pu.getId();
            this.complaintId = pu.getComplaintId();
            this.officerId = pu.getOfficerId();
            this.officerName = pu.getOfficerName();
            this.timestamp = pu.getCreatedAt();
            this.note = pu.getNote();
            this.visibility = pu.getVisibility();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getComplaintId() { return complaintId; }
        public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
        public String getOfficerId() { return officerId; }
        public void setOfficerId(String officerId) { this.officerId = officerId; }
        public String getOfficerName() { return officerName; }
        public void setOfficerName(String officerName) { this.officerName = officerName; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public String getVisibility() { return visibility; }
        public void setVisibility(String visibility) { this.visibility = visibility; }
    }

    public static class InfoRequestDto {
        private String id;
        private String complaintId;
        private Instant requestedAt;
        private String officerName;
        private String message;
        private String response;
        private Instant respondedAt;

        public InfoRequestDto() {}

        public InfoRequestDto(CitizenInfoRequest cir) {
            this.id = cir.getId();
            this.complaintId = cir.getComplaintId();
            this.requestedAt = cir.getRequestedAt();
            this.officerName = cir.getOfficerName();
            this.message = cir.getMessage();
            this.response = cir.getResponse();
            this.respondedAt = cir.getRespondedAt();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getComplaintId() { return complaintId; }
        public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
        public Instant getRequestedAt() { return requestedAt; }
        public void setRequestedAt(Instant requestedAt) { this.requestedAt = requestedAt; }
        public String getOfficerName() { return officerName; }
        public void setOfficerName(String officerName) { this.officerName = officerName; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
        public Instant getRespondedAt() { return respondedAt; }
        public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }
    }

    public static class ReportDto {
        private String id;
        private String complaintId;
        private String officerId;
        private String officerName;
        private String actionsTaken;
        private String outcomeDescription;
        private LocalDate completionDate;
        private Instant submittedAt;
        private String reviewStatus;
        private AdminDecisionDto adminDecision;
        private List<AttachmentDto> evidenceAttachments = new ArrayList<>();

        public ReportDto() {}

        public ReportDto(ResolutionReport rr, List<AttachmentDto> attachments) {
            this.id = rr.getId();
            this.complaintId = rr.getComplaintId();
            this.officerId = rr.getOfficerId();
            this.officerName = rr.getOfficerName();
            this.actionsTaken = rr.getActionsTaken();
            this.outcomeDescription = rr.getOutcomeDescription();
            this.completionDate = rr.getCompletionDate();
            this.submittedAt = rr.getSubmittedAt();
            this.reviewStatus = rr.getReviewStatus();
            this.evidenceAttachments = attachments;
            if (rr.getReviewerName() != null) {
                this.adminDecision = new AdminDecisionDto(rr.getReviewStatus(), rr.getReviewerName(), rr.getReviewedAt(), rr.getReviewReason());
            }
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getComplaintId() { return complaintId; }
        public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
        public String getOfficerId() { return officerId; }
        public void setOfficerId(String officerId) { this.officerId = officerId; }
        public String getOfficerName() { return officerName; }
        public void setOfficerName(String officerName) { this.officerName = officerName; }
        public String getActionsTaken() { return actionsTaken; }
        public void setActionsTaken(String actionsTaken) { this.actionsTaken = actionsTaken; }
        public String getOutcomeDescription() { return outcomeDescription; }
        public void setOutcomeDescription(String outcomeDescription) { this.outcomeDescription = outcomeDescription; }
        public LocalDate getCompletionDate() { return completionDate; }
        public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }
        public Instant getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
        public String getReviewStatus() { return reviewStatus; }
        public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }
        public AdminDecisionDto getAdminDecision() { return adminDecision; }
        public void setAdminDecision(AdminDecisionDto adminDecision) { this.adminDecision = adminDecision; }
        public List<AttachmentDto> getEvidenceAttachments() { return evidenceAttachments; }
        public void setEvidenceAttachments(List<AttachmentDto> evidenceAttachments) { this.evidenceAttachments = evidenceAttachments; }
    }

    public static class AdminDecisionDto {
        private String decision;
        private String reviewerName;
        private Instant reviewedAt;
        private String reason;

        public AdminDecisionDto() {}

        public AdminDecisionDto(String decision, String reviewerName, Instant reviewedAt, String reason) {
            this.decision = decision;
            this.reviewerName = reviewerName;
            this.reviewedAt = reviewedAt;
            this.reason = reason;
        }

        public String getDecision() { return decision; }
        public void setDecision(String decision) { this.decision = decision; }
        public String getReviewerName() { return reviewerName; }
        public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }
        public Instant getReviewedAt() { return reviewedAt; }
        public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class FeedbackDto {
        private String id;
        private String complaintId;
        private String citizenId;
        private int rating;
        private String comment;
        private Instant submittedAt;

        public FeedbackDto() {}

        public FeedbackDto(Feedback fb) {
            this.id = fb.getId();
            this.complaintId = fb.getComplaintId();
            this.citizenId = fb.getCitizenId();
            this.rating = fb.getRating();
            this.comment = fb.getComment();
            this.submittedAt = fb.getCreatedAt();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getComplaintId() { return complaintId; }
        public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
        public String getCitizenId() { return citizenId; }
        public void setCitizenId(String citizenId) { this.citizenId = citizenId; }
        public int getRating() { return rating; }
        public void setRating(int rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        public Instant getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    }

    // Getters and Setters for ComplaintDto
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }
    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }
    public String getCitizenPhone() { return citizenPhone; }
    public void setCitizenPhone(String citizenPhone) { this.citizenPhone = citizenPhone; }
    public String getCitizenEmail() { return citizenEmail; }
    public void setCitizenEmail(String citizenEmail) { this.citizenEmail = citizenEmail; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getWardZoneId() { return wardZoneId; }
    public void setWardZoneId(String wardZoneId) { this.wardZoneId = wardZoneId; }
    public String getWardZoneName() { return wardZoneName; }
    public void setWardZoneName(String wardZoneName) { this.wardZoneName = wardZoneName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getExactLocation() { return exactLocation; }
    public void setExactLocation(String exactLocation) { this.exactLocation = exactLocation; }
    public Map<String, BigDecimal> getMapCoordinates() { return mapCoordinates; }
    public void setMapCoordinates(Map<String, BigDecimal> mapCoordinates) { this.mapCoordinates = mapCoordinates; }
    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAssignedOfficerId() { return assignedOfficerId; }
    public void setAssignedOfficerId(String assignedOfficerId) { this.assignedOfficerId = assignedOfficerId; }
    public String getAssignedOfficerName() { return assignedOfficerName; }
    public void setAssignedOfficerName(String assignedOfficerName) { this.assignedOfficerName = assignedOfficerName; }
    public Instant getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }
    public Instant getAckDeadline() { return ackDeadline; }
    public void setAckDeadline(Instant ackDeadline) { this.ackDeadline = ackDeadline; }
    public Instant getActionDeadline() { return actionDeadline; }
    public void setActionDeadline(Instant actionDeadline) { this.actionDeadline = actionDeadline; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public Instant getActionStartedAt() { return actionStartedAt; }
    public void setActionStartedAt(Instant actionStartedAt) { this.actionStartedAt = actionStartedAt; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getObjectionWindowEnd() { return objectionWindowEnd; }
    public void setObjectionWindowEnd(Instant objectionWindowEnd) { this.objectionWindowEnd = objectionWindowEnd; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public boolean isPaused() { return isPaused; }
    public void setPaused(boolean paused) { isPaused = paused; }
    public String getPauseReason() { return pauseReason; }
    public void setPauseReason(String pauseReason) { this.pauseReason = pauseReason; }
    public String getPendingWithdrawalReason() { return pendingWithdrawalReason; }
    public void setPendingWithdrawalReason(String pendingWithdrawalReason) { this.pendingWithdrawalReason = pendingWithdrawalReason; }
    public String getPendingReopenReason() { return pendingReopenReason; }
    public void setPendingReopenReason(String pendingReopenReason) { this.pendingReopenReason = pendingReopenReason; }
    public List<AttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentDto> attachments) { this.attachments = attachments; }
    public List<String> getAllowedActions() { return allowedActions; }
    public void setAllowedActions(List<String> allowedActions) { this.allowedActions = allowedActions; }
    public List<HistoryDto> getHistory() { return history; }
    public void setHistory(List<HistoryDto> history) { this.history = history; }
    public List<ProgressDto> getProgressUpdates() { return progressUpdates; }
    public void setProgressUpdates(List<ProgressDto> progressUpdates) { this.progressUpdates = progressUpdates; }
    public List<InfoRequestDto> getInfoRequests() { return infoRequests; }
    public void setInfoRequests(List<InfoRequestDto> infoRequests) { this.infoRequests = infoRequests; }
    public List<ReportDto> getResolutionReports() { return resolutionReports; }
    public void setResolutionReports(List<ReportDto> resolutionReports) { this.resolutionReports = resolutionReports; }
    public FeedbackDto getFeedback() { return feedback; }
    public void setFeedback(FeedbackDto feedback) { this.feedback = feedback; }
}
