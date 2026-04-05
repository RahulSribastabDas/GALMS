package com.gov.asset_management.repository;

import com.gov.asset_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // This allows us to find a user just by typing their name
    Optional<User> findByUsername(String username);

    // --- NEW: Find all users for a specific department ---
    List<User> findByDepartmentId(Long departmentId);
    // --- NEW: Find users pending admin approval ---
    List<User> findByIsActiveFalse();
}