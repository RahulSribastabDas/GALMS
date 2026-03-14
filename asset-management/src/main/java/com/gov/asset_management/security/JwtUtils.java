package com.gov.asset_management.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys; // <-- NEW IMPORT
import org.springframework.stereotype.Component;

import java.security.Key; // <-- NEW IMPORT
import java.util.Date;

@Component
public class JwtUtils {

    private final String jwtSecret = "MySuperSecretKeyForGovernmentAssetManagementSystem2026!";
    private final long jwtExpirationMs = 3600000;

    // Helper method to generate the proper Key object to stop the warnings
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // 1. Generate Token
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // <-- FIXED WARNING
                .compact();
    }

    // 2. Read Username from Token
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder() // <-- FIXED WARNING
                .setSigningKey(getSigningKey()) // <-- FIXED WARNING
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. Verify if Token is real and not expired
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder() // <-- FIXED WARNING
                    .setSigningKey(getSigningKey()) // <-- FIXED WARNING
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (Exception e) {
            System.out.println("Invalid JWT Token: " + e.getMessage());
        }
        return false;
    }
}