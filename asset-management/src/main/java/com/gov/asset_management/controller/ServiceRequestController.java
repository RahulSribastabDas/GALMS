package com.gov.asset_management.controller;

import com.gov.asset_management.model.RequestType; // <-- Added this import
import com.gov.asset_management.model.ServiceRequest;
import com.gov.asset_management.model.User;
import com.gov.asset_management.repository.ServiceRequestRepository;
import com.gov.asset_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5173")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestRepository repo;

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/raise")
    public ResponseEntity<?> raiseTicket(@RequestBody ServiceRequest req) {
        try {
            System.out.println(">>> 1. RECEIVED REQUEST. Desc: " + req.getDescription());

            // Check if Employee data came from Frontend
            if (req.getEmployee() == null || req.getEmployee().getUsername() == null) {
                System.out.println(">>> ERROR: Username missing in payload");
                return ResponseEntity.badRequest().body("Error: Username is missing!");
            }

            String username = req.getEmployee().getUsername();
            System.out.println(">>> 2. LOOKING FOR USER: " + username);

            // Find User in DB
            User dbUser = userRepo.findByUsername(username).orElse(null);

            if (dbUser == null) {
                // THIS IS THE MOST COMMON CAUSE OF 500 ERRORS
                System.out.println(">>> ERROR: User '" + username + "' NOT FOUND in Database!");
                System.out.println(">>> HINT: Did you restart the server? If using H2, the user might be deleted.");
                return ResponseEntity.status(404).body("User '" + username + "' not found. Please Register/Login again.");
            }

            System.out.println(">>> 3. USER FOUND: ID " + dbUser.getId());

            // Prepare and Save
            req.setEmployee(dbUser);
            req.setCreatedAt(LocalDateTime.now());
            req.setStatus("SUBMITTED");

            ServiceRequest saved = repo.save(req);
            System.out.println(">>> 4. SAVED SUCCESSFULLY. Ticket ID: " + saved.getId());

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            // This prints the REAL error to your console
            System.err.println(">>> CRITICAL CRASH: ");
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Server Error: " + e.getMessage());
        }
    }

    @GetMapping("/my-tickets/{username}")
    public List<ServiceRequest> getMyTickets(@PathVariable String username) {
        return repo.findByEmployee_Username(username);
    }

    // --- NEW: FOR PROCUREMENT OFFICER ---
    // Fetches ONLY "REQUISITION" tickets that are newly "SUBMITTED"
    @GetMapping("/pending-requisitions")
    public ResponseEntity<List<ServiceRequest>> getPendingRequisitions() {
        List<ServiceRequest> pendingReqs = repo.findByStatusAndType(
                "SUBMITTED",
                RequestType.REQUISITION
        );
        return ResponseEntity.ok(pendingReqs);
    }
    // --- 5. UPDATE TICKET STATUS (e.g., Mark as CLOSED) ---
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable Long id, @RequestParam String status) {
        ServiceRequest request = repo.findById(id).orElse(null);

        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        request.setStatus(status);
        repo.save(request);

        return ResponseEntity.ok("Ticket " + id + " successfully marked as " + status);
    }
}