package com.civicconnect.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestParam(required = false) String actorId,
            @RequestParam(required = false) String entityType) {
        if (entityType != null && !entityType.trim().isEmpty()) {
            return ResponseEntity.ok(auditLogRepository.findByEntityTypeOrderByTimestampDesc(entityType));
        }
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }
}
