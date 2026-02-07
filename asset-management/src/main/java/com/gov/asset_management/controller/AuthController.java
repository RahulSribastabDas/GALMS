package com.gov.asset_management.controller;

import com.gov.asset_management.dto.LoginRequest;
import com.gov.asset_management.model.User;
import com.gov.asset_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth") // <--- This matches the new React URL
@CrossOrigin(origins = "http://localhost:5173") // <--- Trusted React Port
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        // 1. Find user in Database
        Optional<User> userOptional = userRepo.findByUsername(loginRequest.getUsername());

        // 2. Check if user exists AND password matches
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(loginRequest.getPassword())) {

                // --- SUCCESS ---
                // We return the WHOLE user object.
                // React needs this to save "user.role" and "user.username" in localStorage.
                return ResponseEntity.ok(user);
            }
        }

        // --- FAILURE ---
        return ResponseEntity.status(401).body("Invalid Credentials");
    }
}