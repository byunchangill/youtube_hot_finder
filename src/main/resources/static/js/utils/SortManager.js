/**
 * SortManager - 정렬 관리
 * 검색 결과 정렬 기능 제공
 */

class SortManager {
  constructor() {
    this.sortFunctions = {
      relevance: this.sortByRelevance.bind(this),
      viewCount: this.sortByViewCount.bind(this),
      subscriberCount: this.sortBySubscriberCount.bind(this),
      duration: this.sortByDuration.bind(this),
    };
  }

  /**
   * 정렬 매니저 초기화
   */
  init() {
    console.log('SortManager 초기화 완료');
  }

  /**
   * 데이터 정렬
   * @param {Array} data - 정렬할 데이터 배열
   * @param {string} sortBy - 정렬 기준
   * @param {string} sortOrder - 정렬 순서 ('asc' | 'desc')
   * @returns {Array} 정렬된 데이터
   */
  sortData(data, sortBy = 'relevance', sortOrder = 'desc') {
    if (!Array.isArray(data) || data.length === 0) {
      return data;
    }

    const sortFunction = this.sortFunctions[sortBy];
    if (!sortFunction) {
      console.warn(`알 수 없는 정렬 기준: ${sortBy}`);
      return data;
    }

    try {
      const sortedData = [...data].sort(sortFunction);

      // 내림차순이면 배열을 뒤집기
      if (sortOrder === 'desc') {
        return sortedData.reverse();
      }

      return sortedData;
    } catch (error) {
      console.error('정렬 중 오류 발생:', error);
      return data;
    }
  }

  /**
   * 관련성으로 정렬 (기본 정렬)
   * @param {Object} a - 첫 번째 항목
   * @param {Object} b - 두 번째 항목
   * @returns {number} 정렬 결과
   */
  sortByRelevance(a, b) {
    // 관련성은 YouTube API에서 제공하는 기본 순서를 유지
    // 필요시 hotScore나 다른 지표를 사용할 수 있음
    const scoreA = this.calculateRelevanceScore(a);
    const scoreB = this.calculateRelevanceScore(b);
    return scoreA - scoreB;
  }

  /**
   * 조회수로 정렬
   * @param {Object} a - 첫 번째 항목
   * @param {Object} b - 두 번째 항목
   * @returns {number} 정렬 결과
   */
  sortByViewCount(a, b) {
    const viewsA = parseInt(a.viewCount) || 0;
    const viewsB = parseInt(b.viewCount) || 0;
    return viewsA - viewsB;
  }

  /**
   * 구독자수로 정렬
   * @param {Object} a - 첫 번째 항목
   * @param {Object} b - 두 번째 항목
   * @returns {number} 정렬 결과
   */
  sortBySubscriberCount(a, b) {
    const subsA = parseInt(a.subscriberCount) || 0;
    const subsB = parseInt(b.subscriberCount) || 0;
    return subsA - subsB;
  }

  /**
   * 영상 시간으로 정렬
   * @param {Object} a - 첫 번째 항목
   * @param {Object} b - 두 번째 항목
   * @returns {number} 정렬 결과
   */
  sortByDuration(a, b) {
    const durationA = this.parseDuration(a.duration) || 0;
    const durationB = this.parseDuration(b.duration) || 0;
    return durationA - durationB;
  }

  /**
   * 관련성 점수 계산
   * @param {Object} video - 영상 객체
   * @returns {number} 관련성 점수
   */
  calculateRelevanceScore(video) {
    let score = 0;

    // 조회수 기반 점수 (가중치: 0.4)
    const viewCount = parseInt(video.viewCount) || 0;
    score += Math.log10(viewCount + 1) * 0.4;

    // 좋아요 기반 점수 (가중치: 0.3)
    const likeCount = parseInt(video.likeCount) || 0;
    score += Math.log10(likeCount + 1) * 0.3;

    // 최신성 기반 점수 (가중치: 0.2)
    const publishedAt = new Date(video.publishedAt);
    const now = new Date();
    const daysSincePublished = (now - publishedAt) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 30 - daysSincePublished) * 0.2;

    // 댓글 수 기반 점수 (가중치: 0.1)
    const commentCount = parseInt(video.commentCount) || 0;
    score += Math.log10(commentCount + 1) * 0.1;

    return score;
  }

  /**
   * ISO 8601 duration을 초 단위로 변환
   * @param {string} duration - ISO 8601 duration (예: PT1H2M30S)
   * @returns {number} 초 단위 시간
   */
  parseDuration(duration) {
    if (!duration || typeof duration !== 'string') {
      return 0;
    }

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) {
      return 0;
    }

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * 정렬 옵션 유효성 검사
   * @param {string} sortBy - 정렬 기준
   * @param {string} sortOrder - 정렬 순서
   * @returns {Object} 검사 결과
   */
  validateSortOptions(sortBy, sortOrder) {
    const errors = [];

    if (!this.sortFunctions[sortBy]) {
      errors.push(`지원하지 않는 정렬 기준: ${sortBy}`);
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      errors.push(`지원하지 않는 정렬 순서: ${sortOrder}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * 정렬 통계 정보 생성
   * @param {Array} data - 정렬된 데이터
   * @param {string} sortBy - 정렬 기준
   * @returns {Object} 통계 정보
   */
  getSortStats(data, sortBy) {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        totalItems: 0,
        sortBy: sortBy,
        range: null,
        average: 0,
      };
    }

    let values = [];

    switch (sortBy) {
      case 'viewCount':
        values = data.map((item) => parseInt(item.viewCount) || 0);
        break;
      case 'subscriberCount':
        values = data.map((item) => parseInt(item.subscriberCount) || 0);
        break;
      case 'duration':
        values = data.map((item) => this.parseDuration(item.duration) || 0);
        break;
      default:
        values = data.map((item) => this.calculateRelevanceScore(item));
    }

    const sortedValues = values.sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      totalItems: data.length,
      sortBy: sortBy,
      range: { min, max },
      average: Math.round(average),
    };
  }

  /**
   * 정렬 옵션 프리셋
   */
  getSortPresets() {
    return {
      popular: { sortBy: 'viewCount', sortOrder: 'desc' },
      newest: { sortBy: 'relevance', sortOrder: 'desc' },
      shortest: { sortBy: 'duration', sortOrder: 'asc' },
      longest: { sortBy: 'duration', sortOrder: 'desc' },
      mostSubscribed: { sortBy: 'subscriberCount', sortOrder: 'desc' },
    };
  }

  /**
   * 프리셋 적용
   * @param {string} presetName - 프리셋 이름
   * @returns {Object|null} 정렬 옵션 또는 null
   */
  applyPreset(presetName) {
    const presets = this.getSortPresets();
    return presets[presetName] || null;
  }
}

