package com.gov.asset_management.repository;

import com.gov.asset_management.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findByAssetId(String assetId);

    Optional<Asset> findByProcurementTrackingId(String procurementTrackingId);

    List<Asset> findByDepartment(String department);
}