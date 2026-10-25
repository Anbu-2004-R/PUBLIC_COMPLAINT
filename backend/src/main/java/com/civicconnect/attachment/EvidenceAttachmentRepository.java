package com.civicconnect.attachment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceAttachmentRepository extends JpaRepository<EvidenceAttachment, String> {
    List<EvidenceAttachment> findByComplaintId(String complaintId);
    List<EvidenceAttachment> findByResolutionReportId(String resolutionReportId);
}
