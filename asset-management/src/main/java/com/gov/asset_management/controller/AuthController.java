package com.gov.asset_management.controller;

import com.gov.asset_management.dto.LoginRequest;
import com.gov.asset_management.model.User;
import com.gov.asset_management.repository.UserRepository;
import com.gov.asset_management.security.JwtUtils; // We import our new JwtUtils tool
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtils jwtUtils; // Inject the JwtUtils here

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepo.findByUsername(loginRequest.getUsername());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (user.getPassword().equals(loginRequest.getPassword())) {

                // 1. Check if the Authority is approved by Super Admin
                if (user.getIsActive() != null && !user.getIsActive()) {
                    return ResponseEntity.status(403).body("Account pending admin approval.");
                }

                // 2. Generate the JWT using JwtUtils (Clean and uses the fixed Secret Key)
                String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

                // 3. Send the token back to React
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("username", user.getUsername());
                response.put("role", user.getRole().name());

                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(401).body("Invalid Credentials");
    }
}