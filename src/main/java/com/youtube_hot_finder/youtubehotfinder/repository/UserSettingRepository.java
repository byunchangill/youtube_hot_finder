package com.youtube_hot_finder.youtubehotfinder.repository;

import com.youtube_hot_finder.youtubehotfinder.entity.UserSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSettingRepository extends JpaRepository<UserSetting, Long> {
    
    /**
     * 설정 키로 조회
     */
    Optional<UserSetting> findBySettingKey(String settingKey);
    
    /**
     * 설정 키 존재 여부 확인
     */
    boolean existsBySettingKey(String settingKey);
}
