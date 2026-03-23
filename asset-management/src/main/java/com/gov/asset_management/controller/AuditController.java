package com.gov.asset_management.controller;

import com.gov.asset_management.model.AuditDiscrepancy;
import com.gov.asset_management.repository.AuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audits")
@CrossOrigin(origins = "http://localhost:5173")
public class AuditController {

    @Autowired
    private AuditRepository auditRepository;

    @GetMapping("/discrepancies")
    public List<AuditDiscrepancy> getAllDiscrepancies() {
        return auditRepository.findAll();
    }
}