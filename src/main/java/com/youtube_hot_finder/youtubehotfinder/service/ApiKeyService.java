package com.youtube_hot_finder.youtubehotfinder.service;

import com.youtube_hot_finder.youtubehotfinder.dto.ApiKeyRequest;
import com.youtube_hot_finder.youtubehotfinder.dto.ApiKeyResponse;
import com.youtube_hot_finder.youtubehotfinder.entity.ApiKey;
import com.youtube_hot_finder.youtubehotfinder.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApiKeyService {

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    /**
     * API 키 저장
     */
    @Transactional
    public ApiKeyResponse saveApiKey(ApiKeyRequest request) {
        // 중복 API 키 확인
        if (apiKeyRepository.findByKey(request.getKey()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 API 키입니다.");
        }
        
        ApiKey apiKey = ApiKey.builder()
                .name(request.getName())
                .key(request.getKey())
                .quotaUsed(0)
                .isActive(true)
                .build();
        
        ApiKey savedApiKey = apiKeyRepository.save(apiKey);
        
        return new ApiKeyResponse(
                savedApiKey.getId(),
                savedApiKey.getName(),
                savedApiKey.getKey(),
                savedApiKey.getCreatedAt(),
                savedApiKey.getUpdatedAt(),
                savedApiKey.getQuotaUsed(),
                savedApiKey.getIsActive()
        );
    }

    /**
     * API 키 목록 가져오기
     */
    public List<ApiKeyResponse> getAllApiKeys() {
        List<ApiKey> apiKeys = apiKeyRepository.findByIsActiveTrue();
        return apiKeys.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * API 키 삭제
     */
    @Transactional
    public void deleteApiKey(Long keyId) {
        ApiKey apiKey = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 API 키입니다."));
        apiKeyRepository.delete(apiKey);
    }

    /**
     * API 키 유효성 검사
     */
    public boolean validateApiKey(String key) {
        if (key == null || key.trim().isEmpty()) {
            return false;
        }
        return apiKeyRepository.findByKey(key)
                .map(ApiKey::getIsActive)
                .orElse(false);
    }

    /**
     * 쿼터 사용량 업데이트
     */
    @Transactional
    public void updateQuotaUsage(Long keyId, Integer usage) {
        ApiKey apiKey = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 API 키입니다."));
        
        apiKey.setQuotaUsed(apiKey.getQuotaUsed() + usage);
        apiKeyRepository.save(apiKey);
    }

    /**
     * 쿼터 사용량 가져오기
     */
    public List<Map<String, Object>> getQuotaUsage() {
        List<Object[]> stats = apiKeyRepository.getQuotaUsageStats();
        return stats.stream()
                .map(stat -> {
                    Map<String, Object> usage = new HashMap<>();
                    usage.put("name", stat[0]);
                    usage.put("quotaUsed", stat[1]);
                    return usage;
                })
                .collect(Collectors.toList());
    }

    /**
     * API 상태 가져오기
     */
    public Map<String, Object> getApiStatus() {
        List<ApiKey> activeKeys = apiKeyRepository.findByIsActiveTrue();
        int totalQuotaUsed = activeKeys.stream()
                .mapToInt(ApiKey::getQuotaUsed)
                .sum();
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", activeKeys.isEmpty() ? "no_keys" : "ready");
        response.put("message", activeKeys.isEmpty() ? "사용 가능한 API 키가 없습니다." : "API가 정상적으로 작동 중입니다.");
        response.put("waitUntil", null);
        response.put("quotaUsage", totalQuotaUsed);
        return response;
    }

    /**
     * 대기 스킵
     */
    public Map<String, Object> skipWait() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "대기가 스킵되었습니다.");
        response.put("currentIndex", 0);
        return response;
    }

    /**
     * API 키 통계 가져오기
     */
    public Map<String, Object> getApiKeyStats() {
        List<ApiKey> allKeys = apiKeyRepository.findAll();
        List<ApiKey> activeKeys = apiKeyRepository.findByIsActiveTrue();
        int totalQuotaUsage = activeKeys.stream()
                .mapToInt(ApiKey::getQuotaUsed)
                .sum();
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalKeys", allKeys.size());
        response.put("activeKeys", activeKeys.size());
        response.put("totalQuotaUsage", totalQuotaUsage);
        return response;
    }

    /**
     * API 키 순환
     */
    public Map<String, Object> rotateApiKeys() {
        List<ApiKey> availableKeys = apiKeyRepository.findAvailableApiKeys(8000);
        Map<String, Object> response = new HashMap<>();
        response.put("success", !availableKeys.isEmpty());
        response.put("currentIndex", 0);
        response.put("message", availableKeys.isEmpty() ? "사용 가능한 API 키가 없습니다." : "API 키가 순환되었습니다.");
        return response;
    }
    
    /**
     * ApiKey 엔티티를 ApiKeyResponse로 변환
     */
    private ApiKeyResponse convertToResponse(ApiKey apiKey) {
        return new ApiKeyResponse(
                apiKey.getId(),
                apiKey.getName(),
                apiKey.getKey(),
                apiKey.getCreatedAt(),
                apiKey.getUpdatedAt(),
                apiKey.getQuotaUsed(),
                apiKey.getIsActive()
        );
    }
}
