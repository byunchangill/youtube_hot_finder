package com.youtube_hot_finder.youtubehotfinder.dto;

import java.util.Map;

public class SearchRequest {
    private String handle;
    private String keyword;
    private Map<String, Object> filters;

    public SearchRequest() {}

    public SearchRequest(String handle, String keyword, Map<String, Object> filters) {
        this.handle = handle;
        this.keyword = keyword;
        this.filters = filters;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public Map<String, Object> getFilters() {
        return filters;
    }

    public void setFilters(Map<String, Object> filters) {
        this.filters = filters;
    }
}
