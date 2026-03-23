package com.gov.asset_management.repository;

import com.gov.asset_management.model.RequestType;
import com.gov.asset_management.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    // 1. For Employee Dashboard
    List<ServiceRequest> findByEmployee_Username(String username);

    // 2. For Procurement Dashboard
    // Finds tickets that are 'SUBMITTED' (not yet processed) and are 'REQUISITION' type
    List<ServiceRequest> findByStatusAndType(String status, RequestType type);

    // 3. For Department Head Dashboard (NEW)
    // Fetches all tickets with a specific status (e.g., 'SUBMITTED') so the Dept Head can see Maintenance/Return requests
    List<ServiceRequest> findByStatus(String status);
}