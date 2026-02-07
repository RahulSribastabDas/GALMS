package com.gov.asset_management.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Data
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id", unique = true)
    private String assetId; // e.g., "GOV-2026-001"

    @Column(nullable = false)
    private String assetName;

    private String category;
    private Double cost;
    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    private AssetStatus status; // AVAILABLE, ASSIGNED, SCRAPPED, IN_USE

    private String supplier;
    private String department;

    // Geofencing for Auditor
    private Double registeredLatitude;
    private Double registeredLongitude;
    private Integer allowedRadiusMeters = 200;

    // CUSTODY & HANDOVER
    @ManyToOne
    @JoinColumn(name = "current_holder_id")
    private User assignedTo;

    private LocalDateTime lastVerifiedDate;

    // --- THE HANDSHAKE FLAG ---
    // true = Issued by Admin, but Employee hasn't clicked "Accept" yet.
    private boolean assignmentPending = false;
}