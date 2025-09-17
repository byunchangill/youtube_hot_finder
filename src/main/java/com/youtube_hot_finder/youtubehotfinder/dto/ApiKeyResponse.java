package com.youtube_hot_finder.youtubehotfinder.dto;

import java.time.LocalDateTime;

public class ApiKeyResponse {
    private Long id;
    private String name;
    private String key;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsed;
    private Integer quotaUsage;
    private Boolean isActive;

    public ApiKeyResponse() {}

    public ApiKeyResponse(Long id, String name, String key, LocalDateTime createdAt, 
                         LocalDateTime lastUsed, Integer quotaUsage, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.key = key;
        this.createdAt = createdAt;
        this.lastUsed = lastUsed;
        this.quotaUsage = quotaUsage;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastUsed() {
        return lastUsed;
    }

    public void setLastUsed(LocalDateTime lastUsed) {
        this.lastUsed = lastUsed;
    }

    public Integer getQuotaUsage() {
        return quotaUsage;
    }

    public void setQuotaUsage(Integer quotaUsage) {
        this.quotaUsage = quotaUsage;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
