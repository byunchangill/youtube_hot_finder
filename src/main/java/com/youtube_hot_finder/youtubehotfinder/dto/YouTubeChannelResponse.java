package com.youtube_hot_finder.youtubehotfinder.dto;

import java.time.LocalDateTime;

public class YouTubeChannelResponse {
    private String id;
    private String title;
    private String description;
    private String customUrl;
    private String country;
    private String language;
    private String thumbnail;
    private Long subscriberCount;
    private Long videoCount;
    private Long viewCount;
    private LocalDateTime publishedAt;
    private String channelType;

    public YouTubeChannelResponse() {}

    public YouTubeChannelResponse(String id, String title, String description, String customUrl,
                                 String country, String language, String thumbnail,
                                 Long subscriberCount, Long videoCount, Long viewCount,
                                 LocalDateTime publishedAt, String channelType) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.customUrl = customUrl;
        this.country = country;
        this.language = language;
        this.thumbnail = thumbnail;
        this.subscriberCount = subscriberCount;
        this.videoCount = videoCount;
        this.viewCount = viewCount;
        this.publishedAt = publishedAt;
        this.channelType = channelType;
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

    public String getCustomUrl() {
        return customUrl;
    }

    public void setCustomUrl(String customUrl) {
        this.customUrl = customUrl;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
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

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getChannelType() {
        return channelType;
    }

    public void setChannelType(String channelType) {
        this.channelType = channelType;
    }
}
