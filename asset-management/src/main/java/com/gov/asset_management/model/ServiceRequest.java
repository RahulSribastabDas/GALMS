package com.gov.asset_management.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import this
import java.time.LocalDateTime;

@Entity
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- LINK TO USER MODEL ---
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties("password") // Security: Don't send password back to frontend
    private User employee;

    @Enumerated(EnumType.STRING)
    private RequestType type;

    private String priority;
    private String description;
    private String status = "SUBMITTED";
    private LocalDateTime createdAt = LocalDateTime.now();

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getEmployee() { return employee; }
    public void setEmployee(User employee) { this.employee = employee; }

    public RequestType getType() { return type; }
    public void setType(RequestType type) { this.type = type; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}