package com.civicconnect.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ComplaintFeedbackRepository extends JpaRepository<ComplaintFeedback, String> {
    Optional<ComplaintFeedback> findByComplaintId(String complaintId);
}
