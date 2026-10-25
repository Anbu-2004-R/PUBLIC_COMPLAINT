package com.civicconnect.complaint;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    Optional<Complaint> findByIdempotencyKey(String idempotencyKey);

    Page<Complaint> findByCitizenId(String citizenId, Pageable pageable);

    Page<Complaint> findByAssignedOfficerId(String assignedOfficerId, Pageable pageable);

    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);

    List<Complaint> findByStatus(ComplaintStatus status);

    @Query("SELECT c FROM Complaint c WHERE c.assignedOfficerId = :officerId " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:priority IS NULL OR c.priority = :priority) " +
           "AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.id) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Complaint> searchOfficerComplaints(
            @Param("officerId") String officerId,
            @Param("status") ComplaintStatus status,
            @Param("priority") ComplaintPriority priority,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:departmentId IS NULL OR c.departmentId = :departmentId) AND " +
           "(:wardZoneId IS NULL OR c.wardZoneId = :wardZoneId) AND " +
           "(:categoryId IS NULL OR c.categoryId = :categoryId) AND " +
           "(:officerId IS NULL OR c.assignedOfficerId = :officerId) AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.id) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Complaint> searchAdminComplaints(
            @Param("status") ComplaintStatus status,
            @Param("priority") ComplaintPriority priority,
            @Param("departmentId") String departmentId,
            @Param("wardZoneId") String wardZoneId,
            @Param("categoryId") String categoryId,
            @Param("officerId") String officerId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT c FROM Complaint c WHERE c.citizenId = :citizenId AND c.categoryId = :categoryId AND c.wardZoneId = :wardZoneId AND LOWER(c.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Complaint> findPotentialCitizenDuplicates(
            @Param("citizenId") String citizenId,
            @Param("categoryId") String categoryId,
            @Param("wardZoneId") String wardZoneId,
            @Param("title") String title
    );

    @Query("SELECT c FROM Complaint c WHERE c.categoryId = :categoryId AND c.wardZoneId = :wardZoneId AND LOWER(c.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Complaint> findPotentialSystemDuplicates(
            @Param("categoryId") String categoryId,
            @Param("wardZoneId") String wardZoneId,
            @Param("title") String title
    );

    long countByAssignedOfficerIdAndStatusNotIn(String officerId, List<ComplaintStatus> finishedStatuses);

    @Query("SELECT c FROM Complaint c WHERE c.status = 'RESOLVED_AWAITING_FEEDBACK' AND c.objectionWindowEnd IS NOT NULL AND c.objectionWindowEnd <= :now")
    List<Complaint> findComplaintsEligibleForAutoClosure(@Param("now") Instant now);

    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN ('CLOSED', 'RESOLVED_AWAITING_FEEDBACK', 'WITHDRAWN') AND c.actionDeadline IS NOT NULL AND c.actionDeadline < :now")
    List<Complaint> findOverdueComplaints(@Param("now") Instant now);
}
