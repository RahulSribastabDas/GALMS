package com.gov.asset_management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String email;
    private String currentOtp;

    private String departmentName;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private Boolean isActive = true;

    private Boolean firstLogin = true;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCurrentOtp() { return currentOtp; }
    public void setCurrentOtp(String currentOtp) { this.currentOtp = currentOtp; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getFirstLogin() { return firstLogin; }
    public void setFirstLogin(Boolean firstLogin) { this.firstLogin = firstLogin; }
}
