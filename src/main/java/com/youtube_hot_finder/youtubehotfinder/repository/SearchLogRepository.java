package com.youtube_hot_finder.youtubehotfinder.repository;

import com.youtube_hot_finder.youtubehotfinder.entity.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
    
    /**
     * 키워드로 검색 로그 조회
     */
    List<SearchLog> findBySearchKeyword(String searchKeyword);
    
    /**
     * API 키 ID로 검색 로그 조회
     */
    List<SearchLog> findByApiKeyId(Long apiKeyId);
    
    /**
     * 최근 검색 로그 조회
     */
    @Query(name = "SearchLog.findRecentSearchLogs")
    List<SearchLog> findRecentSearchLogs();
    
    /**
     * 특정 기간 내 검색 로그 조회
     */
    @Query(name = "SearchLog.findByDateRange")
    List<SearchLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * 인기 검색 키워드 조회
     */
    @Query(name = "SearchLog.findPopularSearchKeywords")
    List<Object[]> findPopularSearchKeywords();
    
    /**
     * API 키별 검색 통계
     */
    @Query(name = "SearchLog.getSearchStatsByApiKey")
    List<Object[]> getSearchStatsByApiKey();
}
