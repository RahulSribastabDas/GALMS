package com.gov.asset_management.model;

public enum Role {
    // --- Level 1: Strategic (The Watchers) ---
    NATIONAL_OBSERVER,  // PMO / Ministry (Read-Only Global Analytics)
    CAG_AUDITOR,        // External Audit (Read-Only Audit Logs)

    // --- Level 2: Administrative (The Approvers/Checkers) ---
    DEPT_HEAD,          // Joint Secretary / DM (Approves Budgets & Requests)
    SYSTEM_ADMIN,       // IT Support (User Management only, No Financial Access)
    SUPER_ADMIN,        // Added for NIC Admin access

    // --- Level 3: Operational (The Makers/Doers) ---
    PROCUREMENT_OFFICER, // MAKER: Initiates purchases
    ASSET_CUSTODIAN,     // MAKER: Physically scans/verifies assets (Needs GPS)
    DISPOSAL_OFFICER,    // MAKER: Initiates scrap auctions

    // --- Level 4: Edge (The Users) ---
    GOVT_EMPLOYEE,       // End User (Formal Govt designation)
    EMPLOYEE,            // <--- ADDED THIS (General Staff/Contractual) to fix Seeder error
    VENDOR               // External (Uploads Invoices)
}