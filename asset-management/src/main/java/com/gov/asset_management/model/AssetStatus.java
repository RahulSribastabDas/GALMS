package com.gov.asset_management.model;

public enum AssetStatus {
    AVAILABLE,   // In stock, ready to be assigned
    ASSIGNED,    // Currently with an employee
    IN_REPAIR,   // Under maintenance
    SCRAPPED     // Disposed of
}