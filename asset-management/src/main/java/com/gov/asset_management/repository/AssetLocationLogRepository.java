package com.gov.asset_management.repository;

import com.gov.asset_management.model.AssetLocationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetLocationLogRepository extends JpaRepository<AssetLocationLog, Long> {

    List<AssetLocationLog> findByAssetIdOrderByTimestampDesc(Long assetId);

    List<AssetLocationLog> findByAssetIdOrderByTimestampAsc(Long assetId);

    Optional<AssetLocationLog> findFirstByAssetIdOrderByTimestampDesc(Long assetId);

    List<AssetLocationLog> findByTimestampBetweenOrderByTimestampAsc(
        LocalDateTime start, LocalDateTime end);

    List<AssetLocationLog> findByAssetIdAndTimestampBetweenOrderByTimestampAsc(
        Long assetId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT l FROM AssetLocationLog l WHERE l.assetId = :assetId ORDER BY l.timestamp DESC LIMIT 1")
    Optional<AssetLocationLog> findLatestByAssetId(Long assetId);

    @Query("SELECT l FROM AssetLocationLog l WHERE l.isWithinGeofence = false ORDER BY l.timestamp DESC")
    List<AssetLocationLog> findGeofenceBreaches();

    @Query("SELECT DISTINCT l.assetId FROM AssetLocationLog l")
    List<Long> findDistinctAssetIds();

    long countByAssetId(Long assetId);
}
