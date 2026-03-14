package com.gov.asset_management.controller;

import com.gov.asset_management.model.Department;
import com.gov.asset_management.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:5173")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    // --- API TO GET ALL DEPARTMENTS ---
    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        // Fetch everything from the PostgreSQL 'department' table
        List<Department> departments = departmentRepository.findAll();

        // Send it back as a JSON list
        return ResponseEntity.ok(departments);
    }
    // --- API TO CREATE A NEW DEPARTMENT ---
    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        // Ensure default values are set if React sends them empty
        if (department.getUsedBudget() == null) department.setUsedBudget(0.0);
        if (department.getUnverifiedAssetsCount() == null) department.setUnverifiedAssetsCount(0);

        Department savedDepartment = departmentRepository.save(department);
        return ResponseEntity.ok(savedDepartment);
    }
}