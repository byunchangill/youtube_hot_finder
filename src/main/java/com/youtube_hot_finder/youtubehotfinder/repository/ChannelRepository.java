package com.youtube_hot_finder.youtubehotfinder.repository;

import com.youtube_hot_finder.youtubehotfinder.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {
    
    /**
     * 채널 ID로 조회
     */
    Optional<Channel> findByChannelId(String channelId);
    
    /**
     * 제목으로 검색
     */
    List<Channel> findByTitleContaining(String title);
    
    /**
     * 구독자 수 기준 상위 채널 조회
     */
    @Query("SELECT c FROM Channel c ORDER BY c.subscriberCount DESC")
    List<Channel> findTopChannelsBySubscribers();
    
    /**
     * 최근 업데이트된 채널 조회
     */
    @Query("SELECT c FROM Channel c ORDER BY c.updatedAt DESC")
    List<Channel> findRecentlyUpdatedChannels();
    
    /**
     * 구독자 수 범위로 채널 조회
     */
    @Query("SELECT c FROM Channel c WHERE c.subscriberCount BETWEEN :min AND :max ORDER BY c.subscriberCount DESC")
    List<Channel> findBySubscriberCountRange(@Param("min") Long min, @Param("max") Long max);
}
