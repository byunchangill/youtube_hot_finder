/**
 * SearchManager - 검색 기능 관리
 * YouTube API를 통한 검색 및 데이터 처리
 */

class SearchManager {
  constructor() {
    this.searchCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5분
    this.youtubeApiBase = 'https://www.googleapis.com/youtube/v3';
    this.apiManager = new APIManager();
  }

  /**
   * 채널 검색
   */
  async searchChannel(channelHandle) {
    try {
      console.log('채널 검색 시작:', channelHandle);

      // 캐시 확인
      const cacheKey = `channel_${channelHandle}`;
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        console.log('캐시된 결과 반환');
        return cachedResult;
      }

      const apiKey = this.apiManager.getApiKey();

      // 1) 핸들로 채널 ID 조회
      const handle = channelHandle.startsWith('@')
        ? channelHandle
        : `@${channelHandle}`;
      const resolveRes = await fetch(
        `${this.youtubeApiBase}/search?part=snippet&type=channel&q=${encodeURIComponent(
          handle
        )}&maxResults=5&key=${apiKey}`
      );
      if (!resolveRes.ok) {
        if (resolveRes.status === 403) throw new Error('QUOTA_EXCEEDED');
        if (resolveRes.status === 400 || resolveRes.status === 401)
          throw new Error('API_KEY_INVALID');
        throw new Error(`HTTP error! status: ${resolveRes.status}`);
      }
      const resolveJson = await resolveRes.json();
      const channelIds = (resolveJson.items || [])
        .map((i) => i.snippet?.channelId || i.id?.channelId)
        .filter(Boolean);
      if (channelIds.length === 0) {
        this.setCachedResult(cacheKey, []);
        return [];
      }

      // 2) channels API로 상세 조회
      const channelsRes = await fetch(
        `${this.youtubeApiBase}/channels?part=snippet,statistics&id=${channelIds
          .slice(0, 5)
          .join(',')}&key=${apiKey}`
      );
      if (!channelsRes.ok) {
        if (channelsRes.status === 403) throw new Error('QUOTA_EXCEEDED');
        if (channelsRes.status === 400 || channelsRes.status === 401)
          throw new Error('API_KEY_INVALID');
        throw new Error(`HTTP error! status: ${channelsRes.status}`);
      }
      const channelsJson = await channelsRes.json();
      const data = (channelsJson.items || []).map((ch) => ({
        id: ch.id,
        title: ch.snippet?.title || '',
        description: ch.snippet?.description || '',
        thumbnail: ch.snippet?.thumbnails?.default?.url || '',
        subscriberCount: Number(ch.statistics?.subscriberCount || 0),
        videoCount: Number(ch.statistics?.videoCount || 0),
        viewCount: Number(ch.statistics?.viewCount || 0),
      }));

      // 결과 캐싱
      this.setCachedResult(cacheKey, data);

      console.log('채널 검색 완료:', data.length, '개 결과');
      return data;
    } catch (error) {
      console.error('채널 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 키워드 검색
   */
  async searchKeyword(keyword, filters = {}) {
    try {
      console.log('키워드 검색 시작:', keyword, filters);

      // 캐시 확인
      const cacheKey = `keyword_${keyword}_${JSON.stringify(filters)}`;
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        console.log('캐시된 결과 반환');
        return cachedResult;
      }

      const apiKey = this.apiManager.getApiKey();

      // 1) search API로 영상 ID 수집
      const params = new URLSearchParams({
        part: 'snippet',
        q: keyword,
        type: 'video',
        maxResults: '25',
        key: apiKey,
        relevanceLanguage: filters.language || 'ko',
        regionCode: filters.country || filters.targetCountry || 'KR',
      });
      const searchRes = await fetch(`${this.youtubeApiBase}/search?${params}`);
      if (!searchRes.ok) {
        if (searchRes.status === 403) throw new Error('QUOTA_EXCEEDED');
        if (searchRes.status === 400 || searchRes.status === 401)
          throw new Error('API_KEY_INVALID');
        throw new Error(`HTTP error! status: ${searchRes.status}`);
      }
      const searchJson = await searchRes.json();
      const videoIds = (searchJson.items || [])
        .map((i) => i.id?.videoId)
        .filter(Boolean);
      if (videoIds.length === 0) {
        this.setCachedResult(cacheKey, []);
        return [];
      }

      // 2) videos API로 상세 정보 + 통계
      const videosRes = await fetch(
        `${this.youtubeApiBase}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(
          ','
        )}&key=${apiKey}`
      );
      if (!videosRes.ok) {
        if (videosRes.status === 403) throw new Error('QUOTA_EXCEEDED');
        if (videosRes.status === 400 || videosRes.status === 401)
          throw new Error('API_KEY_INVALID');
        throw new Error(`HTTP error! status: ${videosRes.status}`);
      }
      const videosJson = await videosRes.json();

      const parseDuration = (iso) => {
        // PT#H#M#S to seconds
        const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!m) return 0;
        const h = parseInt(m[1] || '0', 10);
        const mm = parseInt(m[2] || '0', 10);
        const s = parseInt(m[3] || '0', 10);
        return h * 3600 + mm * 60 + s;
      };

      const data = (videosJson.items || []).map((v) => ({
        id: v.id,
        title: v.snippet?.title || '',
        description: v.snippet?.description || '',
        channelTitle: v.snippet?.channelTitle || '',
        thumbnail: v.snippet?.thumbnails?.medium?.url || '',
        viewCount: Number(v.statistics?.viewCount || 0),
        likeCount: Number(v.statistics?.likeCount || 0),
        commentCount: Number(v.statistics?.commentCount || 0),
        publishedAt: v.snippet?.publishedAt,
        duration: parseDuration(v.contentDetails?.duration || 'PT0S'),
        language:
          v.snippet?.defaultLanguage || v.snippet?.defaultAudioLanguage || '',
      }));

      // 결과 캐싱
      this.setCachedResult(cacheKey, data);

      console.log('키워드 검색 완료:', data.length, '개 결과');
      return data;
    } catch (error) {
      console.error('키워드 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 채널 분석
   */
  async analyzeChannel(channelId) {
    try {
      console.log('채널 분석 시작:', channelId);
      const apiKey = this.apiManager.getApiKey();

      // 채널 기본 정보
      const chRes = await fetch(
        `${this.youtubeApiBase}/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
      );
      if (!chRes.ok) {
        if (chRes.status === 403) throw new Error('QUOTA_EXCEEDED');
        if (chRes.status === 400 || chRes.status === 401)
          throw new Error('API_KEY_INVALID');
        throw new Error(`HTTP error! status: ${chRes.status}`);
      }
      const chJson = await chRes.json();
      const ch = (chJson.items || [])[0];
      if (!ch) throw new Error('채널 정보를 찾을 수 없습니다.');

      const data = {
        id: ch.id,
        title: ch.snippet?.title,
        description: ch.snippet?.description,
        thumbnail: ch.snippet?.thumbnails?.high?.url,
        subscriberCount: Number(ch.statistics?.subscriberCount || 0),
        videoCount: Number(ch.statistics?.videoCount || 0),
        viewCount: Number(ch.statistics?.viewCount || 0),
        publishedAt: ch.snippet?.publishedAt,
        country: ch.snippet?.country || '',
      };
      console.log('채널 분석 완료:', data);

      // UI에 분석 결과 표시
      try {
        if (window.youtubeHotFinder && window.youtubeHotFinder.uiController) {
          console.log('UI 컨트롤러를 통해 분석 결과 표시 중...');
          window.youtubeHotFinder.uiController.displayChannelAnalysis(data);
        } else {
          console.warn(
            'youtubeHotFinder 또는 uiController를 찾을 수 없습니다.'
          );
          // 직접 UI 업데이트 시도
          this.displayChannelAnalysisDirectly(data);
        }
      } catch (uiError) {
        console.error('UI 업데이트 중 오류:', uiError);
        // 직접 UI 업데이트 시도
        this.displayChannelAnalysisDirectly(data);
      }

      return data;
    } catch (error) {
      console.error('채널 분석 오류:', error);
      throw error;
    }
  }

  /**
   * 채널 분석 결과를 직접 UI에 표시
   */
  displayChannelAnalysisDirectly(analysis) {
    try {
      console.log('직접 UI 업데이트 시작:', analysis);

      const container = document.getElementById('searchResults');
      if (!container) {
        console.error('검색 결과 컨테이너를 찾을 수 없습니다.');
        return;
      }

      // 기존 내용 제거
      container.innerHTML = '';

      // 숫자 포맷팅 함수
      const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) {
          return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
          return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
      };

      // 날짜 포맷팅 함수
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1일 전';
        if (diffDays < 7) return `${diffDays}일 전`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)}주 전`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)}개월 전`;
        return `${Math.ceil(diffDays / 365)}년 전`;
      };

      // 채널 분석 결과 HTML 생성
      const analysisHtml = `
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">
                  <i class="fas fa-chart-line me-2"></i>채널 분석 결과
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <!-- 채널 정보 -->
                  <div class="col-md-4 text-center">
                    <img src="${analysis.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00OCA0OEg3MlY3Mkg0OFY0OFoiIGZpbGw9IiNDQ0MiLz4KPHBhdGggZD0iTTQyIDkwSDc4Vjk0SDQyVjkwWiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'}" 
                           alt="${analysis.title}" 
                           class="img-fluid rounded-circle mb-3" 
                           style="width: 120px; height: 120px; object-fit: cover;"
                           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00OCA0OEg3MlY3Mkg0OFY0OFoiIGZpbGw9IiNDQ0MiLz4KPHBhdGggZD0iTTQyIDkwSDc4Vjk0SDQyVjkwWiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'">
                    <h4 class="mb-2">${analysis.title}</h4>
                    <p class="text-muted mb-0">${analysis.country || 'N/A'}</p>
                  </div>
                  
                  <!-- 통계 정보 -->
                  <div class="col-md-8">
                    <div class="row">
                      <div class="col-md-4">
                        <div class="card bg-light">
                          <div class="card-body text-center">
                            <h3 class="text-primary mb-1">${formatNumber(analysis.subscriberCount)}</h3>
                            <p class="mb-0 text-muted">구독자</p>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="card bg-light">
                          <div class="card-body text-center">
                            <h3 class="text-success mb-1">${formatNumber(analysis.videoCount)}</h3>
                            <p class="mb-0 text-muted">비디오</p>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="card bg-light">
                          <div class="card-body text-center">
                            <h3 class="text-warning mb-1">${formatNumber(analysis.viewCount)}</h3>
                            <p class="mb-0 text-muted">총 조회수</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 추가 정보 -->
                    <div class="mt-4">
                      <h6 class="mb-2">채널 설명</h6>
                      <p class="text-muted">${analysis.description || '설명이 없습니다.'}</p>
                      
                      <div class="row mt-3">
                        <div class="col-md-6">
                          <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            생성일: ${formatDate(analysis.publishedAt)}
                          </small>
                        </div>
                        <div class="col-md-6">
                          <small class="text-muted">
                            <i class="fas fa-globe me-1"></i>
                            국가: ${analysis.country || 'N/A'}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML = analysisHtml;
      console.log('직접 UI 업데이트 완료');
    } catch (error) {
      console.error('직접 UI 업데이트 중 오류:', error);
    }
  }

  /**
   * 트렌딩 영상 가져오기
   */
  async getTrendingVideos(country = 'KR', category = '0') {
    try {
      console.log('트렌딩 영상 가져오기:', country, category);
      const apiKey = this.apiManager.getApiKey();
      const params = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: country,
        videoCategoryId: category,
        maxResults: '25',
        key: apiKey,
      });
      const res = await fetch(`${this.youtubeApiBase}/videos?${params}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error('QUOTA_EXCEEDED');
        if (res.status === 400 || res.status === 401)
          throw new Error('API_KEY_INVALID');
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      const parseDuration = (iso) => {
        const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!m) return 0;
        const h = parseInt(m[1] || '0', 10);
        const mm = parseInt(m[2] || '0', 10);
        const s = parseInt(m[3] || '0', 10);
        return h * 3600 + mm * 60 + s;
      };
      const data = (json.items || []).map((v) => ({
        id: v.id,
        title: v.snippet?.title || '',
        description: v.snippet?.description || '',
        channelTitle: v.snippet?.channelTitle || '',
        thumbnail: v.snippet?.thumbnails?.medium?.url || '',
        viewCount: Number(v.statistics?.viewCount || 0),
        likeCount: Number(v.statistics?.likeCount || 0),
        commentCount: Number(v.statistics?.commentCount || 0),
        publishedAt: v.snippet?.publishedAt,
        duration: parseDuration(v.contentDetails?.duration || 'PT0S'),
        language:
          v.snippet?.defaultLanguage || v.snippet?.defaultAudioLanguage || '',
      }));
      console.log('트렌딩 영상 가져오기 완료:', data.length, '개 결과');
      return data;
    } catch (error) {
      console.error('트렌딩 영상 가져오기 오류:', error);
      throw error;
    }
  }

  /**
   * 인기 영상 가져오기
   */
  async getPopularVideos(filters = {}) {
    try {
      console.log('인기 영상 가져오기:', filters);
      // 프론트엔드 전용: mostPopular API 사용, 필터는 클라이언트에서 적용
      const data = await this.getTrendingVideos(
        filters.country || filters.targetCountry || 'KR',
        '0'
      );
      console.log('인기 영상 가져오기 완료:', data.length, '개 결과');
      return data;
    } catch (error) {
      console.error('인기 영상 가져오기 오류:', error);
      throw error;
    }
  }

  /**
   * 영상 상세 정보 가져오기
   */
  async getVideoDetails(videoId) {
    try {
      console.log('영상 상세 정보 가져오기:', videoId);
      const apiKey = this.apiManager.getApiKey();
      const res = await fetch(
        `${this.youtubeApiBase}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
      );
      if (!res.ok) {
        if (res.status === 403) throw new Error('QUOTA_EXCEEDED');
        if (res.status === 400 || res.status === 401)
          throw new Error('API_KEY_INVALID');
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      const v = (json.items || [])[0];
      const parseDuration = (iso) => {
        const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!m) return 0;
        const h = parseInt(m[1] || '0', 10);
        const mm = parseInt(m[2] || '0', 10);
        const s = parseInt(m[3] || '0', 10);
        return h * 3600 + mm * 60 + s;
      };
      const data = v
        ? {
            id: v.id,
            title: v.snippet?.title || '',
            description: v.snippet?.description || '',
            channelTitle: v.snippet?.channelTitle || '',
            thumbnail: v.snippet?.thumbnails?.medium?.url || '',
            viewCount: Number(v.statistics?.viewCount || 0),
            likeCount: Number(v.statistics?.likeCount || 0),
            commentCount: Number(v.statistics?.commentCount || 0),
            publishedAt: v.snippet?.publishedAt,
            duration: parseDuration(v.contentDetails?.duration || 'PT0S'),
            language:
              v.snippet?.defaultLanguage ||
              v.snippet?.defaultAudioLanguage ||
              '',
          }
        : null;
      console.log('영상 상세 정보 가져오기 완료');
      return data;
    } catch (error) {
      console.error('영상 상세 정보 가져오기 오류:', error);
      throw error;
    }
  }

  /**
   * 검색 제안 가져오기
   */
  async getSearchSuggestions(query) {
    try {
      if (!query || query.length < 2) {
        return [];
      }
      // 클라이언트에서 간단 자동완성: 최근 검색 기록 기반
      const history = (
        window.youtubeHotFinder?.stateManager?.getSearchHistory?.() || []
      )
        .filter(
          (h) =>
            h.type === 'keyword' &&
            h.query.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map((h) => h.query);
      return Array.from(new Set(history));
    } catch (error) {
      console.error('검색 제안 가져오기 오류:', error);
      return [];
    }
  }

  /**
   * 랭킹 계산
   */
  calculateRanking(videos, criteria = 'views') {
    try {
      console.log('랭킹 계산 시작:', criteria);

      const sortedVideos = videos.sort((a, b) => {
        switch (criteria) {
          case 'views':
            return b.viewCount - a.viewCount;
          case 'likes':
            return b.likeCount - a.likeCount;
          case 'comments':
            return b.commentCount - a.commentCount;
          case 'hot_score':
            return (b.hotScore || 0) - (a.hotScore || 0);
          default:
            return b.viewCount - a.viewCount;
        }
      });

      // 랭킹 번호 추가
      sortedVideos.forEach((video, index) => {
        video.ranking = index + 1;
      });

      console.log('랭킹 계산 완료');
      return sortedVideos;
    } catch (error) {
      console.error('랭킹 계산 오류:', error);
      throw error;
    }
  }

  /**
   * 핫 스코어 계산
   */
  calculateHotScore(video) {
    try {
      const now = new Date();
      const publishedAt = new Date(video.publishedAt);
      const hoursSincePublished = (now - publishedAt) / (1000 * 60 * 60);

      // 기본 점수 (조회수 기반)
      let score = Math.log10(video.viewCount + 1) * 10;

      // 시간 가중치 (최근 영상일수록 높은 점수)
      const timeWeight = Math.max(0.1, 1 - hoursSincePublished / 168); // 1주일 기준
      score *= timeWeight;

      // 좋아요 비율 가중치
      const likeRatio = video.likeCount / Math.max(video.viewCount, 1);
      score *= 1 + likeRatio * 2;

      // 댓글 비율 가중치
      const commentRatio = video.commentCount / Math.max(video.viewCount, 1);
      score *= 1 + commentRatio * 1.5;

      return Math.round(score * 100) / 100;
    } catch (error) {
      console.error('핫 스코어 계산 오류:', error);
      return 0;
    }
  }

  /**
   * 필터링
   */
  filterVideos(videos, filters) {
    try {
      console.log('영상 필터링 시작:', filters);

      let filteredVideos = [...videos];

      // 최소 조회수 필터
      if (filters.minViews) {
        filteredVideos = filteredVideos.filter(
          (video) => video.viewCount >= filters.minViews
        );
      }

      // 최소 시간당 조회수 필터
      if (filters.minViewsPerHour) {
        filteredVideos = filteredVideos.filter((video) => {
          const hoursSincePublished = this.getHoursSincePublished(
            video.publishedAt
          );
          const viewsPerHour =
            video.viewCount / Math.max(hoursSincePublished, 1);
          return viewsPerHour >= filters.minViewsPerHour;
        });
      }

      // 영상 타입 필터
      if (filters.videoType && filters.videoType !== 'both') {
        filteredVideos = filteredVideos.filter((video) => {
          if (filters.videoType === 'shorts') {
            return video.duration <= (filters.shortsDuration || 180);
          } else if (filters.videoType === 'normal') {
            return video.duration > (filters.shortsDuration || 180);
          }
          return true;
        });
      }

      // 언어 필터
      if (filters.language) {
        filteredVideos = filteredVideos.filter(
          (video) => video.language === filters.language
        );
      }

      console.log('영상 필터링 완료:', filteredVideos.length, '개 결과');
      return filteredVideos;
    } catch (error) {
      console.error('영상 필터링 오류:', error);
      throw error;
    }
  }

  /**
   * 발행 후 경과 시간 계산 (시간)
   */
  getHoursSincePublished(publishedAt) {
    const now = new Date();
    const published = new Date(publishedAt);
    return (now - published) / (1000 * 60 * 60);
  }

  /**
   * 캐시된 결과 가져오기
   */
  getCachedResult(key) {
    const cached = this.searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * 결과 캐싱
   */
  setCachedResult(key, data) {
    this.searchCache.set(key, {
      data: data,
      timestamp: Date.now(),
    });
  }

  /**
   * 캐시 클리어
   */
  clearCache() {
    this.searchCache.clear();
    console.log('검색 캐시 클리어 완료');
  }

  /**
   * 검색 통계 가져오기
   */
  async getSearchStats() {
    try {
      // 프론트엔드 임시 통계: 최근 결과 수
      const last =
        window.youtubeHotFinder?.stateManager?.getState?.().lastSearch;
      return last ? { last } : { last: null };
    } catch (error) {
      console.error('검색 통계 가져오기 오류:', error);
      throw error;
    }
  }
}
