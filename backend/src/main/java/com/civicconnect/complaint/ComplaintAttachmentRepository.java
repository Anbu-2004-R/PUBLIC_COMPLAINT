package com.civicconnect.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintAttachmentRepository extends JpaRepository<ComplaintAttachment, String> {
    List<ComplaintAttachment> findByComplaintId(String complaintId);
    List<ComplaintAttachment> findByResolutionReportId(String resolutionReportId);
}
