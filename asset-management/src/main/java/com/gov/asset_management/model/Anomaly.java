package com.gov.asset_management.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Anomaly {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Asset asset;

    // Type of Fraud: GEOFENCE_BREACH, DATA_TAMPERING, MISSING_VERIFICATION
    private String type;

    private String description; // "Asset moved 5km outside zone"
    private String severity; // CRITICAL, WARNING

    private LocalDateTime detectedAt = LocalDateTime.now();
}