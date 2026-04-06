package com.gov.asset_management.controller;

import com.gov.asset_management.model.User;
import com.gov.asset_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepo;

    // --- 1. GET ALL PENDING USERS ---
    @GetMapping("/users/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        // Fetches everyone whose isActive flag is false
        List<User> pendingUsers = userRepo.findByIsActiveFalse();
        return ResponseEntity.ok(pendingUsers);
    }

    // --- 2. APPROVE A USER ---
    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepo.findById(id);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(true); // Flip the switch!
            userRepo.save(user);

            return ResponseEntity.ok("User " + user.getUsername() + " has been approved and activated.");
        }
        return ResponseEntity.status(404).body("User not found.");
    }

    // --- 3. REJECT/DELETE A USER ---
    @DeleteMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        if (userRepo.existsById(id)) {
            userRepo.deleteById(id); // Hard delete if rejected
            return ResponseEntity.ok("User application rejected and removed.");
        }
        return ResponseEntity.status(404).body("User not found.");
    }
}