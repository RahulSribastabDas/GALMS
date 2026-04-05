package com.gov.asset_management.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "departments")
@Data
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "Ministry of Agriculture"

    private String region; // e.g., "South Zone"

    private Double totalBudget;

    @Column(nullable = false)
    private Double usedBudget = 0.0;

    @Column(nullable = false)
    private Integer unverifiedAssetsCount = 0;

    // --- THE FIX: PREVENT NULL CRASHES ---
    // Before Spring Boot saves to PostgreSQL, it runs this method.
    // If React forgot to send the budget, it forces it to 0.0 instead of crashing.
    @PrePersist
    public void prePersist() {
        if (usedBudget == null) usedBudget = 0.0;
        if (unverifiedAssetsCount == null) unverifiedAssetsCount = 0;
    }
}