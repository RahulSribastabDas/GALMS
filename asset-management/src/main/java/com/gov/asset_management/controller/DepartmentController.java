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

    // --- 1. GET ALL DEPARTMENTS ---
    @GetMapping
    public ResponseEntity<?> getAllDepartments() {
        try {
            List<Department> departments = departmentRepository.findAll();
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching departments: " + e.getMessage());
        }
    }

    // --- 2. CREATE A NEW DEPARTMENT ---
    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody Department department) {
        try {
            // Check if it already exists to prevent a messy database crash
            Department existingDept = departmentRepository.findByName(department.getName());
            if (existingDept != null) {
                return ResponseEntity.status(400).body("Error: Department '" + department.getName() + "' already exists.");
            }

            // Save to database
            Department savedDepartment = departmentRepository.save(department);

            return ResponseEntity.ok(savedDepartment);

        } catch (Exception e) {
            // If it crashes, this prints the REAL reason in red text in your IntelliJ console
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server Error: " + e.getMessage());
        }
    }
}