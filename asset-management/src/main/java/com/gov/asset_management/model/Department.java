package com.gov.asset_management.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "RTO Office Zone 1"

    private String region; // e.g., "North District"

    private Double totalBudget;
    private Double usedBudget = 0.0;

    // For "Performance Ranking"
    private Integer unverifiedAssetsCount = 0;
}