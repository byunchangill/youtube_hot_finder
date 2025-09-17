-- YouTube Hot Finder 데이터베이스 설정 스크립트
-- DBeaver에서 실행하여 데이터베이스와 테이블을 생성합니다.

-- 1. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS youtube_hot_finder 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. 데이터베이스 사용
USE youtube_hot_finder;

-- 3. API 키 관리 테이블
CREATE TABLE IF NOT EXISTS api_keys (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'API 키 이름',
    api_key VARCHAR(500) NOT NULL COMMENT 'YouTube API 키',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    quota_used INT DEFAULT 0 COMMENT '사용된 쿼터',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
    UNIQUE KEY uk_api_key (api_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API 키 관리';

-- 4. 채널 정보 테이블
CREATE TABLE IF NOT EXISTS channels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    channel_id VARCHAR(100) NOT NULL COMMENT 'YouTube 채널 ID',
    title VARCHAR(200) NOT NULL COMMENT '채널 제목',
    description TEXT COMMENT '채널 설명',
    thumbnail_url VARCHAR(500) COMMENT '채널 썸네일 URL',
    subscriber_count BIGINT DEFAULT 0 COMMENT '구독자 수',
    video_count INT DEFAULT 0 COMMENT '비디오 수',
    view_count BIGINT DEFAULT 0 COMMENT '총 조회수',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    UNIQUE KEY uk_channel_id (channel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='채널 정보';

-- 5. 비디오 정보 테이블
CREATE TABLE IF NOT EXISTS videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(100) NOT NULL COMMENT 'YouTube 비디오 ID',
    channel_id VARCHAR(100) NOT NULL COMMENT '채널 ID',
    title VARCHAR(300) NOT NULL COMMENT '비디오 제목',
    description TEXT COMMENT '비디오 설명',
    thumbnail_url VARCHAR(500) COMMENT '비디오 썸네일 URL',
    published_at TIMESTAMP COMMENT '게시일시',
    duration VARCHAR(20) COMMENT '재생시간',
    view_count BIGINT DEFAULT 0 COMMENT '조회수',
    like_count INT DEFAULT 0 COMMENT '좋아요 수',
    comment_count INT DEFAULT 0 COMMENT '댓글 수',
    category_id INT COMMENT '카테고리 ID',
    tags TEXT COMMENT '태그 (JSON 형태)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    UNIQUE KEY uk_video_id (video_id),
    KEY idx_channel_id (channel_id),
    KEY idx_published_at (published_at),
    KEY idx_view_count (view_count),
    FOREIGN KEY (channel_id) REFERENCES channels(channel_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='비디오 정보';

-- 6. 검색 로그 테이블
CREATE TABLE IF NOT EXISTS search_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    search_keyword VARCHAR(200) NOT NULL COMMENT '검색 키워드',
    search_type VARCHAR(50) DEFAULT 'video' COMMENT '검색 타입 (video, channel)',
    max_results INT DEFAULT 10 COMMENT '최대 결과 수',
    order_by VARCHAR(50) DEFAULT 'relevance' COMMENT '정렬 기준',
    published_after TIMESTAMP COMMENT '게시일 이후',
    published_before TIMESTAMP COMMENT '게시일 이전',
    result_count INT DEFAULT 0 COMMENT '검색 결과 수',
    api_key_id BIGINT COMMENT '사용된 API 키 ID',
    search_duration_ms INT COMMENT '검색 소요시간 (밀리초)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '검색일시',
    KEY idx_search_keyword (search_keyword),
    KEY idx_created_at (created_at),
    KEY idx_api_key_id (api_key_id),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='검색 로그';

-- 7. 사용자 설정 테이블
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL COMMENT '설정 키',
    setting_value TEXT COMMENT '설정 값',
    description VARCHAR(200) COMMENT '설정 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    UNIQUE KEY uk_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 설정';

-- 8. 기본 설정 데이터 삽입
INSERT INTO user_settings (setting_key, setting_value, description) VALUES
('default_max_results', '10', '기본 검색 결과 수'),
('default_order', 'relevance', '기본 정렬 기준'),
('cache_duration_hours', '24', '캐시 유지 시간 (시간)'),
('quota_warning_threshold', '8000', '쿼터 경고 임계값'),
('auto_refresh_interval', '300', '자동 새로고침 간격 (초)')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;

-- 9. 인덱스 추가 (성능 최적화)
CREATE INDEX idx_videos_published_view ON videos(published_at DESC, view_count DESC);
CREATE INDEX idx_search_logs_keyword_date ON search_logs(search_keyword, created_at DESC);

-- 10. 뷰 생성 (인기 비디오 조회용)
CREATE OR REPLACE VIEW popular_videos AS
SELECT 
    v.id,
    v.video_id,
    v.title,
    v.view_count,
    v.like_count,
    v.published_at,
    c.title as channel_title,
    c.subscriber_count,
    ROUND(v.view_count / GREATEST(c.subscriber_count, 1), 2) as engagement_ratio
FROM videos v
JOIN channels c ON v.channel_id = c.channel_id
WHERE v.published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY v.view_count DESC;

-- 완료 메시지
SELECT 'YouTube Hot Finder 데이터베이스 설정이 완료되었습니다!' as message;
