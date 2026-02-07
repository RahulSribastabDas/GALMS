package com.gov.asset_management.model;

public enum RequestType {

    // --- 1. Employee Requests (The "Demand") ---
    REQUISITION,      // Employee asking for a new item (matches Frontend)
    MAINTENANCE,      // Employee reporting a broken item (matches Frontend)
    RETURN,           // Employee returning an item

    // --- 2. Procurement Actions (The "Execution") ---
    PROCUREMENT,      // The formal Indent process (Amit's work)
    PURCHASE,         // Direct purchasing (GeM/Vendor)

    // --- 3. Asset Lifecycle Events ---
    REPAIR,           // Official repair work order
    DISPOSAL,         // Scrapping old items
    ALLOCATION,       // Assigning an item to a user
    TRANSFER          // Moving an item between departments
}