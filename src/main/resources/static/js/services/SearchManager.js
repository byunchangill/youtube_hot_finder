/**
 * SearchManager - 검색 기능 관리
 * YouTube API를 통한 검색 및 데이터 처리
 */

class SearchManager {
  constructor() {
    this.baseUrl = '/api';
    this.searchCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5분
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

      // API 호출
      const response = await fetch(`${this.baseUrl}/search/channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          handle: channelHandle,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API_KEY_INVALID');
        } else if (response.status === 429) {
          throw new Error('QUOTA_EXCEEDED');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

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

      // API 호출
      const response = await fetch(`${this.baseUrl}/search/keyword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword,
          filters: filters,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API_KEY_INVALID');
        } else if (response.status === 429) {
          throw new Error('QUOTA_EXCEEDED');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

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

      const response = await fetch(
        `${this.baseUrl}/analyze/channel/${channelId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

      const response = await fetch(`${this.baseUrl}/trending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

      const response = await fetch(`${this.baseUrl}/popular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

      const response = await fetch(`${this.baseUrl}/video/${videoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

      const response = await fetch(`${this.baseUrl}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
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
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('검색 통계 가져오기 오류:', error);
      throw error;
    }
  }
}
