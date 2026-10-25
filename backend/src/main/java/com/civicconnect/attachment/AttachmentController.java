package com.civicconnect.attachment;

import com.civicconnect.common.ApiException;
import com.civicconnect.security.UserPrincipal;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/attachments")
public class AttachmentController {
    private final AttachmentStorageService attachmentStorageService;
    private final EvidenceAttachmentRepository evidenceAttachmentRepository;

    public AttachmentController(
            AttachmentStorageService attachmentStorageService,
            EvidenceAttachmentRepository evidenceAttachmentRepository) {
        this.attachmentStorageService = attachmentStorageService;
        this.evidenceAttachmentRepository = evidenceAttachmentRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<EvidenceAttachment> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "complaintId", required = false) String complaintId,
            @RequestParam(value = "reportId", required = false) String reportId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EvidenceAttachment ea = attachmentStorageService.storeFile(
                file,
                complaintId != null ? complaintId : "temp",
                reportId,
                userPrincipal.getId(),
                userPrincipal.getUser().getFullName()
        );
        evidenceAttachmentRepository.save(ea);
        return ResponseEntity.ok(ea);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        EvidenceAttachment ea = evidenceAttachmentRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Attachment not found."));

        Path filePath = attachmentStorageService.loadFile(ea.getFilePath());
        Resource resource;
        try {
            resource = new UrlResource(filePath.toUri());
        } catch (MalformedURLException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_READ_ERROR", "Could not read file.");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(ea.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + ea.getFilename() + "\"")
                .body(resource);
    }
}
