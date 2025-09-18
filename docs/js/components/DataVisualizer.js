/**
 * DataVisualizer - 데이터 시각화
 * 차트 및 그래프를 통한 데이터 시각화
 */

class DataVisualizer {
  constructor() {
    this.charts = new Map();
    this.chartOptions = this.getDefaultChartOptions();
  }

  /**
   * 기본 차트 옵션 반환
   */
  getDefaultChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    };
  }

  /**
   * 데이터 시각화 초기화
   */
  init() {
    console.log('DataVisualizer 초기화 완료');
  }

  /**
   * 조회수 랭킹 차트 생성
   */
  createViewsRankingChart(containerId, data) {
    try {
      const ctx = document.getElementById(containerId);
      if (!ctx) {
        console.error('차트 컨테이너를 찾을 수 없습니다:', containerId);
        return;
      }

      // 기존 차트 제거
      if (this.charts.has(containerId)) {
        this.charts.get(containerId).destroy();
      }

      const chartData = {
        labels: data.map((item) => item.title.substring(0, 30) + '...'),
        datasets: [
          {
            label: '조회수',
            data: data.map((item) => item.viewCount),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      };

      const options = {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            ...this.chartOptions.plugins.title,
            text: '조회수 랭킹 TOP 10',
          },
        },
      };

      const chart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: options,
      });

      this.charts.set(containerId, chart);
      console.log('조회수 랭킹 차트 생성 완료');
    } catch (error) {
      console.error('조회수 랭킹 차트 생성 오류:', error);
    }
  }

  /**
   * 좋아요 랭킹 차트 생성
   */
  createLikesRankingChart(containerId, data) {
    try {
      const ctx = document.getElementById(containerId);
      if (!ctx) {
        console.error('차트 컨테이너를 찾을 수 없습니다:', containerId);
        return;
      }

      // 기존 차트 제거
      if (this.charts.has(containerId)) {
        this.charts.get(containerId).destroy();
      }

      const chartData = {
        labels: data.map((item) => item.title.substring(0, 30) + '...'),
        datasets: [
          {
            label: '좋아요',
            data: data.map((item) => item.likeCount),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      };

      const options = {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            ...this.chartOptions.plugins.title,
            text: '좋아요 랭킹 TOP 10',
          },
        },
      };

      const chart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: options,
      });

      this.charts.set(containerId, chart);
      console.log('좋아요 랭킹 차트 생성 완료');
    } catch (error) {
      console.error('좋아요 랭킹 차트 생성 오류:', error);
    }
  }

  /**
   * 핫 스코어 차트 생성
   */
  createHotScoreChart(containerId, data) {
    try {
      const ctx = document.getElementById(containerId);
      if (!ctx) {
        console.error('차트 컨테이너를 찾을 수 없습니다:', containerId);
        return;
      }

      // 기존 차트 제거
      if (this.charts.has(containerId)) {
        this.charts.get(containerId).destroy();
      }

      const chartData = {
        labels: data.map((item) => item.title.substring(0, 30) + '...'),
        datasets: [
          {
            label: '핫 스코어',
            data: data.map((item) => item.hotScore || 0),
            backgroundColor: 'rgba(255, 206, 86, 0.6)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
          },
        ],
      };

      const options = {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            ...this.chartOptions.plugins.title,
            text: '핫 스코어 랭킹 TOP 10',
          },
        },
      };

      const chart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: options,
      });

      this.charts.set(containerId, chart);
      console.log('핫 스코어 차트 생성 완료');
    } catch (error) {
      console.error('핫 스코어 차트 생성 오류:', error);
    }
  }

  /**
   * 시간대별 조회수 트렌드 차트 생성
   */
  createViewsTrendChart(containerId, data) {
    try {
      const ctx = document.getElementById(containerId);
      if (!ctx) {
        console.error('차트 컨테이너를 찾을 수 없습니다:', containerId);
        return;
      }

      // 기존 차트 제거
      if (this.charts.has(containerId)) {
        this.charts.get(containerId).destroy();
      }

      // 시간대별 데이터 처리
      const timeData = this.processTimeData(data);

      const chartData = {
        labels: timeData.labels,
        datasets: [
          {
            label: '조회수',
            data: timeData.values,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true,
          },
        ],
      };

      const options = {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            ...this.chartOptions.plugins.title,
            text: '시간대별 조회수 트렌드',
          },
        },
      };

      const chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options,
      });

      this.charts.set(containerId, chart);
      console.log('시간대별 조회수 트렌드 차트 생성 완료');
    } catch (error) {
      console.error('시간대별 조회수 트렌드 차트 생성 오류:', error);
    }
  }

  /**
   * 채널별 영상 수 파이 차트 생성
   */
  createChannelVideoCountPieChart(containerId, data) {
    try {
      const ctx = document.getElementById(containerId);
      if (!ctx) {
        console.error('차트 컨테이너를 찾을 수 없습니다:', containerId);
        return;
      }

      // 기존 차트 제거
      if (this.charts.has(containerId)) {
        this.charts.get(containerId).destroy();
      }

      // 채널별 데이터 처리
      const channelData = this.processChannelData(data);

      const chartData = {
        labels: channelData.labels,
        datasets: [
          {
            data: channelData.values,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FF6384',
              '#C9CBCF',
              '#4BC0C0',
              '#FF6384',
            ],
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: '채널별 영상 수 분포',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
        },
      };

      const chart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: options,
      });

      this.charts.set(containerId, chart);
      console.log('채널별 영상 수 파이 차트 생성 완료');
    } catch (error) {
      console.error('채널별 영상 수 파이 차트 생성 오류:', error);
    }
  }

  /**
   * 시간 데이터 처리
   */
  processTimeData(data) {
    const timeMap = new Map();

    data.forEach((video) => {
      const publishedAt = new Date(video.publishedAt);
      const hour = publishedAt.getHours();

      if (!timeMap.has(hour)) {
        timeMap.set(hour, 0);
      }
      timeMap.set(hour, timeMap.get(hour) + video.viewCount);
    });

    const sortedEntries = Array.from(timeMap.entries()).sort(
      (a, b) => a[0] - b[0]
    );

    return {
      labels: sortedEntries.map(([hour]) => `${hour}시`),
      values: sortedEntries.map(([, views]) => views),
    };
  }

  /**
   * 채널 데이터 처리
   */
  processChannelData(data) {
    const channelMap = new Map();

    data.forEach((video) => {
      const channelTitle = video.channelTitle;

      if (!channelMap.has(channelTitle)) {
        channelMap.set(channelTitle, 0);
      }
      channelMap.set(channelTitle, channelMap.get(channelTitle) + 1);
    });

    const sortedEntries = Array.from(channelMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // 상위 10개 채널만

    return {
      labels: sortedEntries.map(([channel]) => channel),
      values: sortedEntries.map(([, count]) => count),
    };
  }

  /**
   * 차트 업데이트
   */
  updateChart(containerId, newData) {
    const chart = this.charts.get(containerId);
    if (chart) {
      chart.data = newData;
      chart.update();
    }
  }

  /**
   * 차트 제거
   */
  destroyChart(containerId) {
    const chart = this.charts.get(containerId);
    if (chart) {
      chart.destroy();
      this.charts.delete(containerId);
    }
  }

  /**
   * 모든 차트 제거
   */
  destroyAllCharts() {
    this.charts.forEach((chart, containerId) => {
      chart.destroy();
    });
    this.charts.clear();
  }

  /**
   * 차트 옵션 업데이트
   */
  updateChartOptions(newOptions) {
    this.chartOptions = { ...this.chartOptions, ...newOptions };
  }

  /**
   * 반응형 차트 컨테이너 생성
   */
  createChartContainer(containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('차트 컨테이너를 찾을 수 없습니다:', containerId);
      return;
    }

    container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h6 class="card-title mb-0">${title}</h6>
                </div>
                <div class="card-body">
                    <div class="chart-container" style="position: relative; height: 400px;">
                        <canvas id="${containerId}_canvas"></canvas>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * 통계 요약 생성
   */
  createStatsSummary(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('통계 요약 컨테이너를 찾을 수 없습니다:', containerId);
      return;
    }

    const stats = this.calculateStats(data);

    container.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-primary">${stats.totalVideos}</h5>
                            <p class="card-text">총 영상 수</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-success">${this.formatNumber(stats.totalViews)}</h5>
                            <p class="card-text">총 조회수</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-warning">${this.formatNumber(stats.totalLikes)}</h5>
                            <p class="card-text">총 좋아요</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-info">${stats.uniqueChannels}</h5>
                            <p class="card-text">고유 채널 수</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * 통계 계산
   */
  calculateStats(data) {
    const totalVideos = data.length;
    const totalViews = data.reduce((sum, video) => sum + video.viewCount, 0);
    const totalLikes = data.reduce((sum, video) => sum + video.likeCount, 0);
    const uniqueChannels = new Set(data.map((video) => video.channelTitle))
      .size;

    return {
      totalVideos,
      totalViews,
      totalLikes,
      uniqueChannels,
    };
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
}
