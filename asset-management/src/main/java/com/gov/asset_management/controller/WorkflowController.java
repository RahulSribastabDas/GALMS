package com.gov.asset_management.controller;

import com.gov.asset_management.model.*;
import com.gov.asset_management.repository.ApprovalRequestRepository;
import com.gov.asset_management.repository.AssetRepository;
import com.gov.asset_management.repository.ServiceRequestRepository;
import com.gov.asset_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkflowController {

    @Autowired
    private ApprovalRequestRepository requestRepo; // Indent Repo

    @Autowired
    private ServiceRequestRepository ticketRepo;   // Ticket Repo (NEW)

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AssetRepository assetRepo;

    // --- 1. SUBMIT MANUAL INDENT (Directly by PO) ---
    @PostMapping("/submit")
    public ResponseEntity<?> submitRequest(@RequestBody ApprovalRequest tempRequest, @RequestParam String username) {
        User maker = userRepo.findByUsername(username).orElse(null);
        if (maker == null) return ResponseEntity.badRequest().body("User not found!");

        ApprovalRequest newFile = new ApprovalRequest();
        newFile.setInitiatedBy(maker);
        newFile.setCreatedAt(LocalDateTime.now());
        newFile.setStatus(RequestStatus.PENDING);

        newFile.setItemName(tempRequest.getItemName());
        newFile.setCategory(tempRequest.getCategory());
        newFile.setEstimatedCost(tempRequest.getEstimatedCost());
        newFile.setVendorName(tempRequest.getVendorName());
        newFile.setType(tempRequest.getType());
        newFile.setRequiredApproverRole(Role.DEPT_HEAD);

        requestRepo.save(newFile);
        System.out.println(">>> MANUAL INDENT SUBMITTED: " + newFile.getItemName());

        return ResponseEntity.ok("✅ Indent Submitted!");
    }

    // --- 1.5 GET PENDING DEMANDS (For Amit's Dashboard) ---
    @GetMapping("/pending-demands")
    public List<ServiceRequest> getPendingDemands() {
        // Fetch tickets where Employees asked for items (REQUISITION) and status is SUBMITTED
        return ticketRepo.findByStatusAndType("SUBMITTED", RequestType.REQUISITION);
    }

    // --- 1.6 BRIDGE: CONVERT TICKET -> INDENT ---
    @PostMapping("/convert-to-indent/{ticketId}")
    @Transactional
    public ResponseEntity<?> createIndentFromTicket(@PathVariable Long ticketId, @RequestBody ApprovalRequest indentDetails, @RequestParam String username) {
        System.out.println(">>> CONVERTING TICKET #" + ticketId + " TO INDENT");

        // A. Find the Employee Ticket
        ServiceRequest ticket = ticketRepo.findById(ticketId).orElse(null);
        if (ticket == null) return ResponseEntity.notFound().build();

        // B. Find the Procurement Officer (User)
        User poUser = userRepo.findByUsername(username).orElse(null);
        if (poUser == null) return ResponseEntity.badRequest().body("PO User not found");

        // C. Update Ticket Status (So it doesn't show as pending anymore)
        ticket.setStatus("IN_PROGRESS");
        ticketRepo.save(ticket);

        // D. Create the Indent (ApprovalRequest)
        ApprovalRequest newIndent = new ApprovalRequest();
        newIndent.setInitiatedBy(poUser); // Created by Amit
        newIndent.setCreatedAt(LocalDateTime.now());
        newIndent.setStatus(RequestStatus.PENDING);
        newIndent.setRequiredApproverRole(Role.DEPT_HEAD);
        newIndent.setType(RequestType.PROCUREMENT); // Or PURCHASE

        // Auto-fill details from Ticket + PO Input
        newIndent.setItemName(ticket.getDescription()); // Map Description -> Item Name
        newIndent.setCategory("Hardware"); // Can be dynamic
        newIndent.setVendorName(indentDetails.getVendorName()); // PO Enters this
        newIndent.setEstimatedCost(indentDetails.getEstimatedCost()); // PO Enters this

        // THE BRIDGE: Link them!
        newIndent.setLinkedTicket(ticket);

        requestRepo.save(newIndent);
        System.out.println(">>> SUCCESS: Created Indent from Ticket #" + ticketId);

        return ResponseEntity.ok(newIndent);
    }

    // --- 2. VIEW PENDING INDENTS (For Priya) ---
    @GetMapping("/pending/{role}")
    public List<ApprovalRequest> viewPendingRequests(@PathVariable Role role) {
        return requestRepo.findByRequiredApproverRoleAndStatus(role, RequestStatus.PENDING);
    }

    // --- 3. APPROVE & CREATE ASSET ---
    @PutMapping("/approve/{id}")
    @Transactional
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestParam String adminName) {
        System.out.println(">>> ATTEMPTING APPROVAL FOR REQUEST ID: " + id);

        Optional<ApprovalRequest> reqOpt = requestRepo.findById(id);
        if (reqOpt.isEmpty()) return ResponseEntity.notFound().build();
        ApprovalRequest request = reqOpt.get();

        request.setStatus(RequestStatus.APPROVED);
        request.setActionedAt(LocalDateTime.now());
        request.setActionedByAdminName(adminName);
        requestRepo.save(request);

        // CREATE ASSET
        try {
            Asset newAsset = new Asset();
            newAsset.setAssetName(request.getItemName());
            newAsset.setCategory(request.getCategory());
            newAsset.setCost(request.getEstimatedCost());
            newAsset.setSupplier(request.getVendorName());
            newAsset.setPurchaseDate(LocalDate.now());
            newAsset.setStatus(AssetStatus.AVAILABLE);
            newAsset.setDepartment("General Administration");

            // Smart ID
            String govId = "GOV-" + LocalDate.now().getYear() + "-" + request.getId();
            newAsset.setAssetId(govId);

            // If this indent was linked to a ticket, auto-assign (optional logic)
            if(request.getLinkedTicket() != null) {
                // You could auto-assign here or leave it for "Issue Asset" step
                System.out.println(">>> NOTE: This asset belongs to Ticket #" + request.getLinkedTicket().getId());
            }

            assetRepo.save(newAsset);
            System.out.println(">>> SUCCESS: ASSET CREATED " + govId);

            return ResponseEntity.ok("✅ Request Approved & Asset '" + govId + "' Created.");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // --- 4. REJECT ---
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id, @RequestParam String adminName) {
        Optional<ApprovalRequest> reqOpt = requestRepo.findById(id);
        if (reqOpt.isPresent()) {
            ApprovalRequest request = reqOpt.get();
            request.setStatus(RequestStatus.REJECTED);
            request.setActionedAt(LocalDateTime.now());
            request.setActionedByAdminName(adminName);
            requestRepo.save(request);

            // Also revert the ticket status if it was linked
            if(request.getLinkedTicket() != null) {
                ServiceRequest ticket = request.getLinkedTicket();
                ticket.setStatus("REJECTED_BY_DEPT");
                ticketRepo.save(ticket);
            }

            return ResponseEntity.ok("❌ Request Rejected.");
        }
        return ResponseEntity.notFound().build();
    }
}