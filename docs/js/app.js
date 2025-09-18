/**
 * YouTube Hot Finder - Main Application
 * 메인 애플리케이션 진입점
 */

// 모든 클래스들이 전역 스코프에서 사용 가능하다고 가정

class YouTubeHotFinder {
  constructor() {
    this.stateManager = new StateManager();
    this.uiController = new UIController();
    this.searchManager = new SearchManager();
    this.apiManager = new APIManager();
    this.filterManager = new FilterManager();
    this.dataVisualizer = new DataVisualizer();

    this.init();
  }

  /**
   * 애플리케이션 초기화
   */
  async init() {
    try {
      console.log('YouTube Hot Finder 초기화 중...');

      // 상태 관리자 초기화
      await this.stateManager.init();

      // UI 컨트롤러 초기화
      this.uiController.init();

      // 이벤트 리스너 등록
      this.setupEventListeners();

      // application.properties에서 기본 API 키 로드 시도
      await this.apiManager.preloadKeyFromProperties();

      // 초기 데이터 로드
      await this.loadInitialData();

      console.log('YouTube Hot Finder 초기화 완료');
    } catch (error) {
      console.error('초기화 중 오류 발생:', error);
      this.showError('애플리케이션 초기화 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 탭 전환 이벤트
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
      tab.addEventListener('shown.bs.tab', (e) => {
        this.handleTabChange(e.target.getAttribute('data-bs-target'));
      });
    });

    // 검색 버튼 이벤트
    document
      .getElementById('searchChannelBtn')
      ?.addEventListener('click', () => {
        this.handleChannelSearch();
      });

    document
      .getElementById('searchKeywordBtn')
      ?.addEventListener('click', () => {
        this.handleKeywordSearch();
      });

    // 설정 저장 버튼 이벤트
    document
      .getElementById('saveApiKeyBtn')
      ?.addEventListener('click', async () => {
        const isValid = await this.apiManager.validateApiKey();
        if (isValid) {
          this.showSuccess('API 키가 적용되었습니다. (저장되지 않음)');
        } else {
          this.showError('유효한 API 키를 입력해주세요.');
        }
      });

    document
      .getElementById('saveSettingsBtn')
      ?.addEventListener('click', () => {
        this.handleSaveSettings();
      });

    // 대기 스킵 버튼 이벤트
    document.getElementById('skipWaitBtn')?.addEventListener('click', () => {
      this.handleSkipWait();
    });

    // 필터 변경 이벤트
    this.filterManager.onFilterChange((filters) => {
      this.handleFilterChange(filters);
    });

    // 폼 입력 이벤트
    this.setupFormEventListeners();
  }

  /**
   * 폼 입력 이벤트 리스너 설정
   */
  setupFormEventListeners() {
    const formElements = [
      'executionMode',
      'daysToAnalyze',
      'maxSearchesPerChannel',
      'minViewsPerHour',
      'apiWaitTime',
      'videoType',
      'targetCountry',
      'maxSearchesPerKeyword',
      'shortsDuration',
      'language',
      'minViews',
    ];

    formElements.forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.addEventListener('change', () => {
          this.handleFormChange();
        });
      }
    });
  }

  /**
   * 탭 변경 처리
   */
  handleTabChange(targetTab) {
    console.log('탭 변경:', targetTab);

    switch (targetTab) {
      case '#channel':
        this.uiController.showChannelTab();
        break;
      case '#keyword':
        this.uiController.showKeywordTab();
        break;
      case '#settings':
        this.uiController.showSettingsTab();
        break;
    }
  }

  /**
   * 채널 검색 처리
   */
  async handleChannelSearch() {
    const channelHandle = document.getElementById('channelHandle').value.trim();

    if (!channelHandle) {
      this.showError('채널 핸들명을 입력해주세요.');
      return;
    }

    try {
      this.showLoading('채널 검색 중...');

      const results = await this.searchManager.searchChannel(channelHandle);

      this.uiController.displayChannelResults(results);
      this.hideLoading();
    } catch (error) {
      console.error('채널 검색 오류:', error);
      this.hideLoading();

      if (error.message === 'API_KEY_INVALID') {
        this.showApiKeyErrorModal(
          'YouTube API 키가 유효하지 않습니다. API 키를 확인해주세요.'
        );
      } else if (error.message === 'QUOTA_EXCEEDED') {
        this.showApiKeyErrorModal(
          'YouTube API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요.'
        );
      } else {
        this.showError('채널 검색 중 오류가 발생했습니다.');
      }
    }
  }

  /**
   * 키워드 검색 처리
   */
  async handleKeywordSearch() {
    const keyword = document.getElementById('searchKeyword').value.trim();

    if (!keyword) {
      this.showError('검색 키워드를 입력해주세요.');
      return;
    }

    try {
      this.showLoading('키워드 검색 중...');
      console.log('키워드 검색 시작:', keyword);

      const filters = this.filterManager.getCurrentFilters();
      console.log('필터 설정:', filters);

      const results = await this.searchManager.searchKeyword(keyword, filters);
      console.log('검색 결과 받음:', results);

      this.uiController.displaySearchResults(results);
      console.log('검색 결과 표시 완료');

      this.hideLoading();
      console.log('로딩 숨김 완료');
    } catch (error) {
      console.error('키워드 검색 오류:', error);
      this.hideLoading();

      if (error.message === 'API_KEY_INVALID') {
        this.showApiKeyErrorModal(
          'YouTube API 키가 유효하지 않습니다. API 키를 확인해주세요.'
        );
      } else if (error.message === 'QUOTA_EXCEEDED') {
        this.showApiKeyErrorModal(
          'YouTube API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요.'
        );
      } else {
        this.showError('키워드 검색 중 오류가 발생했습니다.');
      }
    }
  }

  /**
   * API 키 저장 처리
   */
  async handleSaveApiKey() {}

  /**
   * 설정 저장 처리
   */
  async handleSaveSettings() {
    try {
      const settings = this.getCurrentSettings();
      await this.stateManager.saveSettings(settings);
      this.showSuccess('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 오류:', error);
      this.showError('설정 저장 중 오류가 발생했습니다.');
    }
  }

  /**
   * 대기 스킵 처리
   */
  async handleSkipWait() {
    try {
      await this.apiManager.skipWait();
      this.showSuccess('대기가 스킵되었습니다.');
      this.updateApiStatus();
    } catch (error) {
      console.error('대기 스킵 오류:', error);

      // API 키 전환 관련 오류인 경우 특별한 메시지 표시
      if (
        error.message &&
        error.message.includes('전환할 수 있는 API 키가 없습니다')
      ) {
        this.showError(
          'API 키가 1개만 등록되어 있어 키 전환이 불가능합니다. 추가 API 키를 등록하세요.'
        );
      } else {
        this.showError('대기 스킵 중 오류가 발생했습니다.');
      }
    }
  }

  /**
   * 필터 변경 처리
   */
  handleFilterChange(filters) {
    console.log('필터 변경:', filters);
    this.stateManager.updateFilters(filters);
  }

  /**
   * 폼 변경 처리
   */
  handleFormChange() {
    const settings = this.getCurrentSettings();
    this.stateManager.updateSearchSettings(settings);
  }

  /**
   * 현재 설정값 가져오기
   */
  getCurrentSettings() {
    return {
      executionMode: document.getElementById('executionMode').value,
      daysToAnalyze: parseInt(document.getElementById('daysToAnalyze').value),
      maxSearchesPerChannel: parseInt(
        document.getElementById('maxSearchesPerChannel').value
      ),
      minViewsPerHour: parseFloat(
        document.getElementById('minViewsPerHour').value
      ),
      apiWaitTime: parseInt(document.getElementById('apiWaitTime').value),
      videoType: document.getElementById('videoType').value,
      targetCountry: document.getElementById('targetCountry').value,
      maxSearchesPerKeyword: parseInt(
        document.getElementById('maxSearchesPerKeyword').value
      ),
      shortsDuration: parseInt(document.getElementById('shortsDuration').value),
      language: document.getElementById('language').value,
      minViews: parseInt(document.getElementById('minViews').value),
      showPopularByChannel: document.getElementById('showPopularByChannel')
        .checked,
    };
  }

  /**
   * 초기 데이터 로드
   */
  async loadInitialData() {
    try {
      const savedSettings = await this.stateManager.getSettings();
      if (savedSettings) {
        this.applySettings(savedSettings);
      }
    } catch (error) {
      console.error('초기 데이터 로드 오류:', error);
    }
  }

  /**
   * 설정 적용
   */
  applySettings(settings) {
    Object.keys(settings).forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = settings[key];
        } else {
          element.value = settings[key];
        }
      }
    });
  }

  /**
   * API 상태 업데이트
   */
  async updateApiStatus() {}

  /**
   * 로딩 표시
   */
  showLoading(message = '로딩 중...') {
    try {
      console.log('로딩 표시 시작:', message);
      const overlay = document.getElementById('loadingOverlay');
      const messageElement = document.getElementById('loadingMessage');

      if (overlay && messageElement) {
        messageElement.textContent = message;
        overlay.style.display = 'flex';
        console.log('로딩 오버레이 표시 완료');
      } else {
        console.error(
          'loadingOverlay 또는 loadingMessage 엘리먼트를 찾을 수 없습니다.'
        );
      }
    } catch (error) {
      console.error('로딩 표시 오류:', error);
    }
  }

  /**
   * 로딩 숨기기
   */
  hideLoading() {
    try {
      console.log('로딩 숨기기 시작');

      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.style.display = 'none';
        console.log('로딩 오버레이 숨김 완료');
      } else {
        console.error('loadingOverlay 엘리먼트를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('로딩 숨기기 오류:', error);
    }
  }

  /**
   * 성공 메시지 표시
   */
  showSuccess(message) {
    this.uiController.showAlert(message, 'success');
  }

  /**
   * 오류 메시지 표시
   */
  showError(message) {
    this.uiController.showAlert(message, 'danger');
  }

  /**
   * API 키 오류 모달 표시
   */
  showApiKeyErrorModal(message) {
    this.uiController.showErrorModal('API 키 오류', message);
  }

  /**
   * 채널 분석
   */
  async analyzeChannel(channelId) {
    try {
      console.log('채널 분석 시작:', channelId);
      await this.searchManager.analyzeChannel(channelId);
    } catch (error) {
      console.error('채널 분석 오류:', error);
      this.showError('채널 분석 중 오류가 발생했습니다.');
    }
  }

  /**
   * YouTube 채널 열기
   */
  openYouTubeChannel(channelId) {
    try {
      const youtubeUrl = `https://www.youtube.com/channel/${channelId}`;
      console.log('YouTube 채널 열기:', youtubeUrl);
      window.open(youtubeUrl, '_blank');
    } catch (error) {
      console.error('YouTube 채널 열기 오류:', error);
      this.showError('YouTube 채널을 열 수 없습니다.');
    }
  }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
  window.youtubeHotFinder = new YouTubeHotFinder();
});
