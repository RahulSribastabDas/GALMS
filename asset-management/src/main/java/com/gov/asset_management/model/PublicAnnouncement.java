package com.gov.asset_management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "public_announcements")
public class PublicAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // ALERT, INFO, NEW

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String text;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private boolean isActive = true;

    public PublicAnnouncement() {
        this.date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}