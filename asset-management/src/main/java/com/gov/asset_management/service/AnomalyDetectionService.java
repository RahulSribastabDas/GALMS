package com.gov.asset_management.service;

import com.gov.asset_management.model.*;
import com.gov.asset_management.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class AnomalyDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(AnomalyDetectionService.class);

    @Autowired
    private AssetLocationLogRepository locationLogRepo;

    @Autowired
    private GeofenceZoneRepository geofenceRepo;

    @Autowired
    private AnomalyRepository anomalyRepo;

    @Autowired
    private AssetRepository assetRepo;

    public Map<String, Object> analyzeLocation(AssetLocationLog locationLog) {
        Map<String, Object> result = new HashMap<>();
        int totalRiskScore = 0;
        List<String> anomalyReasons = new ArrayList<>();

        try {
            result.put("assetId", locationLog.getAssetId());
            result.put("timestamp", locationLog.getTimestamp());
            result.put("latitude", locationLog.getLatitude());
            result.put("longitude", locationLog.getLongitude());

            int geofenceScore = checkGeofenceBreach(locationLog);
            if (geofenceScore > 0) {
                totalRiskScore += geofenceScore;
                anomalyReasons.add("GEOFENCE_BREACH");
            }

            int timeScore = checkUnusualTime(locationLog);
            if (timeScore > 0) {
                totalRiskScore += timeScore;
                anomalyReasons.add("UNUSUAL_TIME");
            }

            int speedScore = checkUnusualSpeed(locationLog);
            if (speedScore > 0) {
                totalRiskScore += speedScore;
                anomalyReasons.add("UNUSUAL_SPEED");
            }

            int trajectoryScore = checkTrajectoryDeviation(locationLog);
            if (trajectoryScore > 0) {
                totalRiskScore += trajectoryScore;
                anomalyReasons.add("TRAJECTORY_DEVIATION");
            }

            totalRiskScore = Math.min(100, totalRiskScore);

            result.put("riskScore", totalRiskScore);
            result.put("anomalyReasons", anomalyReasons);
            result.put("isAnomaly", totalRiskScore >= 30);
            result.put("severity", getSeverity(totalRiskScore));

            locationLog.setAnomalyRiskScore(totalRiskScore);
            locationLog.setAnomalyReason(String.join(", ", anomalyReasons));
            locationLog.setIsWithinGeofence(geofenceScore == 0);
            locationLogRepo.save(locationLog);

            if (totalRiskScore >= 50) {
                createAnomalyRecord(locationLog, anomalyReasons, totalRiskScore);
            }

        } catch (Exception e) {
            logger.error("Error analyzing location for asset {}", locationLog.getAssetId(), e);
        }

        return result;
    }

    private int checkGeofenceBreach(AssetLocationLog location) {
        List<GeofenceZone> activeZones = geofenceRepo.findByIsActiveTrue();
        
        if (activeZones.isEmpty()) {
            return 0;
        }

        for (GeofenceZone zone : activeZones) {
            if (zone.getCenterLatitude() == null || zone.getCenterLongitude() == null) {
                continue;
            }

            double distance = calculateDistance(
                location.getLatitude(), location.getLongitude(),
                zone.getCenterLatitude(), zone.getCenterLongitude()
            );

            double radiusMeters = zone.getRadiusMeters() != null ? zone.getRadiusMeters() : 1000;

            if (distance > radiusMeters) {
                logger.warn("Geofence breach detected for asset {} - {}m outside zone {}", 
                    location.getAssetId(), (long) distance, zone.getZoneName());
                return 40;
            }
        }

        return 0;
    }

    private int checkUnusualTime(AssetLocationLog location) {
        LocalDateTime timestamp = location.getTimestamp();
        if (timestamp == null) {
            return 0;
        }

        LocalTime time = timestamp.toLocalTime();
        LocalTime nightStart = LocalTime.of(22, 0);
        LocalTime nightEnd = LocalTime.of(6, 0);
        LocalTime earlyMorningEnd = LocalTime.of(8, 0);

        if (time.isAfter(nightStart) || time.isBefore(nightEnd)) {
            if (time.isBefore(earlyMorningEnd) || time.isAfter(nightStart)) {
                logger.info("Unusual time detected for asset {}: {}", 
                    location.getAssetId(), time);
                return 20;
            }
        }

        return 0;
    }

    private int checkUnusualSpeed(AssetLocationLog location) {
        Double speed = location.getSpeed();
        if (speed == null) {
            return 0;
        }

        if (speed > 150) {
            logger.warn("Unusual high speed detected for asset {}: {} km/h", 
                location.getAssetId(), speed);
            return 30;
        }

        if (speed > 100) {
            return 15;
        }

        return 0;
    }

    private int checkTrajectoryDeviation(AssetLocationLog location) {
        Optional<AssetLocationLog> previousOpt = locationLogRepo
            .findFirstByAssetIdOrderByTimestampDesc(location.getAssetId());

        if (previousOpt.isEmpty()) {
            return 0;
        }

        AssetLocationLog previous = previousOpt.get();
        
        double distance = calculateDistance(
            previous.getLatitude(), previous.getLongitude(),
            location.getLatitude(), location.getLongitude()
        );

        long minutesDiff = java.time.Duration.between(
            previous.getTimestamp(), location.getTimestamp()
        ).toMinutes();

        if (minutesDiff <= 0) {
            return 0;
        }

        double speedKmH = (distance / 1000.0) / (minutesDiff / 60.0);

        if (speedKmH > 200) {
            logger.warn("Trajectory anomaly: asset {} moved {}m in {} minutes ({} km/h)",
                location.getAssetId(), (long) distance, minutesDiff, (long) speedKmH);
            return 35;
        }

        return 0;
    }

    private void createAnomalyRecord(AssetLocationLog location, List<String> reasons, int riskScore) {
        try {
            Optional<Asset> assetOpt = assetRepo.findById(location.getAssetId());
            
            Anomaly anomaly = new Anomaly();
            assetOpt.ifPresent(anomaly::setAsset);
            
            anomaly.setAssetTrackingId(location.getTrackingId());
            assetOpt.ifPresent(a -> anomaly.setAssetName(a.getAssetName()));
            anomaly.setAnomalyType(String.join(",", reasons));
            anomaly.setRiskScore(riskScore);
            anomaly.setSeverity(getSeverity(riskScore));
            anomaly.setDescription(buildAnomalyDescription(location, reasons, riskScore));
            anomaly.setLatitude(location.getLatitude());
            anomaly.setLongitude(location.getLongitude());
            anomaly.setTimestamp(LocalDateTime.now());
            anomaly.setLocationLogId(location.getId());
            anomaly.setDetectionSource("AI_ANALYZER");

            anomalyRepo.save(anomaly);
            logger.info("Created anomaly record for asset {} with risk score {}", 
                location.getAssetId(), riskScore);

        } catch (Exception e) {
            logger.error("Failed to create anomaly record for asset {}", 
                location.getAssetId(), e);
        }
    }

    private String buildAnomalyDescription(AssetLocationLog location, List<String> reasons, int riskScore) {
        StringBuilder desc = new StringBuilder();
        desc.append("Risk Score: ").append(riskScore).append("/100. ");
        
        if (reasons.contains("GEOFENCE_BREACH")) {
            desc.append("Asset is outside authorized zone. ");
        }
        if (reasons.contains("UNUSUAL_TIME")) {
            desc.append("Movement detected during unusual hours. ");
        }
        if (reasons.contains("UNUSUAL_SPEED")) {
            desc.append("Abnormal speed detected: ").append(location.getSpeed()).append(" km/h. ");
        }
        if (reasons.contains("TRAJECTORY_DEVIATION")) {
            desc.append("Unusual trajectory deviation from expected path. ");
        }
        
        desc.append("Location: ").append(location.getLatitude())
            .append(", ").append(location.getLongitude());
        
        return desc.toString();
    }

    private String getSeverity(int riskScore) {
        if (riskScore >= 80) return "CRITICAL";
        if (riskScore >= 60) return "HIGH";
        if (riskScore >= 40) return "MEDIUM";
        if (riskScore >= 30) return "LOW";
        return "INFO";
    }

    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000;

        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public List<Anomaly> getActiveAnomalies() {
        return anomalyRepo.findByIsResolvedFalseOrderByTimestampDesc();
    }

    public List<Anomaly> getHighRiskAnomalies() {
        return anomalyRepo.findByRiskScoreGreaterThanOrderByRiskScoreDesc(50);
    }

    public boolean resolveAnomaly(Long anomalyId, String resolvedBy, String notes) {
        Optional<Anomaly> anomalyOpt = anomalyRepo.findById(anomalyId);
        if (anomalyOpt.isEmpty()) {
            return false;
        }

        Anomaly anomaly = anomalyOpt.get();
        anomaly.setIsResolved(true);
        anomaly.setResolvedAt(LocalDateTime.now());
        anomaly.setResolvedBy(resolvedBy);
        anomaly.setResolutionNotes(notes);
        anomalyRepo.save(anomaly);

        return true;
    }
}
