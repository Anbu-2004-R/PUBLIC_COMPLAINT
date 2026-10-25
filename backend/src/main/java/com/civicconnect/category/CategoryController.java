package com.civicconnect.category;

import com.civicconnect.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> saveCategory(@RequestBody Category category) {
        if (category.getName() == null || category.getDepartmentId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_FIELDS", "Category name and department ID are required.");
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }
}
