package com.gov.asset_management.repository;

import com.gov.asset_management.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    // JpaRepository automatically gives us findAll(), findById(), save(), etc.
}