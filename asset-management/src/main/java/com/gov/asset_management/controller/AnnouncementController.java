package com.gov.asset_management.controller;

import com.gov.asset_management.model.PublicAnnouncement;
import com.gov.asset_management.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
// THE FIX: Forcefully allow CORS on this specific controller, allowing all headers
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping("/public")
    public List<PublicAnnouncement> getActiveAnnouncements() {
        // Call the new bulletproof query
        return announcementRepository.getLiveAnnouncements();
    }
}