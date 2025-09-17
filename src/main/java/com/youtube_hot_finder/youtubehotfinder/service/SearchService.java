package com.youtube_hot_finder.youtubehotfinder.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.youtube_hot_finder.youtubehotfinder.dto.SearchResponse;
import com.youtube_hot_finder.youtubehotfinder.exception.ApiKeyException;
import com.youtube_hot_finder.youtubehotfinder.exception.QuotaExceededException;
import com.youtube_hot_finder.youtubehotfinder.util.YouTubeApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.apache.hc.core5.http.ParseException;

@Service
public class SearchService {

    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    @Autowired
    private YouTubeApiClient youTubeApiClient;

    /**
     * 채널 검색
     */
    public List<SearchResponse> searchChannel(String handle) {
        try {
            logger.info("채널 검색 시작: {}", handle);
            
            Map<String, String> params = youTubeApiClient.createChannelSearchParams(handle, 10);
            JsonNode response = youTubeApiClient.executeRequest("search", params);
            
            List<SearchResponse> results = new ArrayList<>();
            JsonNode items = response.get("items");
            
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    JsonNode snippet = item.get("snippet");
                    if (snippet != null) {
                        String channelId = item.get("id").get("channelId").asText();
                        
                        SearchResponse searchResponse = new SearchResponse();
                        searchResponse.setId(channelId);
                        searchResponse.setTitle(snippet.get("title").asText());
                        searchResponse.setDescription(snippet.get("description").asText());
                        searchResponse.setChannelId(channelId);
                        searchResponse.setChannelTitle(snippet.get("title").asText());
                        
                        JsonNode thumbnails = snippet.get("thumbnails");
                        if (thumbnails != null && thumbnails.has("medium")) {
                            searchResponse.setThumbnail(thumbnails.get("medium").get("url").asText());
                        }
                        
                        String publishedAtStr = snippet.get("publishedAt").asText();
                        searchResponse.setPublishedAt(LocalDateTime.parse(publishedAtStr, DATE_FORMATTER));
                        
                        // 채널 상세 정보 가져오기 (통계 정보 포함)
                        try {
                            Map<String, String> channelParams = youTubeApiClient.createChannelDetailsParams(channelId);
                            JsonNode channelResponse = youTubeApiClient.executeRequest("channels", channelParams);
                            JsonNode channelItems = channelResponse.get("items");
                            
                            if (channelItems != null && channelItems.isArray() && channelItems.size() > 0) {
                                JsonNode channel = channelItems.get(0);
                                JsonNode statistics = channel.get("statistics");
                                
                                if (statistics != null) {
                                    searchResponse.setViewCount(statistics.get("viewCount").asLong());
                                    searchResponse.setSubscriberCount(statistics.get("subscriberCount").asLong());
                                    searchResponse.setVideoCount(statistics.get("videoCount").asLong());
                                }
                            }
                        } catch (Exception e) {
                            logger.warn("채널 {} 상세 정보 가져오기 실패: {}", channelId, e.getMessage());
                            // 통계 정보가 없어도 기본 정보는 유지
                        }
                        
                        results.add(searchResponse);
                    }
                }
            }
            
            logger.info("채널 검색 완료: {} 개 결과", results.size());
            return results;
            
        } catch (ApiKeyException e) {
            logger.error("API 키 오류: {}", e.getMessage());
            throw new RuntimeException("API 키 오류: " + e.getMessage(), e);
        } catch (QuotaExceededException e) {
            logger.error("쿼터 초과 오류: {}", e.getMessage());
            throw new RuntimeException("API 쿼터 초과: " + e.getMessage(), e);
        } catch (IOException | ParseException e) {
            logger.error("채널 검색 중 오류 발생: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * API 키 유효성 검증
     */
    public boolean validateApiKey() {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("part", "snippet");
            params.put("q", "test");
            params.put("maxResults", "1");
            
            logger.info("API 키 유효성 검증 시작...");
            JsonNode response = youTubeApiClient.executeRequest("search", params);
            
            if (response.has("error")) {
                logger.error("API 키 검증 실패: {}", response.get("error").toString());
                return false;
            } else {
                logger.info("API 키 검증 성공");
                return true;
            }
        } catch (Exception e) {
            logger.error("API 키 검증 중 오류: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 키워드 검색
     */
    public List<SearchResponse> searchKeyword(String keyword, Map<String, Object> filters) {
        try {
            logger.info("키워드 검색 시작: '{}'", keyword);
            logger.info("키워드 길이: {}", keyword != null ? keyword.length() : "null");
            logger.info("키워드 바이트: {}", keyword != null ? keyword.getBytes(StandardCharsets.UTF_8).length : "null");
            logger.info("필터 설정: {}", filters);
            
            // YouTube API 호출
            String order = filters != null ? (String) filters.get("order") : "relevance";
            int maxResults = filters != null ? (Integer) filters.getOrDefault("maxResults", 10) : 10;
            String regionCode = filters != null ? (String) filters.get("regionCode") : "KR";
            String relevanceLanguage = filters != null ? (String) filters.get("relevanceLanguage") : "ko";
            
            logger.info("검색 파라미터 - order: {}, maxResults: {}, regionCode: {}, relevanceLanguage: {}", 
                       order, maxResults, regionCode, relevanceLanguage);
            
            Map<String, String> params = youTubeApiClient.createVideoSearchParams(keyword, maxResults, order);
            
            // 추가 파라미터 설정
            if (regionCode != null && !regionCode.isEmpty()) {
                params.put("regionCode", regionCode);
            }
            if (relevanceLanguage != null && !relevanceLanguage.isEmpty()) {
                params.put("relevanceLanguage", relevanceLanguage);
            }
            
            logger.info("YouTube API 파라미터: {}", params);
            logger.info("YouTube API 호출 시작...");
            
            JsonNode response = youTubeApiClient.executeRequest("search", params);
            logger.info("YouTube API 호출 완료");
            logger.info("YouTube API 응답 상태: {}", response.has("error") ? "오류" : "성공");
            
            if (response.has("error")) {
                JsonNode error = response.get("error");
                logger.error("YouTube API 오류 발생:");
                logger.error("  - 오류 코드: {}", error.has("code") ? error.get("code").asInt() : "N/A");
                logger.error("  - 오류 메시지: {}", error.has("message") ? error.get("message").asText() : "N/A");
                if (error.has("errors")) {
                    JsonNode errors = error.get("errors");
                    for (JsonNode err : errors) {
                        logger.error("  - 세부 오류: domain={}, reason={}, message={}", 
                            err.has("domain") ? err.get("domain").asText() : "N/A",
                            err.has("reason") ? err.get("reason").asText() : "N/A",
                            err.has("message") ? err.get("message").asText() : "N/A");
                    }
                }
                throw new RuntimeException("YouTube API 오류: " + error.toString());
            } else {
                logger.info("YouTube API 성공 응답:");
                logger.info("  - kind: {}", response.has("kind") ? response.get("kind").asText() : "N/A");
                logger.info("  - etag: {}", response.has("etag") ? response.get("etag").asText() : "N/A");
                if (response.has("pageInfo")) {
                    JsonNode pageInfo = response.get("pageInfo");
                    logger.info("  - totalResults: {}", pageInfo.has("totalResults") ? pageInfo.get("totalResults").asInt() : "N/A");
                    logger.info("  - resultsPerPage: {}", pageInfo.has("resultsPerPage") ? pageInfo.get("resultsPerPage").asInt() : "N/A");
                }
                logger.debug("전체 응답: {}", response.toString());
            }
            
            List<SearchResponse> results = new ArrayList<>();
            JsonNode items = response.get("items");
            logger.info("검색 결과 아이템 수: {}", items != null ? items.size() : 0);
            
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    JsonNode snippet = item.get("snippet");
                    if (snippet != null) {
                        SearchResponse searchResponse = new SearchResponse();
                        searchResponse.setId(item.get("id").get("videoId").asText());
                        searchResponse.setTitle(snippet.get("title").asText());
                        searchResponse.setDescription(snippet.get("description").asText());
                        searchResponse.setChannelId(snippet.get("channelId").asText());
                        searchResponse.setChannelTitle(snippet.get("channelTitle").asText());
                        
                        JsonNode thumbnails = snippet.get("thumbnails");
                        if (thumbnails != null && thumbnails.has("medium")) {
                            searchResponse.setThumbnail(thumbnails.get("medium").get("url").asText());
                        }
                        
                        String publishedAtStr = snippet.get("publishedAt").asText();
                        searchResponse.setPublishedAt(LocalDateTime.parse(publishedAtStr, DATE_FORMATTER));
                        
                        // 비디오 상세 정보 가져오기
                        enrichVideoDetails(searchResponse);
                        
                        results.add(searchResponse);
                    }
                }
            }
            
            // 필터링 적용
            results = applyFilters(results, filters);
            
            logger.info("키워드 검색 완료: {} 개 결과", results.size());
            return results;
            
        } catch (ApiKeyException e) {
            logger.error("API 키 오류: {}", e.getMessage());
            throw new RuntimeException("API 키 오류: " + e.getMessage(), e);
        } catch (QuotaExceededException e) {
            logger.error("쿼터 초과 오류: {}", e.getMessage());
            throw new RuntimeException("API 쿼터 초과: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("키워드 검색 중 오류 발생: {}", e.getMessage(), e);
            logger.error("오류 스택 트레이스:", e);
            
            // 오류 유형별 상세 로그
            if (e.getMessage() != null) {
                if (e.getMessage().contains("quota")) {
                    logger.error("YouTube API 할당량 초과 오류");
                } else if (e.getMessage().contains("API key")) {
                    logger.error("YouTube API 키 오류");
                } else if (e.getMessage().contains("network") || e.getMessage().contains("connection")) {
                    logger.error("네트워크 연결 오류");
                } else {
                    logger.error("기타 오류: {}", e.getClass().getSimpleName());
                }
            }
            
            // 오류 시 빈 결과 반환
            logger.warn("오류로 인해 빈 결과 반환: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 채널 분석
     */
    public Map<String, Object> analyzeChannel(String channelId) {
        try {
            logger.info("채널 분석 시작: {}", channelId);
            
            Map<String, String> params = youTubeApiClient.createChannelDetailsParams(channelId);
            JsonNode response = youTubeApiClient.executeRequest("channels", params);
            
            Map<String, Object> analysis = new HashMap<>();
            JsonNode items = response.get("items");
            
            if (items != null && items.isArray() && items.size() > 0) {
                JsonNode channel = items.get(0);
                JsonNode snippet = channel.get("snippet");
                JsonNode statistics = channel.get("statistics");
                
                if (snippet != null) {
                    analysis.put("title", snippet.get("title").asText());
                    analysis.put("description", snippet.get("description").asText());
                    analysis.put("country", snippet.get("country").asText());
                    analysis.put("publishedAt", snippet.get("publishedAt").asText());
                    
                    JsonNode thumbnails = snippet.get("thumbnails");
                    if (thumbnails != null && thumbnails.has("high")) {
                        analysis.put("thumbnail", thumbnails.get("high").get("url").asText());
                    }
                }
                
                if (statistics != null) {
                    analysis.put("subscriberCount", statistics.get("subscriberCount").asLong());
                    analysis.put("videoCount", statistics.get("videoCount").asLong());
                    analysis.put("viewCount", statistics.get("viewCount").asLong());
                }
            }
            
            logger.info("채널 분석 완료: {}", channelId);
            return analysis;
            
        } catch (ApiKeyException e) {
            logger.error("API 키 오류: {}", e.getMessage());
            throw new RuntimeException("API 키 오류: " + e.getMessage(), e);
        } catch (QuotaExceededException e) {
            logger.error("쿼터 초과 오류: {}", e.getMessage());
            throw new RuntimeException("API 쿼터 초과: " + e.getMessage(), e);
        } catch (IOException | ParseException e) {
            logger.error("채널 분석 중 오류 발생: {}", e.getMessage(), e);
            return Collections.emptyMap();
        }
    }

    /**
     * 트렌딩 영상 가져오기
     */
    public List<SearchResponse> getTrendingVideos(String country, String category) {
        try {
            logger.info("트렌딩 영상 가져오기 시작: country={}, category={}", country, category);
            
            Map<String, String> params = youTubeApiClient.createTrendingParams(country, category, 25);
            JsonNode response = youTubeApiClient.executeRequest("videos", params);
            
            List<SearchResponse> results = new ArrayList<>();
            JsonNode items = response.get("items");
            
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    SearchResponse searchResponse = convertVideoToSearchResponse(item);
                    if (searchResponse != null) {
                        results.add(searchResponse);
                    }
                }
            }
            
            logger.info("트렌딩 영상 가져오기 완료: {} 개 결과", results.size());
            return results;
            
        } catch (ApiKeyException e) {
            logger.error("API 키 오류: {}", e.getMessage());
            throw new RuntimeException("API 키 오류: " + e.getMessage(), e);
        } catch (QuotaExceededException e) {
            logger.error("쿼터 초과 오류: {}", e.getMessage());
            throw new RuntimeException("API 쿼터 초과: " + e.getMessage(), e);
        } catch (IOException | ParseException e) {
            logger.error("트렌딩 영상 가져오기 중 오류 발생: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 인기 영상 가져오기
     */
    public List<SearchResponse> getPopularVideos(Map<String, Object> filters) {
        try {
            logger.info("인기 영상 가져오기 시작");
            
            String country = filters != null ? (String) filters.get("country") : "KR";
            String category = filters != null ? (String) filters.get("category") : null;
            int maxResults = filters != null ? (Integer) filters.getOrDefault("maxResults", 25) : 25;
            
            Map<String, String> params = youTubeApiClient.createTrendingParams(country, category, maxResults);
            JsonNode response = youTubeApiClient.executeRequest("videos", params);
            
            List<SearchResponse> results = new ArrayList<>();
            JsonNode items = response.get("items");
            
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    SearchResponse searchResponse = convertVideoToSearchResponse(item);
                    if (searchResponse != null) {
                        // 인기도 점수 계산
                        calculateHotScore(searchResponse);
                        results.add(searchResponse);
                    }
                }
            }
            
            // 인기도 점수로 정렬
            results.sort((a, b) -> Double.compare(
                b.getHotScore() != null ? b.getHotScore() : 0.0,
                a.getHotScore() != null ? a.getHotScore() : 0.0
            ));
            
            // 순위 설정
            for (int i = 0; i < results.size(); i++) {
                results.get(i).setRanking(i + 1);
            }
            
            logger.info("인기 영상 가져오기 완료: {} 개 결과", results.size());
            return results;
            
        } catch (ApiKeyException e) {
            logger.error("API 키 오류: {}", e.getMessage());
            throw new RuntimeException("API 키 오류: " + e.getMessage(), e);
        } catch (QuotaExceededException e) {
            logger.error("쿼터 초과 오류: {}", e.getMessage());
            throw new RuntimeException("API 쿼터 초과: " + e.getMessage(), e);
        } catch (IOException | ParseException e) {
            logger.error("인기 영상 가져오기 중 오류 발생: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 영상 상세 정보 가져오기
     */
    public SearchResponse getVideoDetails(String videoId) {
        try {
            logger.info("영상 상세 정보 가져오기 시작: {}", videoId);
            
            Map<String, String> params = youTubeApiClient.createVideoDetailsParams(videoId);
            JsonNode response = youTubeApiClient.executeRequest("videos", params);
            
            JsonNode items = response.get("items");
            if (items != null && items.isArray() && items.size() > 0) {
                SearchResponse searchResponse = convertVideoToSearchResponse(items.get(0));
                logger.info("영상 상세 정보 가져오기 완료: {}", videoId);
                return searchResponse;
            }
            
            return new SearchResponse();
            
        } catch (ApiKeyException e) {
            logger.error("API 키 오류: {}", e.getMessage());
            throw new RuntimeException("API 키 오류: " + e.getMessage(), e);
        } catch (QuotaExceededException e) {
            logger.error("쿼터 초과 오류: {}", e.getMessage());
            throw new RuntimeException("API 쿼터 초과: " + e.getMessage(), e);
        } catch (IOException | ParseException e) {
            logger.error("영상 상세 정보 가져오기 중 오류 발생: {}", e.getMessage(), e);
            return new SearchResponse();
        }
    }

    /**
     * 검색 제안 가져오기
     */
    public List<String> getSearchSuggestions(String query) {
        try {
            logger.info("검색 제안 가져오기 시작: {}", query);
            
            Map<String, String> params = new HashMap<>();
            params.put("part", "snippet");
            params.put("type", "video");
            params.put("q", query);
            params.put("maxResults", "5");
            
            JsonNode response = youTubeApiClient.executeRequest("search", params);
            List<String> suggestions = new ArrayList<>();
            
            JsonNode items = response.get("items");
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    JsonNode snippet = item.get("snippet");
                    if (snippet != null) {
                        suggestions.add(snippet.get("title").asText());
                    }
                }
            }
            
            logger.info("검색 제안 가져오기 완료: {} 개 제안", suggestions.size());
            return suggestions;
            
        } catch (ApiKeyException e) {
            logger.error("API 키 오류: {}", e.getMessage());
            throw new RuntimeException("API 키 오류: " + e.getMessage(), e);
        } catch (QuotaExceededException e) {
            logger.error("쿼터 초과 오류: {}", e.getMessage());
            throw new RuntimeException("API 쿼터 초과: " + e.getMessage(), e);
        } catch (IOException | ParseException e) {
            logger.error("검색 제안 가져오기 중 오류 발생: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * 검색 통계 가져오기
     */
    public Map<String, Object> getSearchStats() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalSearches", 0);
        response.put("totalResults", 0);
        response.put("lastSearch", null);
        response.put("apiStatus", "active");
        response.put("quotaUsage", 0);
        return response;
    }


    /**
     * 검색 결과에 필터 적용
     */
    private List<SearchResponse> applyFilters(List<SearchResponse> results, Map<String, Object> filters) {
        if (filters == null || results.isEmpty()) {
            return results;
        }
        
        List<SearchResponse> filteredResults = new ArrayList<>();
        
        logger.info("필터 적용 시작 - 원본 결과: {} 개", results.size());
        logger.info("적용할 필터: {}", filters);
        
        for (SearchResponse result : results) {
            boolean passesFilter = true;
            List<String> filterReasons = new ArrayList<>();
            
            logger.debug("=== 비디오 검사 시작 ===");
            logger.debug("제목: {}", result.getTitle());
            logger.debug("조회수: {}", result.getViewCount());
            logger.debug("업로드일: {}", result.getPublishedAt());
            logger.debug("재생시간: {}초", result.getDuration());
            logger.debug("채널: {}", result.getChannelTitle());
            
            // 최소 조회수 필터
            Integer minViews = (Integer) filters.get("minViews");
            if (minViews != null && result.getViewCount() != null) {
                if (result.getViewCount() >= minViews) {
                    logger.debug("✅ 조회수 필터 통과: {} >= {}", result.getViewCount(), minViews);
                } else {
                    passesFilter = false;
                    String reason = "조회수 부족 (" + result.getViewCount() + " < " + minViews + ")";
                    filterReasons.add(reason);
                    logger.debug("❌ 조회수 필터 실패: {}", reason);
                }
            } else {
                logger.debug("⚠️ 조회수 필터 스킵: minViews={}, viewCount={}", minViews, result.getViewCount());
            }
            
            // 시간당 조회수 필터
            Integer minViewsPerHour = (Integer) filters.get("minViewsPerHour");
            if (minViewsPerHour != null && result.getViewCount() != null && result.getPublishedAt() != null) {
                try {
                    long hoursSincePublished = java.time.Duration.between(result.getPublishedAt(), LocalDateTime.now()).toHours();
                    logger.debug("업로드 후 경과 시간: {} 시간", hoursSincePublished);
                    if (hoursSincePublished > 0) {
                        long viewsPerHour = result.getViewCount() / hoursSincePublished;
                        logger.debug("시간당 조회수: {} (필요: {})", viewsPerHour, minViewsPerHour);
                        if (viewsPerHour >= minViewsPerHour) {
                            logger.debug("✅ 시간당 조회수 필터 통과: {} >= {}", viewsPerHour, minViewsPerHour);
                        } else {
                            passesFilter = false;
                            String reason = "시간당 조회수 부족 (" + viewsPerHour + " < " + minViewsPerHour + ")";
                            filterReasons.add(reason);
                            logger.debug("❌ 시간당 조회수 필터 실패: {}", reason);
                        }
                    } else {
                        logger.debug("⚠️ 시간당 조회수 필터 스킵: 업로드 시간이 0시간");
                    }
                } catch (Exception e) {
                    logger.warn("시간당 조회수 계산 중 오류: {}", e.getMessage());
                }
            } else {
                logger.debug("⚠️ 시간당 조회수 필터 스킵: minViewsPerHour={}, viewCount={}, publishedAt={}", 
                    minViewsPerHour, result.getViewCount(), result.getPublishedAt());
            }
            
            // 비디오 타입 필터 (쇼츠/일반)
            String videoType = (String) filters.get("videoType");
            Integer shortsDuration = (Integer) filters.get("shortsDuration");
            if (videoType != null && shortsDuration != null && result.getDuration() != null) {
                logger.debug("비디오 타입 필터: videoType={}, shortsDuration={}, duration={}", 
                    videoType, shortsDuration, result.getDuration());
                
                if ("shorts".equals(videoType)) {
                    if (result.getDuration() <= shortsDuration) {
                        logger.debug("✅ 쇼츠 필터 통과: {} <= {}", result.getDuration(), shortsDuration);
                    } else {
                        passesFilter = false;
                        String reason = "쇼츠 필터 실패 (재생시간 " + result.getDuration() + "초 > " + shortsDuration + "초)";
                        filterReasons.add(reason);
                        logger.debug("❌ 쇼츠 필터 실패: {}", reason);
                    }
                } else if ("normal".equals(videoType)) {
                    if (result.getDuration() > shortsDuration) {
                        logger.debug("✅ 일반 비디오 필터 통과: {} > {}", result.getDuration(), shortsDuration);
                    } else {
                        passesFilter = false;
                        String reason = "일반 비디오 필터 실패 (재생시간 " + result.getDuration() + "초 <= " + shortsDuration + "초)";
                        filterReasons.add(reason);
                        logger.debug("❌ 일반 비디오 필터 실패: {}", reason);
                    }
                } else if ("both".equals(videoType)) {
                    logger.debug("✅ 비디오 타입 필터 통과: 'both' 선택으로 모든 타입 허용");
                }
            } else {
                logger.debug("⚠️ 비디오 타입 필터 스킵: videoType={}, shortsDuration={}, duration={}", 
                    videoType, shortsDuration, result.getDuration());
            }
            
            // 언어 필터
            String language = (String) filters.get("language");
            if (language != null && result.getLanguage() != null) {
                if (language.equals(result.getLanguage())) {
                    logger.debug("✅ 언어 필터 통과: {} = {}", result.getLanguage(), language);
                } else {
                    passesFilter = false;
                    String reason = "언어 필터 실패 (" + result.getLanguage() + " != " + language + ")";
                    filterReasons.add(reason);
                    logger.debug("❌ 언어 필터 실패: {}", reason);
                }
            } else {
                logger.debug("⚠️ 언어 필터 스킵: language={}, result.language={}", language, result.getLanguage());
            }
            
            // 국가 필터 (현재 SearchResponse에 country 필드가 없으므로 스킵)
            String country = (String) filters.get("country");
            if (country != null) {
                logger.debug("⚠️ 국가 필터 스킵: SearchResponse에 country 필드가 없음 (요청된 국가: {})", country);
            }
            
            // 최종 결과
            if (passesFilter) {
                filteredResults.add(result);
                logger.debug("✅ 최종 결과: 통과 - {}", result.getTitle());
            } else {
                String allReasons = String.join(", ", filterReasons);
                logger.debug("❌ 최종 결과: 제외 - {} - 이유: {}", result.getTitle(), allReasons);
            }
            
            logger.debug("=== 비디오 검사 완료 ===\n");
        }
        
        logger.info("필터 적용 후 결과: {} 개 (원본: {} 개)", filteredResults.size(), results.size());
        return filteredResults;
    }


    /**
     * 비디오 상세 정보로 SearchResponse 보강
     */
    private void enrichVideoDetails(SearchResponse searchResponse) {
        try {
            Map<String, String> params = youTubeApiClient.createVideoDetailsParams(searchResponse.getId());
            JsonNode response = youTubeApiClient.executeRequest("videos", params);
            
            JsonNode items = response.get("items");
            if (items != null && items.isArray() && items.size() > 0) {
                JsonNode video = items.get(0);
                JsonNode statistics = video.get("statistics");
                JsonNode contentDetails = video.get("contentDetails");
                
                if (statistics != null) {
                    JsonNode viewCount = statistics.get("viewCount");
                    JsonNode likeCount = statistics.get("likeCount");
                    JsonNode commentCount = statistics.get("commentCount");
                    
                    if (viewCount != null) {
                        searchResponse.setViewCount(viewCount.asLong());
                    }
                    if (likeCount != null) {
                        searchResponse.setLikeCount(likeCount.asLong());
                    }
                    if (commentCount != null) {
                        searchResponse.setCommentCount(commentCount.asLong());
                    }
                }
                
                if (contentDetails != null) {
                    String duration = contentDetails.get("duration").asText();
                    searchResponse.setDuration(parseDuration(duration));
                }
            }
        } catch (ApiKeyException e) {
            logger.warn("API 키 오류로 비디오 상세 정보 보강 실패: {}", e.getMessage());
        } catch (QuotaExceededException e) {
            logger.warn("쿼터 초과로 비디오 상세 정보 보강 실패: {}", e.getMessage());
        } catch (IOException | ParseException e) {
            logger.warn("비디오 상세 정보 보강 중 오류: {}", e.getMessage());
        }
    }

    /**
     * YouTube API 응답을 SearchResponse로 변환
     */
    private SearchResponse convertVideoToSearchResponse(JsonNode video) {
        try {
            SearchResponse searchResponse = new SearchResponse();
            JsonNode snippet = video.get("snippet");
            JsonNode statistics = video.get("statistics");
            JsonNode contentDetails = video.get("contentDetails");
            
            if (snippet != null) {
                searchResponse.setId(video.get("id").asText());
                searchResponse.setTitle(snippet.get("title").asText());
                searchResponse.setDescription(snippet.get("description").asText());
                searchResponse.setChannelId(snippet.get("channelId").asText());
                searchResponse.setChannelTitle(snippet.get("channelTitle").asText());
                
                JsonNode thumbnails = snippet.get("thumbnails");
                if (thumbnails != null && thumbnails.has("medium")) {
                    searchResponse.setThumbnail(thumbnails.get("medium").get("url").asText());
                }
                
                String publishedAtStr = snippet.get("publishedAt").asText();
                searchResponse.setPublishedAt(LocalDateTime.parse(publishedAtStr, DATE_FORMATTER));
            }
            
            if (statistics != null) {
                searchResponse.setViewCount(statistics.get("viewCount").asLong());
                searchResponse.setLikeCount(statistics.get("likeCount").asLong());
                searchResponse.setCommentCount(statistics.get("commentCount").asLong());
            }
            
            if (contentDetails != null) {
                String duration = contentDetails.get("duration").asText();
                searchResponse.setDuration(parseDuration(duration));
            }
            
            return searchResponse;
        } catch (Exception e) {
            logger.error("비디오 변환 중 오류: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * 인기도 점수 계산
     */
    private void calculateHotScore(SearchResponse video) {
        if (video.getViewCount() == null || video.getLikeCount() == null || video.getPublishedAt() == null) {
            video.setHotScore(0.0);
            return;
        }
        
        long views = video.getViewCount();
        long likes = video.getLikeCount();
        long comments = video.getCommentCount() != null ? video.getCommentCount() : 0;
        
        // 시간 가중치 (최근일수록 높은 점수)
        long hoursSincePublished = java.time.Duration.between(video.getPublishedAt(), LocalDateTime.now()).toHours();
        double timeWeight = Math.max(0.1, 1.0 / (1.0 + hoursSincePublished / 24.0));
        
        // 조회수, 좋아요, 댓글 수를 기반으로 한 점수
        double engagementScore = (likes * 2 + comments * 3) / Math.max(views, 1);
        
        // 최종 인기도 점수
        double hotScore = views * engagementScore * timeWeight / 1000000.0;
        video.setHotScore(hotScore);
    }

    /**
     * ISO 8601 duration을 초 단위로 변환
     */
    private Integer parseDuration(String duration) {
        if (duration == null || duration.isEmpty()) {
            return 0;
        }
        
        try {
            // PT1H2M3S 형식을 초로 변환
            duration = duration.substring(2); // PT 제거
            int totalSeconds = 0;
            
            if (duration.contains("H")) {
                String[] parts = duration.split("H");
                totalSeconds += Integer.parseInt(parts[0]) * 3600;
                duration = parts.length > 1 ? parts[1] : "";
            }
            
            if (duration.contains("M")) {
                String[] parts = duration.split("M");
                totalSeconds += Integer.parseInt(parts[0]) * 60;
                duration = parts.length > 1 ? parts[1] : "";
            }
            
            if (duration.contains("S")) {
                String[] parts = duration.split("S");
                totalSeconds += Integer.parseInt(parts[0]);
            }
            
            return totalSeconds;
        } catch (Exception e) {
            logger.warn("Duration 파싱 오류: {}", duration);
            return 0;
        }
    }
}
