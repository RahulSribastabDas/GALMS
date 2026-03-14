package com.gov.asset_management.controller;

import com.gov.asset_management.dto.LoginRequest;
import com.gov.asset_management.model.User;
import com.gov.asset_management.repository.UserRepository;
import com.gov.asset_management.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random; // NEW IMPORT

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtils jwtUtils;

    // --- STEP 1: INITIAL LOGIN (Generates OTP) ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepo.findByUsername(loginRequest.getUsername());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (user.getPassword().equals(loginRequest.getPassword())) {

                if (user.getIsActive() != null && !user.getIsActive()) {
                    return ResponseEntity.status(403).body("Account pending admin approval.");
                }

                // 1. Generate 6-digit OTP
                String otp = String.format("%06d", new Random().nextInt(999999));

                // 2. Save it to the database for this user
                user.setCurrentOtp(otp);
                userRepo.save(user);

                // TODO: We will add the email sending logic here in the next step!
                // For now, print it to the console so you can test it:
                System.out.println("\n=== SECURITY ALERT ===");
                System.out.println("Generated OTP for " + user.getUsername() + ": " + otp);
                System.out.println("======================\n");

                // 3. Tell React to show the OTP screen
                Map<String, String> response = new HashMap<>();
                response.put("message", "OTP_REQUIRED");
                response.put("email", user.getEmail()); // Let React know which email it was sent to

                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid Credentials");
    }

    // --- STEP 2: VERIFY OTP (Issues JWT Token) ---
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String otp = request.get("otp");

        Optional<User> userOptional = userRepo.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Check if the provided OTP matches the database
            if (user.getCurrentOtp() != null && user.getCurrentOtp().equals(otp)) {

                // Success! Clear the OTP so it can't be reused by a hacker
                user.setCurrentOtp(null);
                userRepo.save(user);

                // Generate the real JWT token
                String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("username", user.getUsername());
                response.put("role", user.getRole().name());

                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid OTP Code");
    }
}