package com.gov.asset_management.config;

import com.gov.asset_management.model.*;
import com.gov.asset_management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepo,
            GeofenceZoneRepository geofenceRepo,
            AssetRepository assetRepo,
            AssetLocationLogRepository locationRepo) {
        
        return args -> {
            System.out.println("🔄 Starting DataSeeder...");
            
            // ========== 1. CREATE USERS ==========
            if (userRepo.findByUsername("amit_po").isEmpty()) {
                User amit = new User();
                amit.setUsername("amit_po");
                amit.setPassword("123456");
                amit.setRole(Role.PROCUREMENT_OFFICER);
                amit.setDepartmentName("Procurement Cell");
                amit.setIsActive(true);
                userRepo.save(amit);
                System.out.println("✅ Created User: amit_po");
            }

            if (userRepo.findByUsername("priya_head").isEmpty()) {
                User priya = new User();
                priya.setUsername("priya_head");
                priya.setPassword("123456");
                priya.setRole(Role.DEPT_HEAD);
                priya.setDepartmentName("General Administration");
                priya.setIsActive(true);
                userRepo.save(priya);
                System.out.println("✅ Created User: priya_head");
            }

            if (userRepo.findByUsername("rahul").isEmpty()) {
                User rahul = new User();
                rahul.setUsername("rahul");
                rahul.setPassword("1234");
                rahul.setRole(Role.EMPLOYEE);
                rahul.setDepartmentName("IT Dept");
                rahul.setIsActive(true);
                userRepo.save(rahul);
                System.out.println("✅ Created User: rahul");
            }

            if (userRepo.findByUsername("cag_officer").isEmpty()) {
                User cag = new User();
                cag.setUsername("cag_officer");
                cag.setPassword("123456");
                cag.setRole(Role.CAG_AUDITOR);
                cag.setDepartmentName("CAG Office");
                cag.setIsActive(true);
                userRepo.save(cag);
                System.out.println("✅ Created User: cag_officer");
            }

            // ========== 2. CREATE GEOFENCE ZONES ==========
            if (geofenceRepo.findByIsActiveTrue().isEmpty()) {
                
                GeofenceZone zone1 = new GeofenceZone();
                zone1.setZoneName("NIC Headquarters");
                zone1.setCenterLatitude(28.6139);
                zone1.setCenterLongitude(77.2090);
                zone1.setRadiusMeters(500.0);
                zone1.setZoneColor("#3B82F6");
                zone1.setDepartmentName("IT Department");
                zone1.setZoneType("PERMIT");
                zone1.setIsActive(true);
                geofenceRepo.save(zone1);
                System.out.println("✅ Created Geofence: NIC Headquarters");

                GeofenceZone zone2 = new GeofenceZone();
                zone2.setZoneName("Procurement Office");
                zone2.setCenterLatitude(28.6274);
                zone2.setCenterLongitude(77.2195);
                zone2.setRadiusMeters(300.0);
                zone2.setZoneColor("#10B981");
                zone2.setDepartmentName("Procurement Cell");
                zone2.setZoneType("PERMIT");
                zone2.setIsActive(true);
                geofenceRepo.save(zone2);
                System.out.println("✅ Created Geofence: Procurement Office");

                GeofenceZone zone3 = new GeofenceZone();
                zone3.setZoneName("Vehicle Depot - North");
                zone3.setCenterLatitude(28.6350);
                zone3.setCenterLongitude(77.2250);
                zone3.setRadiusMeters(1000.0);
                zone3.setZoneColor("#F59E0B");
                zone3.setDepartmentName("Transport Division");
                zone3.setZoneType("TRACKING");
                zone3.setIsActive(true);
                geofenceRepo.save(zone3);
                System.out.println("✅ Created Geofence: Vehicle Depot North");

                GeofenceZone zone4 = new GeofenceZone();
                zone4.setZoneName("Server Room Complex");
                zone4.setCenterLatitude(28.6100);
                zone4.setCenterLongitude(77.2050);
                zone4.setRadiusMeters(200.0);
                zone4.setZoneColor("#EF4444");
                zone4.setDepartmentName("IT Security");
                zone4.setZoneType("RESTRICTED");
                zone4.setIsActive(true);
                geofenceRepo.save(zone4);
                System.out.println("✅ Created Geofence: Server Room Complex");
            }

            // ========== 3. CREATE SAMPLE ASSETS WITH GPS DATA ==========
            if (assetRepo.count() == 0) {
                
                // Asset 1: Laptop (INSIDE geofence - Normal)
                Asset laptop = new Asset();
                laptop.setAssetName("Dell Latitude 5420 - Laptop 01");
                laptop.setAssetId("GOV-2026-00001");
                laptop.setCategory("Hardware");
                laptop.setCost(85000.0);
                laptop.setPurchaseDate(LocalDate.now().minusMonths(2));
                laptop.setStatus(AssetStatus.ASSIGNED);
                laptop.setDepartment("IT Department");
                laptop = assetRepo.save(laptop);
                System.out.println("✅ Created Asset: " + laptop.getAssetName());

                AssetLocationLog loc1 = new AssetLocationLog();
                loc1.setAssetId(laptop.getId());
                loc1.setLatitude(28.6140);
                loc1.setLongitude(77.2095);
                loc1.setSpeed(0.0);
                loc1.setTimestamp(LocalDateTime.now().minusHours(1));
                loc1.setLocationSource("GPS");
                loc1.setIsWithinGeofence(true);
                loc1.setAnomalyRiskScore(15);
                locationRepo.save(loc1);

                // Asset 2: Official Vehicle (MOVING - Normal speed)
                Asset vehicle = new Asset();
                vehicle.setAssetName("Maruti Dzire - DL-01-AB-1234");
                vehicle.setAssetId("GOV-2026-00002");
                vehicle.setCategory("Vehicle");
                vehicle.setCost(750000.0);
                vehicle.setPurchaseDate(LocalDate.now().minusYears(1));
                vehicle.setStatus(AssetStatus.ASSIGNED);
                vehicle.setDepartment("Transport Division");
                vehicle = assetRepo.save(vehicle);
                System.out.println("✅ Created Asset: " + vehicle.getAssetName());

                AssetLocationLog loc2a = new AssetLocationLog();
                loc2a.setAssetId(vehicle.getId());
                loc2a.setLatitude(28.6280);
                loc2a.setLongitude(77.2150);
                loc2a.setSpeed(35.0);
                loc2a.setTimestamp(LocalDateTime.now().minusMinutes(30));
                loc2a.setLocationSource("GPS");
                loc2a.setIsWithinGeofence(true);
                loc2a.setAnomalyRiskScore(20);
                locationRepo.save(loc2a);

                // Asset 3: Vehicle OUTSIDE geofence (TRIGGER ANOMALY!)
                AssetLocationLog loc2b = new AssetLocationLog();
                loc2b.setAssetId(vehicle.getId());
                loc2b.setLatitude(28.6500);
                loc2b.setLongitude(77.2400);
                loc2b.setSpeed(45.0);
                loc2b.setTimestamp(LocalDateTime.now());
                loc2b.setLocationSource("GPS");
                loc2b.setIsWithinGeofence(false);
                loc2b.setAnomalyRiskScore(75);
                locationRepo.save(loc2b);

                // Asset 4: High-value Equipment (Moving fast - ANOMALY)
                Asset equipment = new Asset();
                equipment.setAssetName("Survey Equipment Set - GPS Total Station");
                equipment.setAssetId("GOV-2026-00003");
                equipment.setCategory("Infrastructure");
                equipment.setCost(450000.0);
                equipment.setPurchaseDate(LocalDate.now().minusMonths(6));
                equipment.setStatus(AssetStatus.ASSIGNED);
                equipment.setDepartment("Survey Division");
                equipment = assetRepo.save(equipment);
                System.out.println("✅ Created Asset: " + equipment.getAssetName());

                AssetLocationLog loc3 = new AssetLocationLog();
                loc3.setAssetId(equipment.getId());
                loc3.setLatitude(28.5900);
                loc3.setLongitude(77.2500);
                loc3.setSpeed(120.0);
                loc3.setTimestamp(LocalDateTime.now());
                loc3.setLocationSource("GPS");
                loc3.setIsWithinGeofence(false);
                loc3.setAnomalyRiskScore(88);
                locationRepo.save(loc3);

                // Asset 5: Printer (Stationary - Normal)
                Asset printer = new Asset();
                printer.setAssetName("HP LaserJet Pro - Printer 01");
                printer.setAssetId("GOV-2026-00004");
                printer.setCategory("Hardware");
                printer.setCost(25000.0);
                printer.setPurchaseDate(LocalDate.now().minusMonths(4));
                printer.setStatus(AssetStatus.ASSIGNED);
                printer.setDepartment("General Administration");
                printer = assetRepo.save(printer);
                System.out.println("✅ Created Asset: " + printer.getAssetName());

                AssetLocationLog loc4 = new AssetLocationLog();
                loc4.setAssetId(printer.getId());
                loc4.setLatitude(28.6135);
                loc4.setLongitude(77.2088);
                loc4.setSpeed(0.0);
                loc4.setTimestamp(LocalDateTime.now().minusHours(2));
                loc4.setLocationSource("GPS");
                loc4.setIsWithinGeofence(true);
                loc4.setAnomalyRiskScore(10);
                locationRepo.save(loc4);

                // Asset 6: Server (Stationary in Server Room - Normal)
                Asset server = new Asset();
                server.setAssetName("Dell PowerEdge R740 - Server Node 1");
                server.setAssetId("GOV-2026-00005");
                server.setCategory("Infrastructure");
                server.setCost(1500000.0);
                server.setPurchaseDate(LocalDate.now().minusYears(1));
                server.setStatus(AssetStatus.ASSIGNED);
                server.setDepartment("IT Security");
                server = assetRepo.save(server);
                System.out.println("✅ Created Asset: " + server.getAssetName());

                AssetLocationLog loc5 = new AssetLocationLog();
                loc5.setAssetId(server.getId());
                loc5.setLatitude(28.6102);
                loc5.setLongitude(77.2052);
                loc5.setSpeed(0.0);
                loc5.setTimestamp(LocalDateTime.now().minusMinutes(15));
                loc5.setLocationSource("GPS");
                loc5.setIsWithinGeofence(true);
                loc5.setAnomalyRiskScore(5);
                locationRepo.save(loc5);

                System.out.println("\n🎯 GEOFENCING TEST DATA LOADED!");
                System.out.println("   - 4 Geofence Zones created");
                System.out.println("   - 6 Assets with GPS data");
                System.out.println("   - Some assets are OUTSIDE zones (will trigger alerts)");
                System.out.println("   - Some assets have HIGH SPEED (will trigger alerts)");
            } else {
                System.out.println("ℹ️ Assets already exist, skipping seed data");
            }
            
            System.out.println("✅ DataSeeder completed successfully!");
        };
    }
}
