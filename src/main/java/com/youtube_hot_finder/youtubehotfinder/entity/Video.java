package com.youtube_hot_finder.youtubehotfinder.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "video_id", nullable = false, length = 100, unique = true)
    private String videoId;
    
    @Column(name = "channel_id", nullable = false, length = 100)
    private String channelId;
    
    @Column(name = "title", nullable = false, length = 300)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "duration", length = 20)
    private String duration;
    
    @Column(name = "view_count")
    private Long viewCount;
    
    @Column(name = "like_count")
    private Integer likeCount;
    
    @Column(name = "comment_count")
    private Integer commentCount;
    
    @Column(name = "category_id")
    private Integer categoryId;
    
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (viewCount == null) viewCount = 0L;
        if (likeCount == null) likeCount = 0;
        if (commentCount == null) commentCount = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
