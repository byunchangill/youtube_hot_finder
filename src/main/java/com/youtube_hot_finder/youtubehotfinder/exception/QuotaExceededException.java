package com.youtube_hot_finder.youtubehotfinder.exception;

/**
 * YouTube API 쿼터 초과 예외
 */
public class QuotaExceededException extends Exception {
    
    public QuotaExceededException(String message) {
        super(message);
    }
    
    public QuotaExceededException(String message, Throwable cause) {
        super(message, cause);
    }
}
