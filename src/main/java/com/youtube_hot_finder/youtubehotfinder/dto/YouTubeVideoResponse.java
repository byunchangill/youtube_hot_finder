package com.youtube_hot_finder.youtubehotfinder.dto;

import java.time.LocalDateTime;

public class YouTubeVideoResponse {
    private String id;
    private String title;
    private String description;
    private String channelId;
    private String channelTitle;
    private String thumbnail;
    private Long viewCount;
    private Long likeCount;
    private Long commentCount;
    private LocalDateTime publishedAt;
    private String duration;
    private String language;
    private String categoryId;
    private String[] tags;
    private String privacyStatus;
    private String definition;
    private String caption;

    public YouTubeVideoResponse() {}

    public YouTubeVideoResponse(String id, String title, String description, String channelId,
                               String channelTitle, String thumbnail, Long viewCount,
                               Long likeCount, Long commentCount, LocalDateTime publishedAt,
                               String duration, String language, String categoryId,
                               String[] tags, String privacyStatus, String definition, String caption) {
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
        this.categoryId = categoryId;
        this.tags = tags;
        this.privacyStatus = privacyStatus;
        this.definition = definition;
        this.caption = caption;
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

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public String getPrivacyStatus() {
        return privacyStatus;
    }

    public void setPrivacyStatus(String privacyStatus) {
        this.privacyStatus = privacyStatus;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }
}
