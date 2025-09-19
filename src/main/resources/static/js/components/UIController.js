/**
 * UIController - 사용자 인터페이스 제어
 * DOM 조작 및 UI 업데이트를 담당하는 클래스
 */

class UIController {
  constructor() {
    this.alertContainer = null;
    this.resultsContainer = null;
  }

  /**
   * UI 컨트롤러 초기화
   */
  init() {
    this.createAlertContainer();
    this.setupEventListeners();
    console.log('UIController 초기화 완료');
  }

  /**
   * 알림 컨테이너 생성
   */
  createAlertContainer() {
    if (!document.getElementById('alertContainer')) {
      const alertContainer = document.createElement('div');
      alertContainer.id = 'alertContainer';
      alertContainer.className = 'position-fixed top-0 end-0 p-3';
      alertContainer.style.zIndex = '9999';
      document.body.appendChild(alertContainer);
    }
    this.alertContainer = document.getElementById('alertContainer');
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 창 크기 변경 이벤트
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // 키보드 이벤트
    document.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });
  }

  /**
   * 알림 표시
   */
  showAlert(message, type = 'info', duration = 5000) {
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${this.getAlertIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

    this.alertContainer.insertAdjacentHTML('beforeend', alertHtml);

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        this.removeAlert(alertId);
      }, duration);
    }

    return alertId;
  }

  /**
   * 모달창으로 오류 메시지 표시
   */
  showErrorModal(title, message) {
    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('errorModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modalHtml = `
      <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="errorModalLabel">
                <i class="fas fa-exclamation-triangle me-2"></i>${title}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger" data-bs-dismiss="modal">확인</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bootstrap 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();

    // 모달이 닫힐 때 DOM에서 제거
    document
      .getElementById('errorModal')
      .addEventListener('hidden.bs.modal', function () {
        this.remove();
      });
  }

  /**
   * 알림 아이콘 반환
   */
  getAlertIcon(type) {
    const icons = {
      success: 'check-circle',
      danger: 'exclamation-triangle',
      warning: 'exclamation-circle',
      info: 'info-circle',
    };
    return icons[type] || 'info-circle';
  }

  /**
   * 알림 제거
   */
  removeAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
      alert.remove();
    }
  }

  /**
   * 채널 탭 표시
   */
  showChannelTab() {
    console.log('채널 탭 활성화');
    // 채널 탭 관련 UI 업데이트
  }

  /**
   * 키워드 탭 표시
   */
  showKeywordTab() {
    console.log('키워드 탭 활성화');
    // 키워드 탭 관련 UI 업데이트
  }

  /**
   * 설정 탭 표시
   */
  showSettingsTab() {
    console.log('설정 탭 활성화');
    // 설정 탭 관련 UI 업데이트
  }

  /**
   * 채널 검색 결과 표시
   */
  displayChannelResults(results) {
    const container = document.getElementById('channelResults');
    if (!container) return;

    if (!results || results.length === 0) {
      container.innerHTML =
        '<p class="text-muted text-center">검색 결과가 없습니다.</p>';
      return;
    }

    const resultsHtml = results
      .map(
        (channel, index) => `
            <div class="search-result-item fade-in channel-result-item" 
                 style="animation-delay: ${index * 0.1}s; cursor: pointer;" 
                 data-channel-id="${channel.id}"
                 onclick="window.youtubeHotFinder.openYouTubeChannel('${channel.id}')">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${channel.thumbnail}" alt="${channel.title}" class="img-fluid rounded">
                    </div>
                    <div class="col-md-8">
                        <h6 class="mb-1">${channel.title}</h6>
                        <p class="text-muted mb-1">${channel.description || '설명 없음'}</p>
                        <div class="video-stats">
                            <span class="stat-item">
                                <i class="fas fa-users"></i>
                                구독자: ${this.formatNumber(channel.subscriberCount)}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-video"></i>
                                영상: ${this.formatNumber(channel.videoCount)}
                            </span>
                            <span class="stat-item">
                                <i class="fas fa-eye"></i>
                                조회수: ${this.formatNumber(channel.viewCount)}
                            </span>
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <i class="fas fa-external-link-alt text-muted"></i>
                    </div>
                </div>
            </div>
        `
      )
      .join('');

    container.innerHTML = resultsHtml;
  }

  /**
   * 검색 결과 표시
   */
  displaySearchResults(results, sortManager = null) {
    try {
      console.log('검색 결과 표시 시작:', results);
      const container = document.getElementById('searchResults');
      if (!container) {
        console.error('searchResults 컨테이너를 찾을 수 없습니다.');
        return;
      }

      if (!results || results.length === 0) {
        container.innerHTML =
          '<p class="text-muted text-center">검색 결과가 없습니다.</p>';
        return;
      }

      // 정렬 적용 (검색 결과 영역의 정렬 옵션 사용)
      let sortedResults = results;
      if (sortManager) {
        const sortBy = document.getElementById('resultSortBy')?.value;
        const sortOrder = document.getElementById('resultSortOrder')?.value;

        // 정렬 기준과 순서가 모두 선택된 경우에만 정렬 적용
        if (sortBy && sortOrder) {
          sortedResults = sortManager.sortData(results, sortBy, sortOrder);
          console.log('정렬 적용됨:', {
            sortBy,
            sortOrder,
            originalCount: results.length,
            sortedCount: sortedResults.length,
          });
        } else {
          console.log('정렬 옵션이 선택되지 않아 원본 순서 유지');
        }
      }

      // 기존 내용 제거
      container.innerHTML = '';

      // 카드 형태로 표시 (테이블 대신)
      const resultsHtml = sortedResults
        .map(
          (video, index) => `
        <div class="card mb-3 video-row" data-video-id="${video.id}" style="cursor: pointer;">
          <div class="card-body">
            <!-- 데스크톱 레이아웃 -->
            <div class="row align-items-center d-none d-lg-flex">
              <div class="col-1 text-center">
                <div class="ranking-number ${index < 3 ? 'top-3' : ''}">
                  ${index + 1}
                </div>
              </div>
              <div class="col-2 text-center">
                <div class="thumbnail-container position-relative d-inline-block">
                  <img src="${video.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMiAyNEg0OFYzNkgzMlYyNFoiIGZpbGw9IiNDQ0MiLz4KPHBhdGggZD0iTTI4IDQwSDUyVjQ0SDI4VjQwWiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'}" 
                       alt="${video.title}" 
                       class="img-fluid rounded" 
                       style="width: 80px; height: 60px; object-fit: cover;"
                       onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMiAyNEg0OFYzNkgzMlYyNFoiIGZpbGw9IiNDQ0MiLz4KPHBhdGggZD0iTTI4IDQwSDUyVjQ0SDI4VjQwWiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'">
                  <div class="play-button position-absolute top-50 start-50 translate-middle">
                    <i class="fas fa-play-circle text-white" style="font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);"></i>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div class="video-info">
                  <h6 class="mb-1 text-truncate video-title" title="${video.title}">
                    ${video.title}
                  </h6>
                  <small class="text-muted text-truncate-2 video-description d-block mt-1">
                    ${video.description || ''}
                  </small>
                </div>
              </div>
              <div class="col-2">
                <small class="text-truncate channel-name" title="${video.channelTitle}">
                  ${video.channelTitle}
                </small>
              </div>
              <div class="col-3">
                <div class="row g-1">
                  <div class="col-3 text-center">
                    <small class="text-muted d-block">조회수</small>
                    <small class="view-count fw-bold">${this.formatNumber(video.viewCount)}</small>
                  </div>
                  <div class="col-3 text-center">
                    <small class="text-muted d-block">좋아요</small>
                    <small class="like-count fw-bold">${this.formatNumber(video.likeCount)}</small>
                  </div>
                  <div class="col-3 text-center">
                    <small class="text-muted d-block">시간</small>
                    <small class="duration fw-bold">${this.formatDuration(video.duration)}</small>
                  </div>
                  <div class="col-3 text-center">
                    <small class="text-muted d-block">구독자</small>
                    <small class="subscriber-count fw-bold">${this.formatNumber(video.subscriberCount)}</small>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 모바일/태블릿 레이아웃 -->
            <div class="d-lg-none">
              <div class="row align-items-start">
                <div class="col-2 text-center">
                  <div class="ranking-number ${index < 3 ? 'top-3' : ''}">
                    ${index + 1}
                  </div>
                </div>
                <div class="col-4 text-center">
                  <div class="thumbnail-container position-relative d-inline-block">
                    <img src="${video.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMiAyNEg0OFYzNkgzMlYyNFoiIGZpbGw9IiNDQ0MiLz4KPHBhdGggZD0iTTI4IDQwSDUyVjQ0SDI4VjQwWiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'}" 
                         alt="${video.title}" 
                         class="img-fluid rounded" 
                         style="width: 60px; height: 45px; object-fit: cover;"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMiAyNEg0OFYzNkgzMlYyNFoiIGZpbGw9IiNDQ0MiLz4KPHBhdGggZD0iTTI4IDQwSDUyVjQ0SDI4VjQwWiIgZmlsbD0iI0NDQyIvPgo8L3N2Zz4K'">
                    <div class="play-button position-absolute top-50 start-50 translate-middle">
                      <i class="fas fa-play-circle text-white" style="font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);"></i>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="video-info">
                    <h6 class="mb-1 text-truncate video-title" title="${video.title}" style="font-size: 0.9rem;">
                      ${video.title}
                    </h6>
                    <small class="text-muted text-truncate channel-name d-block" title="${video.channelTitle}">
                      ${video.channelTitle}
                    </small>
                  </div>
                </div>
              </div>
              <div class="row mt-2">
                <div class="col-12">
                  <div class="row g-2">
                    <div class="col-3 text-center">
                      <small class="text-muted d-block" style="font-size: 0.7rem;">조회수</small>
                      <small class="view-count fw-bold" style="font-size: 0.8rem;">${this.formatNumber(video.viewCount)}</small>
                    </div>
                    <div class="col-3 text-center">
                      <small class="text-muted d-block" style="font-size: 0.7rem;">좋아요</small>
                      <small class="like-count fw-bold" style="font-size: 0.8rem;">${this.formatNumber(video.likeCount)}</small>
                    </div>
                    <div class="col-3 text-center">
                      <small class="text-muted d-block" style="font-size: 0.7rem;">시간</small>
                      <small class="duration fw-bold" style="font-size: 0.8rem;">${this.formatDuration(video.duration)}</small>
                    </div>
                    <div class="col-3 text-center">
                      <small class="text-muted d-block" style="font-size: 0.7rem;">구독자</small>
                      <small class="subscriber-count fw-bold" style="font-size: 0.8rem;">${this.formatNumber(video.subscriberCount)}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
        )
        .join('');

      container.innerHTML = resultsHtml;

      // 클릭 이벤트 리스너 추가
      this.addVideoClickListeners();

      console.log('검색 결과 표시 완료');
    } catch (error) {
      console.error('검색 결과 표시 중 오류:', error);
      const container = document.getElementById('searchResults');
      if (container) {
        container.innerHTML =
          '<p class="text-danger text-center">검색 결과 표시 중 오류가 발생했습니다.</p>';
      }
    }
  }

  /**
   * API 상태 업데이트
   */
  updateApiStatus(status) {
    const statusElement = document.getElementById('apiStatus');
    if (!statusElement) return;
    statusElement.className = 'alert alert-info';
    statusElement.textContent = '프론트엔드 직접 호출 모드';
  }

  /**
   * 로딩 상태 표시
   */
  showLoading(elementId, message = '로딩 중...') {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
                <div class="text-center py-4">
                    <div class="loading-spinner mb-3"></div>
                    <p class="text-muted">${message}</p>
                </div>
            `;
    }
  }

  /**
   * 폼 유효성 검사
   */
  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        this.highlightError(field);
        isValid = false;
      } else {
        this.clearError(field);
      }
    });

    return isValid;
  }

  /**
   * 필드 오류 강조
   */
  highlightError(field) {
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
  }

  /**
   * 필드 오류 제거
   */
  clearError(field) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
  }

  /**
   * 숫자 포맷팅
   */
  formatNumber(num) {
    if (!num) return '0';

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * 날짜 포맷팅
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '1일 전';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (diffDays < 30) {
      return `${Math.ceil(diffDays / 7)}주 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  }

  /**
   * 인기도 점수 포맷팅
   */
  formatHotScore(score) {
    if (!score || score === 0) return '0';

    if (score >= 1000000) {
      return (score / 1000000).toFixed(1) + 'M';
    } else if (score >= 1000) {
      return (score / 1000).toFixed(1) + 'K';
    } else {
      return score.toFixed(1);
    }
  }

  /**
   * 영상 시간 포맷팅
   */
  formatDuration(duration) {
    if (!duration) return '0:00';

    // ISO 8601 duration을 초 단위로 변환
    const seconds = this.parseDurationToSeconds(duration);

    if (seconds === 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * ISO 8601 duration을 초 단위로 변환
   */
  parseDurationToSeconds(duration) {
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
   * 비디오 클릭 이벤트 리스너 추가
   */
  addVideoClickListeners() {
    const videoRows = document.querySelectorAll('.video-row');
    console.log('비디오 행 개수:', videoRows.length);

    videoRows.forEach((row, index) => {
      const videoId = row.getAttribute('data-video-id');
      console.log(`행 ${index + 1} 비디오 ID:`, videoId);

      row.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('비디오 클릭됨:', videoId);

        if (videoId) {
          this.openYouTubeVideo(videoId);
        } else {
          console.error('비디오 ID가 없습니다.');
        }
      });

      // 호버 효과
      row.addEventListener('mouseenter', () => {
        row.style.backgroundColor = '#f8f9fa';
        row.style.cursor = 'pointer';
      });

      row.addEventListener('mouseleave', () => {
        row.style.backgroundColor = '';
      });
    });
  }

  /**
   * YouTube 비디오 열기
   */
  openYouTubeVideo(videoId) {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log('YouTube URL:', youtubeUrl);
    window.open(youtubeUrl, '_blank');
  }

  /**
   * 창 크기 변경 처리
   */
  handleResize() {
    // 반응형 처리
    this.adjustLayout();
  }

  /**
   * 레이아웃 조정
   */
  adjustLayout() {
    const isMobile = window.innerWidth < 768;

    // 모바일에서 테이블을 카드 형태로 변경
    if (isMobile) {
      this.convertTableToCards();
    } else {
      this.convertCardsToTable();
    }
  }

  /**
   * 테이블을 카드로 변환
   */
  convertTableToCards() {
    const tables = document.querySelectorAll('.table-responsive table');
    tables.forEach((table) => {
      if (table.dataset.converted !== 'true') {
        // 카드 변환 로직
        table.dataset.converted = 'true';
      }
    });
  }

  /**
   * 카드를 테이블로 변환
   */
  convertCardsToTable() {
    // 테이블 변환 로직
  }

  /**
   * 키보드 이벤트 처리
   */
  handleKeydown(e) {
    // Enter 키로 검색
    if (e.key === 'Enter' && e.target.matches('input[type="text"]')) {
      const activeTab = document.querySelector('.nav-link.active');
      if (activeTab) {
        const targetTab = activeTab.getAttribute('data-bs-target');
        if (targetTab === '#channel') {
          document.getElementById('searchChannelBtn').click();
        } else if (targetTab === '#keyword') {
          document.getElementById('searchKeywordBtn').click();
        }
      }
    }

    // ESC 키로 모달 닫기
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal.show');
      modals.forEach((modal) => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      });
    }
  }

  /**
   * 툴팁 초기화
   */
  initTooltips() {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  /**
   * 팝오버 초기화
   */
  initPopovers() {
    const popoverTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="popover"]')
    );
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }

  /**
   * 채널 분석 결과 표시
   */
  displayChannelAnalysis(analysis) {
    const container = document.getElementById('searchResults');
    if (!container) {
      console.error('검색 결과 컨테이너를 찾을 수 없습니다.');
      return;
    }

    // 기존 내용 제거
    container.innerHTML = '';

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
                          <h3 class="text-primary mb-1">${this.formatNumber(analysis.subscriberCount)}</h3>
                          <p class="mb-0 text-muted">구독자</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="card bg-light">
                        <div class="card-body text-center">
                          <h3 class="text-success mb-1">${this.formatNumber(analysis.videoCount)}</h3>
                          <p class="mb-0 text-muted">비디오</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="card bg-light">
                        <div class="card-body text-center">
                          <h3 class="text-warning mb-1">${this.formatNumber(analysis.viewCount)}</h3>
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
                          생성일: ${this.formatDate(analysis.publishedAt)}
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
    console.log('채널 분석 결과 표시 완료');
  }
}
