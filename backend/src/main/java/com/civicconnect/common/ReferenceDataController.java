package com.civicconnect.common;

import com.civicconnect.category.Category;
import com.civicconnect.category.CategoryRepository;
import com.civicconnect.department.Department;
import com.civicconnect.department.DepartmentRepository;
import com.civicconnect.ward.WardZone;
import com.civicconnect.ward.WardZoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ReferenceDataController {
    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final WardZoneRepository wardZoneRepository;

    public ReferenceDataController(
            CategoryRepository categoryRepository,
            DepartmentRepository departmentRepository,
            WardZoneRepository wardZoneRepository) {
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.wardZoneRepository = wardZoneRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/zones")
    public ResponseEntity<List<WardZone>> getZones() {
        return ResponseEntity.ok(wardZoneRepository.findAll());
    }
}
