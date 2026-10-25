package com.civicconnect.complaint;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String>, JpaSpecificationExecutor<Complaint> {
    Page<Complaint> findByCitizenId(String citizenId, Pageable pageable);
    Page<Complaint> findByAssignedOfficerId(String officerId, Pageable pageable);
    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);
    List<Complaint> findByStatus(ComplaintStatus status);
    List<Complaint> findByCategoryIdAndWardZoneId(String categoryId, String wardZoneId);
    Optional<Complaint> findByIdempotencyKey(String idempotencyKey);
}
