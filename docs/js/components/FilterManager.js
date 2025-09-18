/**
 * FilterManager - 필터 관리
 * 검색 필터 옵션 관리 및 변경 이벤트 처리
 */

class FilterManager {
  constructor() {
    this.filters = this.getDefaultFilters();
    this.filterChangeCallbacks = [];
  }

  /**
   * 기본 필터값 반환
   */
  getDefaultFilters() {
    return {
      videoType: 'both', // 'shorts' | 'normal' | 'both'
      country: 'KR',
      language: 'ko',
      minViews: 1000, // 더 낮은 임계값으로 설정
      minViewsPerHour: 100, // 더 낮은 임계값으로 설정
      shortsDuration: 180,
      maxResults: 50,
      order: 'relevance', // 'relevance' | 'date' | 'rating' | 'viewCount'
      publishedAfter: null,
      publishedBefore: null,
      categoryId: '0', // 모든 카테고리
      regionCode: 'KR',
      relevanceLanguage: 'ko',
    };
  }

  /**
   * 필터 매니저 초기화
   */
  init() {
    this.setupEventListeners();
    this.loadSavedFilters();
    console.log('FilterManager 초기화 완료');
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 필터 요소들에 이벤트 리스너 추가
    const filterElements = [
      'videoType',
      'targetCountry',
      'language',
      'minViews',
      'minViewsPerHour',
      'shortsDuration',
      'maxSearchesPerKeyword',
    ];

    filterElements.forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.addEventListener('change', () => {
          this.handleFilterChange();
        });
      }
    });

    // 체크박스 이벤트
    const checkboxElements = ['showPopularByChannel'];
    checkboxElements.forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.addEventListener('change', () => {
          this.handleFilterChange();
        });
      }
    });
  }

  /**
   * 현재 필터값 가져오기
   */
  getCurrentFilters() {
    const currentFilters = { ...this.filters };

    // DOM에서 현재 값 읽기
    const videoType = document.getElementById('videoType')?.value;
    if (videoType) currentFilters.videoType = videoType;

    const targetCountry = document.getElementById('targetCountry')?.value;
    if (targetCountry) currentFilters.country = targetCountry;

    const language = document.getElementById('language')?.value;
    if (language) currentFilters.language = language;

    const minViews = document.getElementById('minViews')?.value;
    if (minViews) currentFilters.minViews = parseInt(minViews);

    const minViewsPerHour = document.getElementById('minViewsPerHour')?.value;
    if (minViewsPerHour)
      currentFilters.minViewsPerHour = parseFloat(minViewsPerHour);

    const shortsDuration = document.getElementById('shortsDuration')?.value;
    if (shortsDuration)
      currentFilters.shortsDuration = parseInt(shortsDuration);

    const maxSearchesPerKeyword = document.getElementById(
      'maxSearchesPerKeyword'
    )?.value;
    if (maxSearchesPerKeyword)
      currentFilters.maxResults = parseInt(maxSearchesPerKeyword);

    const showPopularByChannel = document.getElementById(
      'showPopularByChannel'
    )?.checked;
    currentFilters.showPopularByChannel = showPopularByChannel;

    console.log('현재 필터 값:', currentFilters);
    return currentFilters;
  }

  /**
   * 필터 설정
   */
  setFilters(filters) {
    this.filters = { ...this.filters, ...filters };
    this.applyFiltersToDOM();
    this.notifyFilterChange();
  }

  /**
   * DOM에 필터 적용
   */
  applyFiltersToDOM() {
    Object.keys(this.filters).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = this.filters[key];
        } else {
          element.value = this.filters[key];
        }
      }
    });
  }

  /**
   * 필터 변경 처리
   */
  handleFilterChange() {
    const newFilters = this.getCurrentFilters();
    const hasChanged = this.hasFiltersChanged(newFilters);

    if (hasChanged) {
      this.filters = newFilters;
      this.saveFilters();
      this.notifyFilterChange();
    }
  }

  /**
   * 필터 변경 여부 확인
   */
  hasFiltersChanged(newFilters) {
    return JSON.stringify(this.filters) !== JSON.stringify(newFilters);
  }

  /**
   * 필터 변경 알림
   */
  notifyFilterChange() {
    this.filterChangeCallbacks.forEach((callback) => {
      try {
        callback(this.filters);
      } catch (error) {
        console.error('필터 변경 콜백 오류:', error);
      }
    });
  }

  /**
   * 필터 변경 이벤트 리스너 등록
   */
  onFilterChange(callback) {
    this.filterChangeCallbacks.push(callback);
  }

  /**
   * 필터 변경 이벤트 리스너 제거
   */
  offFilterChange(callback) {
    const index = this.filterChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.filterChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * 필터 저장
   */
  saveFilters() {
    try {
      localStorage.setItem(
        'youtubeHotFinder_filters',
        JSON.stringify(this.filters)
      );
    } catch (error) {
      console.error('필터 저장 오류:', error);
    }
  }

  /**
   * 저장된 필터 로드
   */
  loadSavedFilters() {
    try {
      const savedFilters = localStorage.getItem('youtubeHotFinder_filters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        this.filters = { ...this.filters, ...parsedFilters };
        this.applyFiltersToDOM();
      }
    } catch (error) {
      console.error('저장된 필터 로드 오류:', error);
    }
  }

  /**
   * 필터 초기화
   */
  resetFilters() {
    this.filters = this.getDefaultFilters();
    this.applyFiltersToDOM();
    this.saveFilters();
    this.notifyFilterChange();
  }

  /**
   * 특정 필터 초기화
   */
  resetFilter(key) {
    if (this.filters.hasOwnProperty(key)) {
      this.filters[key] = this.getDefaultFilters()[key];
      this.applyFiltersToDOM();
      this.saveFilters();
      this.notifyFilterChange();
    }
  }

  /**
   * 필터 유효성 검사
   */
  validateFilters() {
    const errors = [];

    // 최소 조회수 검사
    if (this.filters.minViews < 0) {
      errors.push('최소 조회수는 0 이상이어야 합니다.');
    }

    // 최소 시간당 조회수 검사
    if (this.filters.minViewsPerHour < 0) {
      errors.push('최소 시간당 조회수는 0 이상이어야 합니다.');
    }

    // 쇼츠 기준 시간 검사
    if (this.filters.shortsDuration < 1 || this.filters.shortsDuration > 3600) {
      errors.push('쇼츠 기준 시간은 1초 이상 3600초 이하여야 합니다.');
    }

    // 최대 결과 수 검사
    if (this.filters.maxResults < 1 || this.filters.maxResults > 200) {
      errors.push('최대 결과 수는 1개 이상 200개 이하여야 합니다.');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * 필터 프리셋 저장
   */
  saveFilterPreset(name, filters) {
    try {
      const presets = this.getFilterPresets();
      presets[name] = {
        filters: filters,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(
        'youtubeHotFinder_filterPresets',
        JSON.stringify(presets)
      );
    } catch (error) {
      console.error('필터 프리셋 저장 오류:', error);
    }
  }

  /**
   * 필터 프리셋 로드
   */
  loadFilterPreset(name) {
    try {
      const presets = this.getFilterPresets();
      if (presets[name]) {
        this.setFilters(presets[name].filters);
        return true;
      }
      return false;
    } catch (error) {
      console.error('필터 프리셋 로드 오류:', error);
      return false;
    }
  }

  /**
   * 필터 프리셋 목록 가져오기
   */
  getFilterPresets() {
    try {
      const presets = localStorage.getItem('youtubeHotFinder_filterPresets');
      return presets ? JSON.parse(presets) : {};
    } catch (error) {
      console.error('필터 프리셋 목록 가져오기 오류:', error);
      return {};
    }
  }

  /**
   * 필터 프리셋 삭제
   */
  deleteFilterPreset(name) {
    try {
      const presets = this.getFilterPresets();
      delete presets[name];
      localStorage.setItem(
        'youtubeHotFinder_filterPresets',
        JSON.stringify(presets)
      );
    } catch (error) {
      console.error('필터 프리셋 삭제 오류:', error);
    }
  }

  /**
   * 필터 내보내기
   */
  exportFilters() {
    return JSON.stringify(this.filters, null, 2);
  }

  /**
   * 필터 가져오기
   */
  importFilters(filtersJson) {
    try {
      const importedFilters = JSON.parse(filtersJson);
      this.setFilters(importedFilters);
      return true;
    } catch (error) {
      console.error('필터 가져오기 오류:', error);
      return false;
    }
  }

  /**
   * 필터 통계 가져오기
   */
  getFilterStats() {
    const presets = this.getFilterPresets();
    return {
      totalPresets: Object.keys(presets).length,
      currentFilters: this.filters,
      lastModified: new Date().toISOString(),
    };
  }

  /**
   * 고급 필터 옵션 설정
   */
  setAdvancedFilters(options) {
    const advancedFilters = {
      publishedAfter: options.publishedAfter,
      publishedBefore: options.publishedBefore,
      categoryId: options.categoryId,
      regionCode: options.regionCode,
      relevanceLanguage: options.relevanceLanguage,
      order: options.order,
    };

    this.filters = { ...this.filters, ...advancedFilters };
    this.saveFilters();
    this.notifyFilterChange();
  }

  /**
   * 날짜 범위 필터 설정
   */
  setDateRange(startDate, endDate) {
    this.filters.publishedAfter = startDate;
    this.filters.publishedBefore = endDate;
    this.saveFilters();
    this.notifyFilterChange();
  }

  /**
   * 카테고리 필터 설정
   */
  setCategory(categoryId) {
    this.filters.categoryId = categoryId;
    this.saveFilters();
    this.notifyFilterChange();
  }

  /**
   * 정렬 순서 설정
   */
  setOrder(order) {
    this.filters.order = order;
    this.saveFilters();
    this.notifyFilterChange();
  }
}
