package com.civicconnect.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistoryItem, String> {
    List<StatusHistoryItem> findByComplaintIdOrderByChangedAtAsc(String complaintId);
}
