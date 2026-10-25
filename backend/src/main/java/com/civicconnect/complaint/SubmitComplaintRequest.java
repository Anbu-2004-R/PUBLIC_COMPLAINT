package com.civicconnect.complaint;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;

public class SubmitComplaintRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String categoryId;

    @NotBlank(message = "Ward/Zone is required")
    private String wardZoneId;

    @NotBlank(message = "Exact location is required")
    private String exactLocation;

    private LocalDate incidentDate;
    private List<AttachmentInput> attachments;

    public SubmitComplaintRequest() {}

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

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getWardZoneId() { return wardZoneId; }
    public void setWardZoneId(String wardZoneId) { this.wardZoneId = wardZoneId; }
    public String getExactLocation() { return exactLocation; }
    public void setExactLocation(String exactLocation) { this.exactLocation = exactLocation; }
    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }
    public List<AttachmentInput> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentInput> attachments) { this.attachments = attachments; }
}
