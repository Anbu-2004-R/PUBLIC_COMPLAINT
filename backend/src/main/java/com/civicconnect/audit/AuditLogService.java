package com.civicconnect.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordLog(String actorId, String actorName, String actorRole, String action, String entityType, String entityId, String details, String ipAddress) {
        AuditLog log = new AuditLog(actorId, actorName, actorRole, action, entityType, entityId, details, ipAddress);
        auditLogRepository.save(log);
    }
}
