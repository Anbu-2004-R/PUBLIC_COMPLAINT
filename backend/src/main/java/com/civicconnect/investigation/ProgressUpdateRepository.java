package com.civicconnect.investigation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, String> {
    List<ProgressUpdate> findByComplaintIdOrderByCreatedAtAsc(String complaintId);
    List<ProgressUpdate> findByComplaintIdAndVisibilityOrderByCreatedAtAsc(String complaintId, String visibility);
}
