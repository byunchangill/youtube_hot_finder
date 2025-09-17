/**
 * APIManager - API 관리
 * YouTube Data API 키 관리 및 상태 모니터링
 */

class APIManager {
  constructor() {
    this.baseUrl = '/api';
    this.apiKeys = [];
    this.currentKeyIndex = 0;
    this.quotaUsage = new Map();
    this.waitUntil = null;
  }

  /**
   * API 매니저 초기화
   */
  async init() {
    try {
      await this.loadApiKeys();
      await this.loadQuotaUsage();
      console.log('APIManager 초기화 완료');
    } catch (error) {
      console.error('APIManager 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * API 키 저장
   */
  async saveApiKey(apiKey) {
    try {
      console.log('API 키 저장 중...');

      // API 키 유효성 검사
      const isValid = await this.validateApiKey(apiKey);
      if (!isValid) {
        throw new Error('유효하지 않은 API 키입니다.');
      }

      const response = await fetch(`${this.baseUrl}/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: apiKey,
          name: `API Key ${Date.now()}`,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();

      // 로컬 캐시 업데이트
      this.apiKeys.push(data);

      console.log('API 키 저장 완료');
      return data;
    } catch (error) {
      console.error('API 키 저장 오류:', error);
      throw error;
    }
  }

  /**
   * API 키 유효성 검사
   */
  async validateApiKey(apiKey) {
    try {
      const response = await fetch(`${this.baseUrl}/validate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: apiKey }),
      });

      return response.ok;
    } catch (error) {
      console.error('API 키 유효성 검사 오류:', error);
      return false;
    }
  }

  /**
   * API 키 목록 가져오기
   */
  async loadApiKeys() {
    try {
      const response = await fetch(`${this.baseUrl}/keys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.apiKeys = data;

      console.log('API 키 목록 로드 완료:', this.apiKeys.length, '개');
    } catch (error) {
      console.error('API 키 목록 로드 오류:', error);
      this.apiKeys = [];
    }
  }

  /**
   * 현재 사용 가능한 API 키 가져오기
   */
  getCurrentApiKey() {
    if (this.apiKeys.length === 0) {
      throw new Error('사용 가능한 API 키가 없습니다.');
    }

    // 대기 중인 경우
    if (this.waitUntil && Date.now() < this.waitUntil) {
      throw new Error('API 키 대기 중입니다.');
    }

    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * 다음 API 키로 전환
   */
  switchToNextKey() {
    if (this.apiKeys.length <= 1) {
      throw new Error(
        `전환할 수 있는 API 키가 없습니다. (현재 키 개수: ${this.apiKeys.length})`
      );
    }

    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    console.log(
      `다음 API 키로 전환: ${this.currentKeyIndex + 1}/${this.apiKeys.length}`
    );
  }

  /**
   * API 키 삭제
   */
  async deleteApiKey(keyId) {
    try {
      const response = await fetch(`${this.baseUrl}/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 로컬 캐시에서 제거
      this.apiKeys = this.apiKeys.filter((key) => key.id !== keyId);

      // 현재 키 인덱스 조정
      if (this.currentKeyIndex >= this.apiKeys.length) {
        this.currentKeyIndex = 0;
      }

      console.log('API 키 삭제 완료');
      return true;
    } catch (error) {
      console.error('API 키 삭제 오류:', error);
      throw error;
    }
  }

  /**
   * 쿼터 사용량 업데이트
   */
  async updateQuotaUsage(keyId, usage) {
    try {
      const response = await fetch(`${this.baseUrl}/quota`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyId: keyId,
          usage: usage,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 로컬 캐시 업데이트
      this.quotaUsage.set(keyId, {
        usage: usage,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('쿼터 사용량 업데이트 오류:', error);
    }
  }

  /**
   * 쿼터 사용량 로드
   */
  async loadQuotaUsage() {
    try {
      const response = await fetch(`${this.baseUrl}/quota`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.quotaUsage = new Map(data.map((item) => [item.keyId, item]));
    } catch (error) {
      console.error('쿼터 사용량 로드 오류:', error);
      this.quotaUsage = new Map();
    }
  }

  /**
   * API 상태 가져오기
   */
  async getStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
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
      console.error('API 상태 가져오기 오류:', error);
      return {
        status: 'error',
        message: 'API 상태를 확인할 수 없습니다.',
        waitUntil: null,
        quotaUsage: {},
      };
    }
  }

  /**
   * 대기 스킵
   */
  async skipWait() {
    try {
      const response = await fetch(`${this.baseUrl}/skip-wait`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 로컬 상태 업데이트
      this.waitUntil = null;

      // API 키 전환 시도 (전환할 키가 없으면 스킵)
      try {
        this.switchToNextKey();
        console.log('API 키 전환 완료');
      } catch (switchError) {
        console.warn('API 키 전환 실패:', switchError.message);
        // API 키 전환 실패는 치명적이지 않으므로 계속 진행
      }

      console.log('대기 스킵 완료');
      return data;
    } catch (error) {
      console.error('대기 스킵 오류:', error);
      throw error;
    }
  }

  /**
   * 대기 시간 설정
   */
  setWaitTime(minutes) {
    this.waitUntil = Date.now() + minutes * 60 * 1000;
    console.log('대기 시간 설정:', minutes, '분');
  }

  /**
   * 대기 시간 확인
   */
  getWaitTimeRemaining() {
    if (!this.waitUntil) {
      return 0;
    }

    const remaining = this.waitUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // 분 단위
  }

  /**
   * 쿼터 사용량 확인
   */
  getQuotaUsage(keyId) {
    const usage = this.quotaUsage.get(keyId);
    return usage ? usage.usage : 0;
  }

  /**
   * 쿼터 한도 확인
   */
  isQuotaExceeded(keyId) {
    const usage = this.getQuotaUsage(keyId);
    return usage >= 10000; // YouTube API 일일 한도
  }

  /**
   * API 키 통계 가져오기
   */
  async getApiKeyStats() {
    try {
      const response = await fetch(`${this.baseUrl}/keys/stats`, {
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
      console.error('API 키 통계 가져오기 오류:', error);
      throw error;
    }
  }

  /**
   * API 키 순환
   */
  async rotateApiKeys() {
    try {
      const response = await fetch(`${this.baseUrl}/keys/rotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.currentKeyIndex = data.currentIndex;

      console.log('API 키 순환 완료');
      return data;
    } catch (error) {
      console.error('API 키 순환 오류:', error);
      throw error;
    }
  }

  /**
   * API 키 상태 모니터링 시작
   */
  startMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkApiKeyStatus();
      } catch (error) {
        console.error('API 키 상태 모니터링 오류:', error);
      }
    }, 60000); // 1분마다 체크

    console.log('API 키 상태 모니터링 시작');
  }

  /**
   * API 키 상태 모니터링 중지
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('API 키 상태 모니터링 중지');
    }
  }

  /**
   * API 키 상태 확인
   */
  async checkApiKeyStatus() {
    try {
      const status = await this.getStatus();

      if (status.status === 'quota_exceeded') {
        this.setWaitTime(status.waitMinutes || 30);
      } else if (status.status === 'ready') {
        this.waitUntil = null;
      }
    } catch (error) {
      console.error('API 키 상태 확인 오류:', error);
    }
  }
}
