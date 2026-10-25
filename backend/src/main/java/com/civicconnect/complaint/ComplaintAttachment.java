package com.civicconnect.complaint;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "complaint_attachments")
public class ComplaintAttachment {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "complaint_id", nullable = false, length = 64)
    private String complaintId;

    @Column(name = "resolution_report_id", length = 64)
    private String resolutionReportId;

    @Column(nullable = false)
    private String filename;

    @Column(name = "file_size", nullable = false)
    private long fileSize;

    @Column(name = "file_type", nullable = false, length = 128)
    private String fileType;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String url;

    @Column(name = "uploaded_by", nullable = false, length = 64)
    private String uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt = Instant.now();

    public ComplaintAttachment() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(String complaintId) {
        this.complaintId = complaintId;
    }

    public String getResolutionReportId() {
        return resolutionReportId;
    }

    public void setResolutionReportId(String resolutionReportId) {
        this.resolutionReportId = resolutionReportId;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null || id.isEmpty()) {
            this.id = "att-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (uploadedAt == null) {
            uploadedAt = Instant.now();
        }
    }
}
