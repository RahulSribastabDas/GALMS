package com.gov.asset_management.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class ApprovalRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- 1. CORE WORKFLOW FIELDS ---
    @Enumerated(EnumType.STRING)
    private RequestType type;

    // THE MAKER: Who prepared this indent? (Procurement Officer)
    @ManyToOne
    @JoinColumn(name = "initiated_by_user_id")
    private User initiatedBy;

    // THE CHECKER: Who approves it? (Dept Head)
    @Enumerated(EnumType.STRING)
    private Role requiredApproverRole;

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    // --- 2. PROCUREMENT DATA ---
    private String itemName;
    private String category;

    @Column(name = "vendor_name")
    private String vendorName;

    private Double estimatedCost;

    // --- 3. AUDIT TRAIL ---
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime actionedAt;
    private String actionedByAdminName;

    // --- 4. BRIDGE FIELD (NEW) ---
    // Links this Indent to the original Employee Ticket
    @OneToOne
    @JoinColumn(name = "linked_ticket_id")
    private ServiceRequest linkedTicket;
}