package com.youtube_hot_finder.youtubehotfinder.dto;

import java.time.LocalDateTime;

public class SearchResponse {
    private String id;
    private String title;
    private String description;
    private String channelId;
    private String channelTitle;
    private String thumbnail;
    private Long viewCount;
    private Long likeCount;
    private Long commentCount;
    private Long subscriberCount;
    private Long videoCount;
    private LocalDateTime publishedAt;
    private Integer duration;
    private String language;
    private Double hotScore;
    private Integer ranking;

    public SearchResponse() {}

    public SearchResponse(String id, String title, String description, String channelId, 
                         String channelTitle, String thumbnail, Long viewCount, 
                         Long likeCount, Long commentCount, LocalDateTime publishedAt, 
                         Integer duration, String language) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.channelId = channelId;
        this.channelTitle = channelTitle;
        this.thumbnail = thumbnail;
        this.viewCount = viewCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.publishedAt = publishedAt;
        this.duration = duration;
        this.language = language;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public String getChannelTitle() {
        return channelTitle;
    }

    public void setChannelTitle(String channelTitle) {
        this.channelTitle = channelTitle;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public Long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(Long likeCount) {
        this.likeCount = likeCount;
    }

    public Long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(Long commentCount) {
        this.commentCount = commentCount;
    }

    public Long getSubscriberCount() {
        return subscriberCount;
    }

    public void setSubscriberCount(Long subscriberCount) {
        this.subscriberCount = subscriberCount;
    }

    public Long getVideoCount() {
        return videoCount;
    }

    public void setVideoCount(Long videoCount) {
        this.videoCount = videoCount;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Double getHotScore() {
        return hotScore;
    }

    public void setHotScore(Double hotScore) {
        this.hotScore = hotScore;
    }

    public Integer getRanking() {
        return ranking;
    }

    public void setRanking(Integer ranking) {
        this.ranking = ranking;
    }
}
