package com.civicconnect.ward;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WardZoneRepository extends JpaRepository<WardZone, String> {
    Optional<WardZone> findByCodeIgnoreCase(String code);
    List<WardZone> findByActiveStatusTrue();
}
