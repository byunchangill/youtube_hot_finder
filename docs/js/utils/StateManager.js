/**
 * StateManager - 애플리케이션 상태 관리
 * LocalStorage를 활용한 상태 관리 클래스
 */

class StateManager {
  constructor() {
    this.storageKey = 'youtubeHotFinder';
    this.state = this.getDefaultState();
  }

  /**
   * 기본 상태값 반환
   */
  getDefaultState() {
    return {
      searchMode: 'keyword', // 'channel' | 'keyword'
      filters: {
        videoType: 'both', // 'shorts' | 'normal' | 'both'
        country: 'KR',
        language: 'ko',
        minViews: 20000,
        minViewsPerHour: 600,
        shortsDuration: 180,
      },
      searchSettings: {
        daysToAnalyze: 10,
        maxSearchesPerChannel: 10,
        maxSearchesPerKeyword: 50,
        apiWaitTime: 30,
      },
      results: [],
      apiStatus: 'ready', // 'ready' | 'waiting' | 'error'
      lastSearch: null,
      userSettings: {
        defaultLanguage: 'ko',
        defaultCountry: 'KR',
        theme: 'light',
      },
    };
  }

  /**
   * 상태 관리자 초기화
   */
  async init() {
    try {
      const savedState = this.loadFromStorage();
      if (savedState) {
        this.state = { ...this.state, ...savedState };
      }
      console.log('StateManager 초기화 완료');
    } catch (error) {
      console.error('StateManager 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * 현재 상태 반환
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 특정 상태값 반환
   */
  getStateValue(key) {
    return this.state[key];
  }

  /**
   * 상태 업데이트
   */
  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.saveToStorage();
  }

  /**
   * 필터 업데이트
   */
  updateFilters(filters) {
    this.state.filters = { ...this.state.filters, ...filters };
    this.saveToStorage();
  }

  /**
   * 검색 설정 업데이트
   */
  updateSearchSettings(settings) {
    this.state.searchSettings = { ...this.state.searchSettings, ...settings };
    this.saveToStorage();
  }

  /**
   * 사용자 설정 업데이트
   */
  updateUserSettings(settings) {
    this.state.userSettings = { ...this.state.userSettings, ...settings };
    this.saveToStorage();
  }

  /**
   * 검색 결과 저장
   */
  saveResults(results, searchType) {
    this.state.results = results;
    this.state.lastSearch = {
      type: searchType,
      timestamp: new Date().toISOString(),
      resultCount: results.length,
    };
    this.saveToStorage();
  }

  /**
   * API 상태 업데이트
   */
  updateApiStatus(status) {
    this.state.apiStatus = status;
    this.saveToStorage();
  }

  /**
   * 검색 모드 변경
   */
  setSearchMode(mode) {
    this.state.searchMode = mode;
    this.saveToStorage();
  }

  /**
   * 설정 저장
   */
  async saveSettings(settings) {
    this.updateUserSettings(settings);
    return Promise.resolve();
  }

  /**
   * 설정 로드
   */
  async getSettings() {
    return this.state.userSettings;
  }

  /**
   * 검색 기록 가져오기
   */
  getSearchHistory() {
    const history = this.loadFromStorage('searchHistory') || [];
    return history;
  }

  /**
   * 검색 기록 저장
   */
  saveSearchHistory(searchQuery, searchType) {
    const history = this.getSearchHistory();
    const newEntry = {
      query: searchQuery,
      type: searchType,
      timestamp: new Date().toISOString(),
    };

    // 중복 제거
    const filteredHistory = history.filter(
      (entry) => !(entry.query === searchQuery && entry.type === searchType)
    );

    // 최신 항목을 맨 앞에 추가
    filteredHistory.unshift(newEntry);

    // 최대 50개까지만 저장
    const limitedHistory = filteredHistory.slice(0, 50);

    this.saveToStorage(limitedHistory, 'searchHistory');
  }

  /**
   * 즐겨찾기 채널 가져오기
   */
  getFavoriteChannels() {
    return this.loadFromStorage('favoriteChannels') || [];
  }

  /**
   * 즐겨찾기 채널 추가
   */
  addFavoriteChannel(channelInfo) {
    const favorites = this.getFavoriteChannels();
    const exists = favorites.some((fav) => fav.id === channelInfo.id);

    if (!exists) {
      favorites.push({
        ...channelInfo,
        addedAt: new Date().toISOString(),
      });
      this.saveToStorage(favorites, 'favoriteChannels');
    }
  }

  /**
   * 즐겨찾기 채널 제거
   */
  removeFavoriteChannel(channelId) {
    const favorites = this.getFavoriteChannels();
    const filtered = favorites.filter((fav) => fav.id !== channelId);
    this.saveToStorage(filtered, 'favoriteChannels');
  }

  /**
   * LocalStorage에 저장
   */
  saveToStorage(data = this.state, key = this.storageKey) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('LocalStorage 저장 오류:', error);
    }
  }

  /**
   * LocalStorage에서 로드
   */
  loadFromStorage(key = this.storageKey) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('LocalStorage 로드 오류:', error);
      return null;
    }
  }

  /**
   * 특정 키 삭제
   */
  removeFromStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage 삭제 오류:', error);
    }
  }

  /**
   * 모든 데이터 초기화
   */
  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem('searchHistory');
      localStorage.removeItem('favoriteChannels');
      this.state = this.getDefaultState();
    } catch (error) {
      console.error('데이터 초기화 오류:', error);
    }
  }

  /**
   * 상태 변경 이벤트 리스너
   */
  onStateChange(callback) {
    this.stateChangeCallback = callback;
  }

  /**
   * 상태 변경 알림
   */
  notifyStateChange() {
    if (this.stateChangeCallback) {
      this.stateChangeCallback(this.getState());
    }
  }

  /**
   * 상태 검증
   */
  validateState() {
    const requiredKeys = ['filters', 'searchSettings', 'userSettings'];
    const isValid = requiredKeys.every(
      (key) => this.state[key] && typeof this.state[key] === 'object'
    );

    if (!isValid) {
      console.warn('상태 검증 실패, 기본값으로 재설정');
      this.state = this.getDefaultState();
    }

    return isValid;
  }

  /**
   * 상태 백업
   */
  exportState() {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * 상태 복원
   */
  importState(stateJson) {
    try {
      const importedState = JSON.parse(stateJson);
      this.state = { ...this.getDefaultState(), ...importedState };
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('상태 복원 오류:', error);
      return false;
    }
  }
}
