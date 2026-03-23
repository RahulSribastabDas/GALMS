package com.gov.asset_management.repository;

import com.gov.asset_management.model.PublicAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<PublicAnnouncement, Long> {

    // THE FIX: Explicitly write the SQL/JPQL query so Spring Boot doesn't get confused by the boolean name.
    @Query("SELECT a FROM PublicAnnouncement a WHERE a.isActive = true ORDER BY a.id DESC")
    List<PublicAnnouncement> getLiveAnnouncements();

}