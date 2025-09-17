package com.youtube_hot_finder.youtubehotfinder.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "search_keyword", nullable = false, length = 200)
    private String searchKeyword;
    
    @Column(name = "search_type", length = 50)
    private String searchType;
    
    @Column(name = "max_results")
    private Integer maxResults;
    
    @Column(name = "order_by", length = 50)
    private String orderBy;
    
    @Column(name = "published_after")
    private LocalDateTime publishedAfter;
    
    @Column(name = "published_before")
    private LocalDateTime publishedBefore;
    
    @Column(name = "result_count")
    private Integer resultCount;
    
    @Column(name = "api_key_id")
    private Long apiKeyId;
    
    @Column(name = "search_duration_ms")
    private Integer searchDurationMs;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (searchType == null) searchType = "video";
        if (maxResults == null) maxResults = 10;
        if (orderBy == null) orderBy = "relevance";
        if (resultCount == null) resultCount = 0;
    }
}
