package com.youtube_hot_finder.youtubehotfinder.controller;

import com.youtube_hot_finder.youtubehotfinder.dto.SearchRequest;
import com.youtube_hot_finder.youtubehotfinder.dto.SearchResponse;
import com.youtube_hot_finder.youtubehotfinder.service.SearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);

    @Autowired
    private SearchService searchService;

    /**
     * API 키 유효성 검증
     */
    @GetMapping("/validate-api-key")
    public ResponseEntity<Map<String, Object>> validateApiKey() {
        logger.info("API 키 유효성 검증 요청 받음");
        try {
            boolean isValid = searchService.validateApiKey();
            Map<String, Object> response = Map.of(
                "valid", isValid,
                "message", isValid ? "API 키가 유효합니다" : "API 키가 유효하지 않습니다"
            );
            logger.info("API 키 검증 결과: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("API 키 검증 중 오류 발생: {}", e.getMessage(), e);
            Map<String, Object> response = Map.of(
                "valid", false,
                "message", "API 키 검증 중 오류 발생: " + e.getMessage()
            );
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 채널 검색
     */
    @PostMapping("/search/channel")
    public ResponseEntity<List<SearchResponse>> searchChannel(@RequestBody SearchRequest request) {
        logger.info("채널 검색 요청 받음: {}", request.getHandle());
        try {
            List<SearchResponse> results = searchService.searchChannel(request.getHandle());
            logger.info("채널 검색 완료: {} 개 결과", results.size());
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("API 키 오류")) {
                logger.error("API 키 오류: {}", e.getMessage());
                return ResponseEntity.status(401).body(Collections.emptyList());
            } else if (e.getMessage() != null && e.getMessage().contains("API 쿼터 초과")) {
                logger.error("API 쿼터 초과: {}", e.getMessage());
                return ResponseEntity.status(429).body(Collections.emptyList());
            } else {
                logger.error("채널 검색 중 오류 발생: {}", e.getMessage(), e);
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            logger.error("채널 검색 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 키워드 검색
     */
    @PostMapping("/search/keyword")
    public ResponseEntity<List<SearchResponse>> searchKeyword(@RequestBody SearchRequest request) {
        try {
            logger.info("키워드 검색 요청 받음: '{}'", request.getKeyword());
            logger.info("키워드 원본 바이트: {}", request.getKeyword() != null ? 
                java.util.Arrays.toString(request.getKeyword().getBytes(java.nio.charset.StandardCharsets.UTF_8)) : "null");
            logger.info("검색 필터: {}", request.getFilters());
            
            List<SearchResponse> results = searchService.searchKeyword(
                request.getKeyword(), 
                request.getFilters()
            );
            logger.info("키워드 검색 완료: {} 개 결과", results.size());
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("API 키 오류")) {
                logger.error("API 키 오류: {}", e.getMessage());
                return ResponseEntity.status(401).body(Collections.emptyList());
            } else if (e.getMessage() != null && e.getMessage().contains("API 쿼터 초과")) {
                logger.error("API 쿼터 초과: {}", e.getMessage());
                return ResponseEntity.status(429).body(Collections.emptyList());
            } else {
                logger.error("키워드 검색 중 오류 발생: {}", e.getMessage(), e);
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            logger.error("키워드 검색 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 채널 분석
     */
    @GetMapping("/analyze/channel/{channelId}")
    public ResponseEntity<Map<String, Object>> analyzeChannel(@PathVariable String channelId) {
        try {
            Map<String, Object> analysis = searchService.analyzeChannel(channelId);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 트렌딩 영상 가져오기
     */
    @GetMapping("/trending")
    public ResponseEntity<List<SearchResponse>> getTrendingVideos(
            @RequestParam(defaultValue = "KR") String country,
            @RequestParam(defaultValue = "0") String category) {
        try {
            List<SearchResponse> results = searchService.getTrendingVideos(country, category);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 인기 영상 가져오기
     */
    @PostMapping("/popular")
    public ResponseEntity<List<SearchResponse>> getPopularVideos(@RequestBody Map<String, Object> filters) {
        try {
            List<SearchResponse> results = searchService.getPopularVideos(filters);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 영상 상세 정보 가져오기
     */
    @GetMapping("/video/{videoId}")
    public ResponseEntity<SearchResponse> getVideoDetails(@PathVariable String videoId) {
        try {
            SearchResponse video = searchService.getVideoDetails(videoId);
            return ResponseEntity.ok(video);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 검색 제안 가져오기
     */
    @PostMapping("/suggestions")
    public ResponseEntity<List<String>> getSearchSuggestions(@RequestBody Map<String, String> request) {
        try {
            List<String> suggestions = searchService.getSearchSuggestions(request.get("query"));
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 검색 통계 가져오기
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSearchStats() {
        try {
            Map<String, Object> stats = searchService.getSearchStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
