package com.youtube_hot_finder.youtubehotfinder.controller;

import com.youtube_hot_finder.youtubehotfinder.dto.ApiKeyRequest;
import com.youtube_hot_finder.youtubehotfinder.dto.ApiKeyResponse;
import com.youtube_hot_finder.youtubehotfinder.service.ApiKeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiKeyController {

    @Autowired
    private ApiKeyService apiKeyService;

    /**
     * API 키 저장
     */
    @PostMapping("/keys")
    public ResponseEntity<?> saveApiKey(@RequestBody ApiKeyRequest request) {
        try {
            ApiKeyResponse response = apiKeyService.saveApiKey(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "API 키 저장 중 오류가 발생했습니다."));
        }
    }

    /**
     * API 키 목록 가져오기
     */
    @GetMapping("/keys")
    public ResponseEntity<List<ApiKeyResponse>> getApiKeys() {
        try {
            List<ApiKeyResponse> keys = apiKeyService.getAllApiKeys();
            return ResponseEntity.ok(keys);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * API 키 삭제
     */
    @DeleteMapping("/keys/{keyId}")
    public ResponseEntity<Void> deleteApiKey(@PathVariable Long keyId) {
        try {
            apiKeyService.deleteApiKey(keyId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * API 키 유효성 검사
     */
    @PostMapping("/validate-key")
    public ResponseEntity<Boolean> validateApiKey(@RequestBody Map<String, String> request) {
        try {
            boolean isValid = apiKeyService.validateApiKey(request.get("key"));
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 쿼터 사용량 업데이트
     */
    @PostMapping("/quota")
    public ResponseEntity<Void> updateQuotaUsage(@RequestBody Map<String, Object> request) {
        try {
            Long keyId = Long.valueOf(request.get("keyId").toString());
            Integer usage = Integer.valueOf(request.get("usage").toString());
            apiKeyService.updateQuotaUsage(keyId, usage);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 쿼터 사용량 가져오기
     */
    @GetMapping("/quota")
    public ResponseEntity<List<Map<String, Object>>> getQuotaUsage() {
        try {
            List<Map<String, Object>> quotaData = apiKeyService.getQuotaUsage();
            return ResponseEntity.ok(quotaData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * API 상태 가져오기
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getApiStatus() {
        try {
            Map<String, Object> status = apiKeyService.getApiStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 대기 스킵
     */
    @PostMapping("/skip-wait")
    public ResponseEntity<Map<String, Object>> skipWait() {
        try {
            Map<String, Object> result = apiKeyService.skipWait();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * API 키 통계 가져오기
     */
    @GetMapping("/keys/stats")
    public ResponseEntity<Map<String, Object>> getApiKeyStats() {
        try {
            Map<String, Object> stats = apiKeyService.getApiKeyStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * API 키 순환
     */
    @PostMapping("/keys/rotate")
    public ResponseEntity<Map<String, Object>> rotateApiKeys() {
        try {
            Map<String, Object> result = apiKeyService.rotateApiKeys();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
