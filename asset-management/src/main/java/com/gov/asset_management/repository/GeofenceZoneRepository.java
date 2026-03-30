package com.gov.asset_management.repository;

import com.gov.asset_management.model.GeofenceZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GeofenceZoneRepository extends JpaRepository<GeofenceZone, Long> {

    List<GeofenceZone> findByIsActiveTrue();

    List<GeofenceZone> findByDepartmentName(String departmentName);

    List<GeofenceZone> findByDepartmentNameAndIsActiveTrue(String departmentName);

    List<GeofenceZone> findByZoneType(String zoneType);
}
