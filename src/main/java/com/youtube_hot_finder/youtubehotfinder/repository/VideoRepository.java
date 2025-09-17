package com.youtube_hot_finder.youtubehotfinder.repository;

import com.youtube_hot_finder.youtubehotfinder.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    
    /**
     * 비디오 ID로 조회
     */
    Optional<Video> findByVideoId(String videoId);
    
    /**
     * 채널 ID로 비디오 목록 조회
     */
    List<Video> findByChannelId(String channelId);
    
    /**
     * 제목으로 검색
     */
    List<Video> findByTitleContaining(String title);
    
    /**
     * 조회수 기준 인기 비디오 조회
     */
    @Query(name = "Video.findPopularVideos")
    List<Video> findPopularVideos();
    
    /**
     * 최근 게시된 비디오 조회
     */
    @Query(name = "Video.findRecentVideos")
    List<Video> findRecentVideos();
    
    /**
     * 특정 기간 내 게시된 비디오 조회
     */
    @Query(name = "Video.findVideosByDateRange")
    List<Video> findVideosByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * 조회수 범위로 비디오 조회
     */
    @Query(name = "Video.findByViewCountRange")
    List<Video> findByViewCountRange(@Param("minViews") Long minViews, @Param("maxViews") Long maxViews);
    
    /**
     * 카테고리별 비디오 조회
     */
    List<Video> findByCategoryId(Integer categoryId);
    
    /**
     * 인기 비디오 (최근 30일, 조회수 기준)
     */
    @Query(name = "Video.findPopularVideosSince")
    List<Video> findPopularVideosSince(@Param("date") LocalDateTime date);
}
