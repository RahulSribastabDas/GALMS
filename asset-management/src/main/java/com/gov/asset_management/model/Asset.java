package com.gov.asset_management.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id", unique = true)
    private String assetId;

    @Column(nullable = false)
    private String assetName;

    private String category;
    private Double cost;
    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    private AssetStatus status;

    private String supplier;
    private String department;

    private Double registeredLatitude;
    private Double registeredLongitude;
    private Integer allowedRadiusMeters = 200;

    @ManyToOne
    @JoinColumn(name = "current_holder_id")
    private User assignedTo;

    private LocalDateTime lastVerifiedDate;
    private boolean assignmentPending = false;

    @Column(name = "procurement_tracking_id")
    private String procurementTrackingId;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    private String serialNumber;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public AssetStatus getStatus() { return status; }
    public void setStatus(AssetStatus status) { this.status = status; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Double getRegisteredLatitude() { return registeredLatitude; }
    public void setRegisteredLatitude(Double registeredLatitude) { this.registeredLatitude = registeredLatitude; }

    public Double getRegisteredLongitude() { return registeredLongitude; }
    public void setRegisteredLongitude(Double registeredLongitude) { this.registeredLongitude = registeredLongitude; }

    public Integer getAllowedRadiusMeters() { return allowedRadiusMeters; }
    public void setAllowedRadiusMeters(Integer allowedRadiusMeters) { this.allowedRadiusMeters = allowedRadiusMeters; }

    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }

    public LocalDateTime getLastVerifiedDate() { return lastVerifiedDate; }
    public void setLastVerifiedDate(LocalDateTime lastVerifiedDate) { this.lastVerifiedDate = lastVerifiedDate; }

    public boolean isAssignmentPending() { return assignmentPending; }
    public void setAssignmentPending(boolean assignmentPending) { this.assignmentPending = assignmentPending; }

    public String getProcurementTrackingId() { return procurementTrackingId; }
    public void setProcurementTrackingId(String procurementTrackingId) { this.procurementTrackingId = procurementTrackingId; }

    public LocalDate getWarrantyExpiry() { return warrantyExpiry; }
    public void setWarrantyExpiry(LocalDate warrantyExpiry) { this.warrantyExpiry = warrantyExpiry; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
}
