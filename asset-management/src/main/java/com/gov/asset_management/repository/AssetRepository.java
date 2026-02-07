package com.gov.asset_management.repository;

import com.gov.asset_management.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    /**
     * Finds an asset by its Government-assigned String ID (e.g., GOV-2026-105).
     * This is used for tracking and displaying in the Stock Register.
     */
    Optional<Asset> findByAssetId(String assetId);
}