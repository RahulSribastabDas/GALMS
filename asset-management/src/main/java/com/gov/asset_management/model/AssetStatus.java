package com.gov.asset_management.model;

public enum AssetStatus {
    AVAILABLE,     // In stock, ready to be assigned
    ASSIGNED,      // Currently with an employee
    IN_REPAIR,     // Under maintenance
    SCRAPPED,      // Disposed of

    // --- CAG AUDITOR STATUSES ---
    PENDING_AUDIT, // Needs to be verified by CAG
    MISSING        // Auditor flagged this as missing
}