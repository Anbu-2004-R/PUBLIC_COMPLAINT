package com.civicconnect.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdateItem, String> {
    List<ProgressUpdateItem> findByComplaintIdOrderByTimestampAsc(String complaintId);
    List<ProgressUpdateItem> findByComplaintIdAndVisibilityOrderByTimestampAsc(String complaintId, String visibility);
}
