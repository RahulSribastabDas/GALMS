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
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.gov.asset_management.service.EmailService emailService;

    // --- REVERTED LOGIN: ALWAYS SEND OTP ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepo.findByUsername(loginRequest.getUsername());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Check Password
            if (user.getPassword().equals(loginRequest.getPassword())) {

                if (user.getIsActive() != null && !user.getIsActive()) {
                    return ResponseEntity.status(403).body("Account pending admin approval.");
                }

                // 1. Always Generate 6-digit OTP
                String otp = String.format("%06d", new Random().nextInt(999999));

                // 2. Always Save it to the database
                user.setCurrentOtp(otp);
                userRepo.save(user);

                // 3. Always SEND THE EMAIL
                try {
                    emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp);
                    System.out.println("✅ Previous email integration active: OTP sent to " + user.getEmail());
                } catch (Exception e) {
                    System.err.println("❌ Email failed: " + e.getMessage());
                }

                // 4. Always tell React to show the OTP screen
                Map<String, String> response = new HashMap<>();
                response.put("message", "OTP_REQUIRED");
                response.put("email", user.getEmail());

                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid Credentials");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String otp = request.get("otp");

        Optional<User> userOptional = userRepo.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (user.getCurrentOtp() != null && user.getCurrentOtp().equals(otp)) {
                user.setCurrentOtp(null);
                userRepo.save(user);

                String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());

                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("username", user.getUsername());
                response.put("role", user.getRole().name());
                response.put("firstLogin", user.getFirstLogin());

                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Invalid OTP Code");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String newPassword = request.get("newPassword");

        Optional<User> userOptional = userRepo.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(newPassword);
            user.setFirstLogin(false);
            userRepo.save(user);
            return ResponseEntity.ok("Password updated.");
        }
        return ResponseEntity.status(404).body("User not found.");
    }
}