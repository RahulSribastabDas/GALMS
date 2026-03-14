package com.gov.asset_management.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // --- NEW FIELDS FOR EMAIL AUTHENTICATION ---
    private String email;       // Stores the user's email (e.g., rahulsribastabdas@gmail.com)
    private String currentOtp;  // Temporarily holds the 6-digit code during login

    // Kept for backward compatibility with your frontend
    private String departmentName;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private Boolean isActive = true;

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}