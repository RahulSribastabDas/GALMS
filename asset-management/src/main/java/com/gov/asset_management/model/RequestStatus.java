package com.gov.asset_management.model;

public enum RequestStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CLARIFICATION_NEEDED // "Send back to Maker for more info"
}