package com.gov.asset_management.controller;

import com.gov.asset_management.model.User;
import com.gov.asset_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepo;

    // --- 1. GET ALL USERS FOR A SPECIFIC DEPARTMENT ---
    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<User>> getUsersByDepartment(@PathVariable Long deptId) {
        List<User> users = userRepo.findByDepartmentId(deptId);
        return ResponseEntity.ok(users);
    }

    // --- 2. CREATE A NEW USER FOR A DEPARTMENT ---
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User newUser) {
        // By default, make sure the new user is active
        newUser.setIsActive(true);

        // Save the user to the database
        User savedUser = userRepo.save(newUser);
        return ResponseEntity.ok(savedUser);
    }
}