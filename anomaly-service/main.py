"""
GALMS AI-Powered Anomaly Detection Microservice
FastAPI-based real-time asset tracking and anomaly detection
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, time
from collections import deque
import math
import json
import logging
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GALMS Anomaly Detection Service",
    description="AI-powered geofencing and asset tracking anomaly detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnomalyType(str, Enum):
    GEOFENCE_BREACH = "GEOFENCE_BREACH"
    UNUSUAL_TIME = "UNUSUAL_TIME"
    UNUSUAL_SPEED = "UNUSUAL_SPEED"
    TRAJECTORY_DEVIATION = "TRAJECTORY_DEVIATION"
    STATIONARY_ANOMALY = "STATIONARY_ANOMALY"
    RAPID_MOVEMENT = "RAPID_MOVEMENT"

class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class LocationUpdate(BaseModel):
    asset_id: int
    tracking_id: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: Optional[float] = None
    speed: Optional[float] = Field(None, ge=0)
    heading: Optional[float] = Field(None, ge=0, le=360)
    accuracy: Optional[float] = None
    timestamp: Optional[datetime] = None
    device_id: Optional[str] = None
    source: str = "GPS"

class GeofenceZone(BaseModel):
    id: Optional[int] = None
    zone_name: str
    zone_type: str = "CIRCLE"
    department_name: Optional[str] = None
    center_latitude: float
    center_longitude: float
    radius_meters: float = 500.0
    polygon_coordinates: Optional[str] = None
    zone_color: str = "#3B82F6"
    is_active: bool = True
    alert_on_exit: bool = True
    alert_on_entry: bool = False
    description: Optional[str] = None

class AnomalyResult(BaseModel):
    asset_id: int
    risk_score: int = Field(..., ge=0, le=100)
    is_anomaly: bool
    severity: Severity
    anomaly_types: List[AnomalyType]
    description: str
    latitude: float
    longitude: float
    timestamp: datetime
    recommendations: List[str]

class GeofenceBreachEvent(BaseModel):
    asset_id: int
    asset_name: Optional[str] = None
    zone_name: str
    distance_from_center: float
    radius_meters: float
    latitude: float
    longitude: float
    timestamp: datetime

class AnomalyAlert(BaseModel):
    id: str
    asset_id: int
    asset_tracking_id: Optional[str] = None
    asset_name: Optional[str] = None
    anomaly_type: AnomalyType
    severity: Severity
    risk_score: int
    description: str
    latitude: float
    longitude: float
    timestamp: datetime
    is_resolved: bool = False

# In-memory storage (use Redis/PostgreSQL in production)
asset_locations: Dict[int, deque] = {}
asset_last_location: Dict[int, Dict] = {}
geofence_zones: Dict[int, GeofenceZone] = {}
anomaly_alerts: deque = deque(maxlen=1000)
alert_id_counter = 0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in meters using Haversine formula"""
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def check_geofence_breach(location: LocationUpdate) -> tuple[int, Optional[str]]:
    """Check if asset is within authorized geofence zones"""
    for zone in geofence_zones.values():
        if not zone.is_active:
            continue
            
        distance = haversine_distance(
            location.latitude, location.longitude,
            zone.center_latitude, zone.center_longitude
        )
        
        if distance > zone.radius_meters:
            return 40, f"Outside zone '{zone.zone_name}' by {int(distance - zone.radius_meters)}m"
    
    return 0, None

def check_unusual_time(location: LocationUpdate) -> tuple[int, Optional[str]]:
    """Check if movement occurs during unusual hours"""
    if location.timestamp is None:
        location.timestamp = datetime.now()
    
    current_time = location.timestamp.time()
    
    night_start = time(22, 0)
    night_end = time(6, 0)
    early_morning_end = time(8, 0)
    
    if current_time >= night_start or current_time <= night_end:
        if current_time <= early_morning_end or current_time >= night_start:
            return 20, f"Movement detected at unusual hour: {current_time.strftime('%H:%M')}"
    
    return 0, None

def check_unusual_speed(location: LocationUpdate) -> tuple[int, Optional[str]]:
    """Check for unusual speed patterns"""
    if location.speed is None:
        return 0, None
    
    if location.speed > 150:
        return 30, f"Unusually high speed: {location.speed} km/h"
    elif location.speed > 100:
        return 15, f"Elevated speed: {location.speed} km/h"
    
    return 0, None

def check_trajectory_deviation(asset_id: int, location: LocationUpdate) -> tuple[int, Optional[str]]:
    """Check for unusual trajectory patterns"""
    if asset_id not in asset_last_location:
        return 0, None
    
    last = asset_last_location[asset_id]
    distance = haversine_distance(
        last['latitude'], last['longitude'],
        location.latitude, location.longitude
    )
    
    if location.timestamp and last.get('timestamp'):
        time_diff = (location.timestamp - last['timestamp']).total_seconds() / 3600
        if time_diff > 0:
            speed_kmh = (distance / 1000) / time_diff
            
            if speed_kmh > 200:
                return 35, f"Impossible travel speed: {int(speed_kmh)} km/h"
            elif speed_kmh > 120:
                return 20, f"Unusual travel speed: {int(speed_kmh)} km/h"
    
    if distance > 10000:
        return 25, f"Sudden location jump: {int(distance/1000)}km"
    
    return 0, None

def check_stationary_anomaly(asset_id: int, location: LocationUpdate) -> tuple[int, Optional[str]]:
    """Detect if asset has been stationary too long in unusual location"""
    if asset_id not in asset_locations or len(asset_locations[asset_id]) < 5:
        return 0, None
    
    recent_locations = list(asset_locations[asset_id])[-10:]
    
    if all(abs(loc['latitude'] - location.latitude) < 0.0001 and 
           abs(loc['longitude'] - location.longitude) < 0.0001 
           for loc in recent_locations):
        
        hours_stationary = len(recent_locations) * 5 / 60
        if hours_stationary > 24:
            return 30, f"Stationary for {int(hours_stationary)} hours in same location"
        elif hours_stationary > 8:
            return 15, f"Extended stationary period: {int(hours_stationary)} hours"
    
    return 0, None

def get_severity(risk_score: int) -> Severity:
    """Convert risk score to severity level"""
    if risk_score >= 80:
        return Severity.CRITICAL
    elif risk_score >= 60:
        return Severity.HIGH
    elif risk_score >= 40:
        return Severity.MEDIUM
    elif risk_score >= 30:
        return Severity.LOW
    return Severity.INFO

def analyze_location(location: LocationUpdate) -> AnomalyResult:
    """Main anomaly detection analysis"""
    global alert_id_counter
    
    if location.timestamp is None:
        location.timestamp = datetime.now()
    
    total_risk_score = 0
    anomaly_types = []
    descriptions = []
    recommendations = []
    
    geofence_score, geofence_desc = check_geofence_breach(location)
    if geofence_score > 0:
        total_risk_score += geofence_score
        anomaly_types.append(AnomalyType.GEOFENCE_BREACH)
        descriptions.append(geofence_desc)
        recommendations.append("Verify asset location immediately")
        recommendations.append("Contact asset custodian")
    
    time_score, time_desc = check_unusual_time(location)
    if time_score > 0:
        total_risk_score += time_score
        anomaly_types.append(AnomalyType.UNUSUAL_TIME)
        descriptions.append(time_desc)
        recommendations.append("Review access logs for unauthorized use")
    
    speed_score, speed_desc = check_unusual_speed(location)
    if speed_score > 0:
        total_risk_score += speed_score
        anomaly_types.append(AnomalyType.UNUSUAL_SPEED)
        descriptions.append(speed_desc)
        recommendations.append("Verify vehicle tracking device")
    
    trajectory_score, trajectory_desc = check_trajectory_deviation(location.asset_id, location)
    if trajectory_score > 0:
        total_risk_score += trajectory_score
        anomaly_types.append(AnomalyType.TRAJECTORY_DEVIATION)
        descriptions.append(trajectory_desc)
        recommendations.append("Review recent route history")
    
    stationary_score, stationary_desc = check_stationary_anomaly(location.asset_id, location)
    if stationary_score > 0:
        total_risk_score += stationary_score
        anomaly_types.append(AnomalyType.STATIONARY_ANOMALY)
        descriptions.append(stationary_desc)
        recommendations.append("Physical verification recommended")
    
    total_risk_score = min(100, total_risk_score)
    
    is_anomaly = total_risk_score >= 30
    
    if is_anomaly:
        alert_id_counter += 1
        alert = AnomalyAlert(
            id=f"ALERT-{alert_id_counter:05d}",
            asset_id=location.asset_id,
            asset_tracking_id=location.tracking_id,
            anomaly_type=anomaly_types[0] if anomaly_types else AnomalyType.GEOFENCE_BREACH,
            severity=get_severity(total_risk_score),
            risk_score=total_risk_score,
            description="; ".join(descriptions) if descriptions else "General anomaly detected",
            latitude=location.latitude,
            longitude=location.longitude,
            timestamp=location.timestamp
        )
        anomaly_alerts.append(alert)
        logger.warning(f"ALERT: Asset {location.asset_id} - Risk Score: {total_risk_score}")
    
    return AnomalyResult(
        asset_id=location.asset_id,
        risk_score=total_risk_score,
        is_anomaly=is_anomaly,
        severity=get_severity(total_risk_score),
        anomaly_types=anomaly_types,
        description="; ".join(descriptions) if descriptions else "Normal operation",
        latitude=location.latitude,
        longitude=location.longitude,
        timestamp=location.timestamp,
        recommendations=list(set(recommendations))
    )

@app.get("/")
async def root():
    return {
        "service": "GALMS Anomaly Detection Service",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "POST /analyze": "Analyze location for anomalies",
            "POST /geofence": "Add geofence zone",
            "GET /geofences": "List all geofences",
            "GET /alerts": "Get active anomaly alerts",
            "GET /alerts/high-risk": "Get critical/high severity alerts",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_zones": len([z for z in geofence_zones.values() if z.is_active]),
        "tracked_assets": len(asset_locations),
        "active_alerts": len([a for a in anomaly_alerts if not a.is_resolved])
    }

@app.post("/analyze", response_model=AnomalyResult)
async def analyze_asset_location(location: LocationUpdate, background_tasks: BackgroundTasks):
    """Analyze a single location update for anomalies"""
    result = analyze_location(location)
    
    if location.asset_id not in asset_locations:
        asset_locations[location.asset_id] = deque(maxlen=100)
    
    asset_locations[location.asset_id].append({
        'latitude': location.latitude,
        'longitude': location.longitude,
        'timestamp': location.timestamp,
        'risk_score': result.risk_score
    })
    
    asset_last_location[location.asset_id] = {
        'latitude': location.latitude,
        'longitude': location.longitude,
        'timestamp': location.timestamp
    }
    
    return result

@app.post("/analyze/batch")
async def analyze_batch(locations: List[LocationUpdate]):
    """Analyze multiple location updates"""
    results = []
    for location in locations:
        result = analyze_location(location)
        results.append(result)
    return {"results": results, "total_analyzed": len(locations)}

@app.post("/geofence")
async def add_geofence(zone: GeofenceZone):
    """Add a new geofence zone"""
    if zone.id is None:
        zone.id = len(geofence_zones) + 1
    
    geofence_zones[zone.id] = zone
    logger.info(f"Geofence zone added: {zone.zone_name}")
    
    return {"message": "Geofence zone created", "zone": zone}

@app.get("/geofences")
async def list_geofences(department: Optional[str] = None):
    """List all geofence zones"""
    zones = list(geofence_zones.values())
    
    if department:
        zones = [z for z in zones if z.department_name == department]
    
    return {"zones": zones, "count": len(zones)}

@app.delete("/geofence/{zone_id}")
async def delete_geofence(zone_id: int):
    """Delete a geofence zone"""
    if zone_id not in geofence_zones:
        raise HTTPException(status_code=404, detail="Geofence not found")
    
    zone = geofence_zones.pop(zone_id)
    return {"message": f"Geofence '{zone.zone_name}' deleted"}

@app.get("/alerts")
async def get_alerts(
    severity: Optional[Severity] = None,
    resolved: bool = False,
    limit: int = 100
):
    """Get anomaly alerts"""
    alerts = list(anomaly_alerts)
    
    if not resolved:
        alerts = [a for a in alerts if not a.is_resolved]
    
    if severity:
        alerts = [a for a in alerts if a.severity == severity]
    
    alerts = sorted(alerts, key=lambda x: x.timestamp, reverse=True)[:limit]
    
    return {"alerts": alerts, "count": len(alerts)}

@app.get("/alerts/high-risk")
async def get_high_risk_alerts():
    """Get critical and high severity alerts"""
    critical_high = [
        a for a in anomaly_alerts 
        if a.severity in [Severity.CRITICAL, Severity.HIGH] and not a.is_resolved
    ]
    critical_high.sort(key=lambda x: (x.risk_score, x.timestamp), reverse=True)
    
    return {"alerts": critical_high, "count": len(critical_high)}

@app.put("/alert/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Mark an alert as acknowledged (not fully resolved)"""
    for alert in anomaly_alerts:
        if alert.id == alert_id:
            return {"message": f"Alert {alert_id} acknowledged"}
    raise HTTPException(status_code=404, detail="Alert not found")

@app.get("/stats")
async def get_stats():
    """Get anomaly detection statistics"""
    total_alerts = len(anomaly_alerts)
    unresolved = len([a for a in anomaly_alerts if not a.is_resolved])
    critical = len([a for a in anomaly_alerts if a.severity == Severity.CRITICAL])
    high = len([a for a in anomaly_alerts if a.severity == Severity.HIGH])
    
    avg_risk = 0
    if total_alerts > 0:
        avg_risk = sum(a.risk_score for a in anomaly_alerts) / total_alerts
    
    return {
        "total_alerts": total_alerts,
        "unresolved": unresolved,
        "critical": critical,
        "high": high,
        "average_risk_score": round(avg_risk, 2),
        "active_geofences": len([z for z in geofence_zones.values() if z.is_active]),
        "tracked_assets": len(asset_locations)
    }

@app.post("/simulate/location")
async def simulate_location_update(asset_id: int = 1, lat: float = 28.6139, lon: float = 77.2090):
    """Simulate a location update for testing"""
    location = LocationUpdate(
        asset_id=asset_id,
        latitude=lat,
        longitude=lon,
        timestamp=datetime.now(),
        source="SIMULATED"
    )
    return await analyze_asset_location(location, BackgroundTasks())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
