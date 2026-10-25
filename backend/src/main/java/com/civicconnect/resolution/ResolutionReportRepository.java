package com.civicconnect.resolution;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResolutionReportRepository extends JpaRepository<ResolutionReport, String> {
    List<ResolutionReport> findByComplaintIdOrderBySubmittedAtDesc(String complaintId);
    Optional<ResolutionReport> findFirstByComplaintIdOrderBySubmittedAtDesc(String complaintId);
    List<ResolutionReport> findByReviewStatus(String reviewStatus);
}
