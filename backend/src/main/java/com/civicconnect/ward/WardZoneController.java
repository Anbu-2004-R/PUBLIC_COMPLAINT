package com.civicconnect.ward;

import com.civicconnect.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class WardZoneController {

    private final WardZoneRepository wardZoneRepository;

    public WardZoneController(WardZoneRepository wardZoneRepository) {
        this.wardZoneRepository = wardZoneRepository;
    }

    @GetMapping({"/admin/zones", "/zones"})
    public ResponseEntity<List<WardZone>> getZones() {
        return ResponseEntity.ok(wardZoneRepository.findAll());
    }

    @PostMapping("/admin/zones")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WardZone> saveZone(@RequestBody WardZone zone) {
        if (zone.getCode() == null || zone.getName() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_FIELDS", "Zone code and name are required.");
        }
        return ResponseEntity.ok(wardZoneRepository.save(zone));
    }
}
