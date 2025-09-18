/**
 * APIManager - 프론트엔드 전용 API 키 제공자
 * 백엔드 없이 입력 필드에서 YouTube API 키를 읽어옵니다.
 */

class APIManager {
  constructor() {
    this.cachedKey = null;
    this.propertiesPathCandidates = null; // 런타임에 계산
  }

  /**
   * 현재 입력된 YouTube API 키 반환
   */
  getApiKey() {
    const input = document.getElementById('youtubeApiKey');
    const key = input ? input.value.trim() : '';
    if (!key && !this.cachedKey) {
      throw new Error('API_KEY_MISSING');
    }
    return key || this.cachedKey;
  }

  /**
   * 간단 유효성 검사: 키 존재 여부만 확인
   */
  async validateApiKey() {
    try {
      const key = this.getApiKey();
      return Boolean(key);
    } catch (_) {
      return false;
    }
  }

  /**
   * application.properties에서 youtube.api.default-key 읽어오기
   */
  async preloadKeyFromProperties() {
    if (this.cachedKey) return this.cachedKey;
    // 0) 메타 태그 우선 (선택적)
    try {
      const meta = document.querySelector('meta[name="youtube-api-key"]');
      const metaKey = meta ? meta.getAttribute('content')?.trim() : '';
      if (metaKey) {
        this.cachedKey = metaKey;
        return this.cachedKey;
      }
    } catch (_) {}

    // 0-2) 전역 변수 우선 (선택적)
    try {
      if (window && window.__YOUTUBE_API_KEY__) {
        const gk = String(window.__YOUTUBE_API_KEY__).trim();
        if (gk) {
          this.cachedKey = gk;
          return this.cachedKey;
        }
      }
    } catch (_) {}
    // 현재 페이지 경로에서 레포 베이스 추출 (예: /youtube_hot_finder)
    const segments = (window.location.pathname || '')
      .split('/')
      .filter(Boolean);
    const repoBase = segments.length > 0 ? `/${segments[0]}` : '';

    // 우선순위: 상대경로 → ./ → 레포베이스 → 도메인루트 → 상위경로
    const candidates = [
      'application.properties',
      './application.properties',
      `${repoBase}/application.properties`,
      '/application.properties',
      '../application.properties',
    ];

    for (const path of candidates) {
      try {
        const res = await fetch(path, { cache: 'no-cache' });
        if (!res.ok) continue;
        const text = await res.text();
        const line = text
          .split(/\r?\n/)
          .find((l) => l.trim().startsWith('youtube.api.default-key='));
        if (line) {
          const value = line.split('=')[1]?.trim();
          if (value) {
            this.cachedKey = value;
            // 입력 필드가 비어있다면 채워준다 (보이는 편의)
            const input = document.getElementById('youtubeApiKey');
            if (input && !input.value) input.value = value;
            return value;
          }
        }
      } catch (e) {
        // 다음 후보 경로 시도
      }
    }
    return null;
  }

  /**
   * 키가 없을 때 마지막으로 한 번 더 로드 시도
   */
  async ensureKeyLoaded() {
    if (this.cachedKey) return this.cachedKey;
    return await this.preloadKeyFromProperties();
  }
}
