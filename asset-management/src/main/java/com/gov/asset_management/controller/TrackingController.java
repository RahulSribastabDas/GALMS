package com.gov.asset_management.controller;

import com.gov.asset_management.model.*;
import com.gov.asset_management.repository.*;
import com.gov.asset_management.service.AnomalyDetectionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "http://localhost:5173")
public class TrackingController {

    private static final Logger logger = LoggerFactory.getLogger(TrackingController.class);

    @Autowired
    private AssetLocationLogRepository locationLogRepo;

    @Autowired
    private GeofenceZoneRepository geofenceRepo;

    @Autowired
    private AnomalyRepository anomalyRepo;

    @Autowired
    private AssetRepository assetRepo;

    @Autowired
    private AnomalyDetectionService anomalyService;

    @PostMapping("/location/update")
    public ResponseEntity<?> updateLocation(@RequestBody Map<String, Object> payload) {
        try {
            Long assetId = Long.valueOf(payload.get("assetId").toString());
            
            AssetLocationLog log = new AssetLocationLog();
            log.setAssetId(assetId);
            log.setTrackingId(payload.get("trackingId") != null ? payload.get("trackingId").toString() : null);
            log.setLatitude(Double.parseDouble(payload.get("latitude").toString()));
            log.setLongitude(Double.parseDouble(payload.get("longitude").toString()));
            
            if (payload.get("altitude") != null) {
                log.setAltitude(Double.parseDouble(payload.get("altitude").toString()));
            }
            if (payload.get("speed") != null) {
                log.setSpeed(Double.parseDouble(payload.get("speed").toString()));
            }
            if (payload.get("heading") != null) {
                log.setHeading(Double.parseDouble(payload.get("heading").toString()));
            }
            if (payload.get("accuracy") != null) {
                log.setAccuracy(Double.parseDouble(payload.get("accuracy").toString()));
            }
            if (payload.get("timestamp") != null) {
                log.setTimestamp(LocalDateTime.parse(payload.get("timestamp").toString()));
            } else {
                log.setTimestamp(LocalDateTime.now());
            }
            
            log.setLocationSource(payload.get("source") != null ? payload.get("source").toString() : "GPS");
            log.setDeviceId(payload.get("deviceId") != null ? payload.get("deviceId").toString() : null);

            AssetLocationLog saved = locationLogRepo.save(log);

            Map<String, Object> analysis = anomalyService.analyzeLocation(saved);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("logId", saved.getId());
            response.put("riskScore", analysis.get("riskScore"));
            response.put("isAnomaly", analysis.get("isAnomaly"));
            response.put("severity", analysis.get("severity"));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error updating location", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to update location: " + e.getMessage()));
        }
    }

    @GetMapping("/asset/{assetId}/location")
    public ResponseEntity<?> getLatestLocation(@PathVariable Long assetId) {
        try {
            Optional<AssetLocationLog> location = locationLogRepo.findLatestByAssetId(assetId);
            if (location.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(location.get());
        } catch (Exception e) {
            logger.error("Error fetching location for asset {}", assetId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch location"));
        }
    }

    @GetMapping("/asset/{assetId}/history")
    public ResponseEntity<?> getLocationHistory(
            @PathVariable Long assetId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            List<AssetLocationLog> history;
            
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDateTime.parse(startDate);
                LocalDateTime end = LocalDateTime.parse(endDate);
                history = locationLogRepo.findByAssetIdAndTimestampBetweenOrderByTimestampAsc(assetId, start, end);
            } else {
                history = locationLogRepo.findByAssetIdOrderByTimestampDesc(assetId);
            }

            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("Error fetching location history for asset {}", assetId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch location history"));
        }
    }

    @GetMapping("/assets/all-locations")
    public ResponseEntity<?> getAllAssetLocations() {
        try {
            List<Long> assetIds = locationLogRepo.findDistinctAssetIds();
            List<Map<String, Object>> locations = new ArrayList<>();

            for (Long assetId : assetIds) {
                Optional<AssetLocationLog> locationOpt = locationLogRepo.findLatestByAssetId(assetId);
                Optional<Asset> assetOpt = assetRepo.findById(assetId);

                if (locationOpt.isPresent() && assetOpt.isPresent()) {
                    AssetLocationLog loc = locationOpt.get();
                    Asset asset = assetOpt.get();

                    Map<String, Object> item = new HashMap<>();
                    item.put("assetId", assetId);
                    item.put("assetName", asset.getAssetName());
                    item.put("assetIdDisplay", asset.getAssetId());
                    item.put("latitude", loc.getLatitude());
                    item.put("longitude", loc.getLongitude());
                    item.put("lastUpdate", loc.getTimestamp());
                    item.put("riskScore", loc.getAnomalyRiskScore());
                    item.put("isWithinGeofence", loc.getIsWithinGeofence());
                    item.put("category", asset.getCategory());
                    item.put("department", asset.getDepartment());

                    locations.add(item);
                }
            }

            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            logger.error("Error fetching all asset locations", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch locations"));
        }
    }

    @GetMapping("/geofences")
    public ResponseEntity<?> getGeofences(@RequestParam(required = false) String department) {
        try {
            List<GeofenceZone> zones;
            
            if (department != null && !department.isEmpty()) {
                zones = geofenceRepo.findByDepartmentNameAndIsActiveTrue(department);
            } else {
                zones = geofenceRepo.findByIsActiveTrue();
            }

            return ResponseEntity.ok(zones);
        } catch (Exception e) {
            logger.error("Error fetching geofences", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch geofences"));
        }
    }

    @PostMapping("/geofence/create")
    public ResponseEntity<?> createGeofence(@RequestBody GeofenceZone zone) {
        try {
            if (zone.getZoneName() == null || zone.getZoneName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Zone name is required"));
            }
            if (zone.getCenterLatitude() == null || zone.getCenterLongitude() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Center coordinates are required"));
            }
            if (zone.getRadiusMeters() == null) {
                zone.setRadiusMeters(500.0);
            }

            GeofenceZone saved = geofenceRepo.save(zone);
            logger.info("Geofence zone created: {}", saved.getZoneName());

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Error creating geofence", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create geofence"));
        }
    }

    @GetMapping("/anomalies")
    public ResponseEntity<?> getAnomalies(
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        try {
            List<Anomaly> anomalies;

            if (activeOnly) {
                anomalies = anomalyRepo.findByIsResolvedFalseOrderByTimestampDesc();
            } else if (severity != null && !severity.isEmpty()) {
                anomalies = anomalyRepo.findBySeverityOrderByTimestampDesc(severity);
            } else {
                anomalies = anomalyRepo.findAllByOrderByTimestampDesc();
            }

            return ResponseEntity.ok(anomalies);
        } catch (Exception e) {
            logger.error("Error fetching anomalies", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch anomalies"));
        }
    }

    @GetMapping("/anomalies/high-risk")
    public ResponseEntity<?> getHighRiskAnomalies() {
        try {
            List<Anomaly> anomalies = anomalyService.getHighRiskAnomalies();
            return ResponseEntity.ok(anomalies);
        } catch (Exception e) {
            logger.error("Error fetching high-risk anomalies", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch anomalies"));
        }
    }

    @PutMapping("/anomaly/{id}/resolve")
    public ResponseEntity<?> resolveAnomaly(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        try {
            String resolvedBy = payload.getOrDefault("resolvedBy", "System");
            String notes = payload.getOrDefault("notes", "");

            boolean success = anomalyService.resolveAnomaly(id, resolvedBy, notes);
            
            if (!success) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(Map.of("message", "Anomaly resolved successfully"));
        } catch (Exception e) {
            logger.error("Error resolving anomaly {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to resolve anomaly"));
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getTrackingStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            stats.put("totalTrackedAssets", locationLogRepo.findDistinctAssetIds().size());
            stats.put("activeGeofences", geofenceRepo.findByIsActiveTrue().size());
            stats.put("pendingAnomalies", anomalyRepo.countByIsResolvedFalse());
            stats.put("criticalAnomalies", anomalyRepo.countBySeverity("CRITICAL"));
            stats.put("geofenceBreaches", locationLogRepo.findGeofenceBreaches().size());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching tracking stats", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch stats"));
        }
    }
}
