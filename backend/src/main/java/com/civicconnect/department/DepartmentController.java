package com.civicconnect.department;

import com.civicconnect.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping({"/admin/departments", "/departments"})
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping("/admin/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Department> saveDepartment(@RequestBody Department dept) {
        if (dept.getCode() == null || dept.getName() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_FIELDS", "Department code and name are required.");
        }
        return ResponseEntity.ok(departmentRepository.save(dept));
    }
}
