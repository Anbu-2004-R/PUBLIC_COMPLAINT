package com.civicconnect.attachment;

import com.civicconnect.common.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class AttachmentStorageService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".pdf");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private final Path storageLocation;

    public AttachmentStorageService(@Value("${app.upload.dir:./storage/attachments}") String uploadDir) {
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create directory for upload storage: " + uploadDir, e);
        }
    }

    public EvidenceAttachment storeFile(MultipartFile file, String complaintId, String reportId, String userId, String userName) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "File cannot be empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE", "File size exceeds the 10 MB maximum limit.");
        }

        String originalFilename = Paths.get(file.getOriginalFilename()).getFileName().toString();
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "UNSUPPORTED_FILE_TYPE", "Only JPG, JPEG, PNG, and PDF files are permitted.");
        }

        String storedFilename = UUID.randomUUID().toString() + extension;
        Path targetPath = this.storageLocation.resolve(storedFilename).normalize();

        if (!targetPath.getParent().equals(this.storageLocation)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PATH", "Cannot store file outside current directory.");
        }

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_FAILED", "Failed to store uploaded file.");
        }

        return new EvidenceAttachment(
                complaintId,
                reportId,
                originalFilename,
                targetPath.toString(),
                file.getSize(),
                file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                userId,
                userName
        );
    }

    public Path loadFile(String storedFilePath) {
        Path path = Paths.get(storedFilePath).normalize();
        if (!path.startsWith(this.storageLocation) || !Files.exists(path)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Requested file does not exist or access is restricted.");
        }
        return path;
    }
}
