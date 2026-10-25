package com.civicconnect.resolution;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class SubmitResolutionRequest {
    private String complaintId;

    @NotBlank(message = "Actions taken is required")
    private String actionsTaken;

    @NotBlank(message = "Outcome description is required")
    private String outcomeDescription;

    @NotNull(message = "Completion date is required")
    private LocalDate completionDate;

    private List<AttachmentInput> evidenceAttachments;

    public SubmitResolutionRequest() {}

    public static class AttachmentInput {
        private String filename;
        private long fileSize;
        private String fileType;
        private String url;

        public AttachmentInput() {}

        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }
    public String getActionsTaken() { return actionsTaken; }
    public void setActionsTaken(String actionsTaken) { this.actionsTaken = actionsTaken; }
    public String getOutcomeDescription() { return outcomeDescription; }
    public void setOutcomeDescription(String outcomeDescription) { this.outcomeDescription = outcomeDescription; }
    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }
    public List<AttachmentInput> getEvidenceAttachments() { return evidenceAttachments; }
    public void setEvidenceAttachments(List<AttachmentInput> evidenceAttachments) { this.evidenceAttachments = evidenceAttachments; }
}
