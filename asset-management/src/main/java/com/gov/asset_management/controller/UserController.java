package com.gov.asset_management.controller;

import com.gov.asset_management.model.User;
import com.gov.asset_management.model.Department;
import com.gov.asset_management.repository.UserRepository;
import com.gov.asset_management.repository.DepartmentRepository;
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

    @Autowired
    private DepartmentRepository deptRepo;

    @Autowired
    private com.gov.asset_management.service.EmailService emailService;

    // --- 1. GET ALL USERS FOR A SPECIFIC DEPARTMENT ---
    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<User>> getUsersByDepartment(@PathVariable Long deptId) {
        List<User> users = userRepo.findByDepartmentId(deptId);
        return ResponseEntity.ok(users);
    }

    // --- 2. CREATE A NEW USER (REAL-WORLD WORKFLOW) ---
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        try { // <--- THIS is the try block Java was losing track of!

            // 1. STRICT RULE: Email is absolutely required
            if (newUser.getEmail() == null || newUser.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: An official email address is strictly required to issue credentials.");
            }

            // 2. Link the Department
            if (newUser.getDepartment() != null && newUser.getDepartment().getName() != null) {
                String deptName = newUser.getDepartment().getName();
                Department realDept = deptRepo.findByName(deptName);
                if (realDept == null) {
                    return ResponseEntity.badRequest().body("Error: Department '" + deptName + "' not found.");
                }
                newUser.setDepartment(realDept);
            }

            // 3. Set secure defaults
            newUser.setIsActive(false); // Forces them to wait for Admin approval
            newUser.setFirstLogin(true);

            // 4. Save to Database
            User savedUser = userRepo.save(newUser);

            // 5. DISPATCH THE WELCOME EMAIL!
            try {
                emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getUsername(), savedUser.getPassword());
                System.out.println("✅ Official credentials dispatched to: " + savedUser.getEmail());
            } catch (Exception e) {
                System.err.println("❌ User created, but failed to dispatch email: " + e.getMessage());
            }

            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("System Error: " + e.getMessage());
        }
    }
}