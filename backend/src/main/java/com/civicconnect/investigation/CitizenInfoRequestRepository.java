package com.civicconnect.investigation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitizenInfoRequestRepository extends JpaRepository<CitizenInfoRequest, String> {
    List<CitizenInfoRequest> findByComplaintIdOrderByRequestedAtAsc(String complaintId);
}
