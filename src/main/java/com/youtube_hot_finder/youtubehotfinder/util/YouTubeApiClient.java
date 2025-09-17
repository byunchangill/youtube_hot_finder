package com.youtube_hot_finder.youtubehotfinder.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youtube_hot_finder.youtubehotfinder.entity.ApiKey;
import com.youtube_hot_finder.youtubehotfinder.exception.ApiKeyException;
import com.youtube_hot_finder.youtubehotfinder.exception.QuotaExceededException;
import com.youtube_hot_finder.youtubehotfinder.repository.ApiKeyRepository;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.hc.core5.http.ParseException;

@Component
public class YouTubeApiClient {
    
    private static final Logger logger = LoggerFactory.getLogger(YouTubeApiClient.class);
    
    @Value("${youtube.api.base-url}")
    private String baseUrl;
    
    @Value("${youtube.api.default-key}")
    private String defaultApiKey;
    
    @Autowired
    private ApiKeyRepository apiKeyRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CloseableHttpClient httpClient = HttpClients.createDefault();
    
    /**
     * YouTube API 요청 실행
     */
    public JsonNode executeRequest(String endpoint, Map<String, String> parameters, String apiKey) throws IOException, ParseException, ApiKeyException, QuotaExceededException {
        String url = buildUrl(endpoint, parameters, apiKey);
        logger.info("YouTube API 요청: {}", url);
        
        HttpGet request = new HttpGet(url);
        request.setHeader("Accept", "application/json");
        
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            String responseBody = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
            
            logger.info("YouTube API 응답 코드: {}", response.getCode());
            logger.info("YouTube API 응답 헤더: {}", (Object[]) response.getHeaders());
            logger.debug("YouTube API 응답 본문: {}", responseBody);
            
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            
            if (response.getCode() != 200) {
                logger.error("YouTube API 오류 - 상태 코드: {}", response.getCode());
                logger.error("YouTube API 오류 - 응답 본문: {}", responseBody);
                logger.error("YouTube API 오류 - 요청 URL: {}", url);
                
                // JSON 응답에서 오류 확인
                if (jsonResponse.has("error")) {
                    JsonNode error = jsonResponse.get("error");
                    
                    // details 배열에서 API_KEY_INVALID 확인
                    if (error.has("details")) {
                        JsonNode details = error.get("details");
                        for (JsonNode detail : details) {
                            if (detail.has("reason")) {
                                String reason = detail.get("reason").asText();
                                if ("API_KEY_INVALID".equals(reason)) {
                                    logger.error("YouTube API 키 오류: {}", reason);
                                    throw new ApiKeyException("YouTube API 키가 유효하지 않습니다. API 키를 확인해주세요.");
                                } else if ("QUOTA_EXCEEDED".equals(reason)) {
                                    logger.error("YouTube API 쿼터 초과");
                                    throw new QuotaExceededException("YouTube API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요.");
                                }
                            }
                        }
                    }
                    
                    // errors 배열에서도 확인 (기존 방식)
                    if (error.has("errors")) {
                        JsonNode errors = error.get("errors");
                        for (JsonNode errorItem : errors) {
                            if (errorItem.has("reason")) {
                                String reason = errorItem.get("reason").asText();
                                if ("keyInvalid".equals(reason) || "keyExpired".equals(reason)) {
                                    logger.error("YouTube API 키 오류: {}", reason);
                                    throw new ApiKeyException("YouTube API 키가 유효하지 않습니다. API 키를 확인해주세요.");
                                } else if ("quotaExceeded".equals(reason)) {
                                    logger.error("YouTube API 쿼터 초과");
                                    throw new QuotaExceededException("YouTube API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요.");
                                }
                            }
                        }
                    }
                }
                
                throw new IOException("YouTube API 요청 실패: " + response.getCode() + " - " + responseBody);
            }
            
            logger.info("YouTube API JSON 파싱 성공");
            return jsonResponse;
        }
    }
    
    /**
     * API 키를 사용하여 요청 실행 (자동 키 선택)
     */
    public JsonNode executeRequest(String endpoint, Map<String, String> parameters) throws IOException, ParseException, ApiKeyException, QuotaExceededException {
        String apiKey = getAvailableApiKey();
        return executeRequest(endpoint, parameters, apiKey);
    }
    
    /**
     * URL 빌드
     */
    private String buildUrl(String endpoint, Map<String, String> parameters, String apiKey) {
        StringBuilder url = new StringBuilder(baseUrl).append("/").append(endpoint);
        url.append("?key=").append(apiKey);
        
        if (parameters != null) {
            for (Map.Entry<String, String> entry : parameters.entrySet()) {
                if (entry.getValue() != null && !entry.getValue().trim().isEmpty()) {
                    url.append("&").append(entry.getKey()).append("=")
                       .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
                }
            }
        }
        
        return url.toString();
    }
    
    /**
     * 채널 검색을 위한 파라미터 생성
     */
    public Map<String, String> createChannelSearchParams(String query, int maxResults) {
        Map<String, String> params = new HashMap<>();
        params.put("part", "snippet");
        params.put("type", "channel");
        params.put("q", query);
        params.put("maxResults", String.valueOf(maxResults));
        return params;
    }
    
    /**
     * 비디오 검색을 위한 파라미터 생성
     */
    public Map<String, String> createVideoSearchParams(String query, int maxResults, String order) {
        Map<String, String> params = new HashMap<>();
        params.put("part", "snippet");
        params.put("type", "video");
        params.put("q", query);
        params.put("maxResults", String.valueOf(maxResults));
        if (order != null) {
            params.put("order", order);
        }
        return params;
    }
    
    /**
     * 비디오 상세 정보를 위한 파라미터 생성
     */
    public Map<String, String> createVideoDetailsParams(String videoId) {
        Map<String, String> params = new HashMap<>();
        params.put("part", "snippet,statistics,contentDetails");
        params.put("id", videoId);
        return params;
    }
    
    /**
     * 트렌딩 비디오를 위한 파라미터 생성
     */
    public Map<String, String> createTrendingParams(String regionCode, String categoryId, int maxResults) {
        Map<String, String> params = new HashMap<>();
        params.put("part", "snippet,statistics,contentDetails");
        params.put("chart", "mostPopular");
        params.put("maxResults", String.valueOf(maxResults));
        if (regionCode != null) {
            params.put("regionCode", regionCode);
        }
        if (categoryId != null) {
            params.put("videoCategoryId", categoryId);
        }
        return params;
    }
    
    /**
     * 채널 정보를 위한 파라미터 생성
     */
    public Map<String, String> createChannelDetailsParams(String channelId) {
        Map<String, String> params = new HashMap<>();
        params.put("part", "snippet,statistics,contentDetails");
        params.put("id", channelId);
        return params;
    }
    
    /**
     * 데이터베이스에서 사용 가능한 API 키 조회
     */
    public String getAvailableApiKey() {
        try {
            List<ApiKey> availableKeys = apiKeyRepository.findAvailableApiKeys(8000);
            if (!availableKeys.isEmpty()) {
                ApiKey selectedKey = availableKeys.get(0);
                logger.info("데이터베이스에서 API 키 사용: {}", selectedKey.getName());
                return selectedKey.getKey();
            } else {
                logger.warn("사용 가능한 API 키가 없어 기본 키 사용");
                return defaultApiKey;
            }
        } catch (Exception e) {
            logger.error("API 키 조회 중 오류 발생, 기본 키 사용: {}", e.getMessage());
            return defaultApiKey;
        }
    }
    
}
