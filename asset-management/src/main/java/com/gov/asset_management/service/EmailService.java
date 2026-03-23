package com.gov.asset_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // --- 1. SENDS THE OTP FOR LOGIN ---
    public void sendOtpEmail(String toEmail, String username, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@galms.gov.in");
        message.setTo(toEmail);
        message.setSubject("CONFIDENTIAL: Official Login OTP - GALMS Portal");

        String emailBody = "Dear " + username + ",\n\n"
                + "This is an official communication from the GALMS Portal.\n\n"
                + "Your highly secure One-Time Password (OTP) for login is: " + otp + "\n\n"
                + "SECURITY ADVISORY:\n"
                + "1. This OTP is valid for a single use.\n"
                + "2. Do not share this code with any unauthorized personnel.\n\n"
                + "By Order of the Administrator,\n"
                + "Government Asset Lifecycle Management System";

        message.setText(emailBody);
        mailSender.send(message);
    }

    // --- 2. SENDS THE CREDENTIALS WHEN ACCOUNT IS CREATED ---
    public void sendWelcomeEmail(String toEmail, String username, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@galms.gov.in");
        message.setTo(toEmail);
        message.setSubject("CONFIDENTIAL: Official Credentials Issued - GALMS Portal");

        String emailBody = "Dear Official,\n\n"
                + "This is an official communication from the Government Asset Lifecycle Management System.\n\n"
                + "We are pleased to inform you that your registration as an authorized official has been successfully verified and approved.\n\n"
                + "Below are your highly secure login credentials:\n"
                + "-------------------------------------------------\n"
                + "Official User ID : " + username + "\n"
                + "System Password  : " + tempPassword + "\n"
                + "-------------------------------------------------\n\n"
                + "SECURITY ADVISORY:\n"
                + "1. Please log in to the official portal at your earliest convenience.\n"
                + "2. You are strictly required to change this temporary system-generated password upon your first login.\n"
                + "3. Do not share these credentials with any unauthorized personnel.\n\n"
                + "By Order of the Administrator,\n"
                + "Government of India";

        message.setText(emailBody);
        mailSender.send(message);
    }
}