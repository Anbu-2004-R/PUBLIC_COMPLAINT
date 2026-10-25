package com.civicconnect.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResolutionReportRepository extends JpaRepository<ResolutionReport, String> {
    List<ResolutionReport> findByComplaintIdOrderBySubmittedAtDesc(String complaintId);
    List<ResolutionReport> findByReviewStatus(String reviewStatus);
}
