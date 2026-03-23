package com.gov.asset_management.repository;

import com.gov.asset_management.model.AuditDiscrepancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditRepository extends JpaRepository<AuditDiscrepancy, Long> {
    // This allows us to use all standard database commands like findAll() or save()
}