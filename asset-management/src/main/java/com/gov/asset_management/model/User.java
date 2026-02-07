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

    // Kept for backward compatibility with your frontend
    private String departmentName;

    // --- Relationship Link (Optional for now, good for future) ---
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // Changed 'boolean' to 'Boolean' to ensure proper Getter generation
    private Boolean isActive = true;

    // Explicit setter in case Lombok acts up
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}