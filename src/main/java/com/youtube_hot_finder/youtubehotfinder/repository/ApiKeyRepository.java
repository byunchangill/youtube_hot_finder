package com.youtube_hot_finder.youtubehotfinder.repository;

import com.youtube_hot_finder.youtubehotfinder.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    
    /**
     * 활성화된 API 키 목록 조회
     */
    List<ApiKey> findByIsActiveTrue();
    
    /**
     * API 키로 조회
     */
    Optional<ApiKey> findByKey(String key);
    
    /**
     * 이름으로 조회
     */
    List<ApiKey> findByNameContaining(String name);
    
    /**
     * 쿼터 사용량이 임계값 이하인 활성 API 키 조회
     */
    @Query(name = "ApiKey.findAvailableApiKeys")
    List<ApiKey> findAvailableApiKeys(@Param("threshold") Integer threshold);
    
    /**
     * 쿼터 사용량 통계 조회
     */
    @Query(name = "ApiKey.getQuotaUsageStats")
    List<Object[]> getQuotaUsageStats();
}
