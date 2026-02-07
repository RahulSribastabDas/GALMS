package com.gov.asset_management.repository;

import com.gov.asset_management.model.ApprovalRequest;
import com.gov.asset_management.model.RequestStatus; // <--- Make sure to import this
import com.gov.asset_management.model.Role;
import com.gov.asset_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {

    // 1. Basic: "Show me all requests for my role" (History + Pending)
    List<ApprovalRequest> findByRequiredApproverRole(Role role);

    // 2. *** NEW REQUIRED METHOD *** // Used by WorkflowController to show the "Inbox" (Only PENDING items for this Role)
    List<ApprovalRequest> findByRequiredApproverRoleAndStatus(Role role, RequestStatus status);

    // 3. For Employee: "Show me the status of MY requests"
    List<ApprovalRequest> findByInitiatedBy(User user);

    // 4. For Super Admin: "Show me all pending requests globally"
    List<ApprovalRequest> findByStatus(RequestStatus status);
}