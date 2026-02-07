package com.gov.asset_management.controller;

import com.gov.asset_management.model.Asset;
import com.gov.asset_management.model.AssetStatus;
import com.gov.asset_management.model.User;
import com.gov.asset_management.repository.AssetRepository;
import com.gov.asset_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "http://localhost:5173")
public class AssetController {

    @Autowired
    private AssetRepository assetRepo;

    @Autowired
    private UserRepository userRepo;

    // 1. View All Assets (Stock Register)
    @GetMapping
    public List<Asset> getAllAssets() {
        return assetRepo.findAll();
    }

    // 2. Add Asset
    @PostMapping("/add")
    public Asset addAsset(@RequestBody Asset asset) {
        return assetRepo.save(asset);
    }

    // 3. ASSIGN ASSET (Initiated by Procurement Officer)
    @PutMapping("/{id}/assign/{username}")
    public ResponseEntity<?> assignAsset(@PathVariable Long id, @PathVariable String username) {
        Optional<Asset> assetOpt = assetRepo.findById(id);
        if (assetOpt.isEmpty()) return ResponseEntity.badRequest().body("Asset not found!");

        Asset asset = assetOpt.get();

        // Check if already assigned or in use
        if (asset.getStatus() == AssetStatus.ASSIGNED) {
            return ResponseEntity.badRequest().body("Asset is already assigned/pending acceptance!");
        }

        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("Employee '" + username + "' not found!");

        User employee = userOpt.get();

        // Start Handover Process
        asset.setAssignedTo(employee);
        asset.setStatus(AssetStatus.ASSIGNED);
        asset.setAssignmentPending(true); // Waiting for Rahul to click "Accept"

        assetRepo.save(asset);
        System.out.println(">>> ASSET " + asset.getAssetId() + " ISSUED TO " + username);

        return ResponseEntity.ok("✅ Asset Assigned. Waiting for employee acceptance.");
    }

    // 4. ACCEPT CUSTODY (Initiated by Employee)
    // This fixes the "Error communicating with server" on Rahul's dashboard
    @PostMapping("/accept/{id}")
    public ResponseEntity<?> acceptAsset(@PathVariable Long id) {
        System.out.println(">>> PROCESSING ACCEPTANCE FOR ASSET ID: " + id);

        Optional<Asset> assetOpt = assetRepo.findById(id);
        if (assetOpt.isEmpty()) return ResponseEntity.notFound().build();

        Asset asset = assetOpt.get();

        // Finalize the Handover
        asset.setAssignmentPending(false); // Handshake complete

        // Optional: Update status to indicate it is now actively being used
        // Make sure IN_USE is in your AssetStatus enum
        // asset.setStatus(AssetStatus.ASSIGNED);

        assetRepo.save(asset);
        System.out.println(">>> SUCCESS: Employee has accepted custody of " + asset.getAssetName());

        return ResponseEntity.ok("✅ Custody accepted successfully.");
    }
}