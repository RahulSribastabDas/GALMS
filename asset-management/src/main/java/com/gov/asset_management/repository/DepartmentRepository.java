package com.gov.asset_management.repository;

import com.gov.asset_management.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // --- Add this single missing line right here! ---
    Department findByName(String name);
}