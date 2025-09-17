package com.youtube_hot_finder.youtubehotfinder.exception;

/**
 * YouTube API 키 관련 예외
 */
public class ApiKeyException extends Exception {
    
    public ApiKeyException(String message) {
        super(message);
    }
    
    public ApiKeyException(String message, Throwable cause) {
        super(message, cause);
    }
}
