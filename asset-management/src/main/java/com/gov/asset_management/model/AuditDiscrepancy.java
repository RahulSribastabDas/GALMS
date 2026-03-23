package com.gov.asset_management.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "audit_discrepancies")
public class AuditDiscrepancy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String auditId;
    private String department;
    private String assetName;
    private String value;
    private String status;
    private String issueDescription;
    private LocalDate reportedDate;

    // Getters and Setters (Standard stuff)
    public Long getId() { return id; }
    public String getAuditId() { return auditId; }
    public String getDepartment() { return department; }
    public String getAssetName() { return assetName; }
    public String getValue() { return value; }
    public String getStatus() { return status; }
    public String getIssueDescription() { return issueDescription; }
    public LocalDate getReportedDate() { return reportedDate; }
}