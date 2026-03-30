package com.gov.asset_management.repository;

import com.gov.asset_management.model.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, Long> {

    List<Anomaly> findByIsResolvedFalseOrderByTimestampDesc();

    List<Anomaly> findByAssetIdOrderByTimestampDesc(Long assetId);

    List<Anomaly> findBySeverityOrderByTimestampDesc(String severity);

    List<Anomaly> findByRiskScoreGreaterThanOrderByRiskScoreDesc(Integer minRiskScore);

    List<Anomaly> findAllByOrderByTimestampDesc();

    long countByIsResolvedFalse();

    long countBySeverity(String severity);
}
