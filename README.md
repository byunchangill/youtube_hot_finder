# YouTube Hot Finder

유튜브 인기 영상 랭킹 분석 플랫폼

## 📋 프로젝트 개요

YouTube Hot Finder는 유튜브 영상의 실시간 인기도 및 트렌드를 분석하여 랭킹을 제공하는 웹 애플리케이션입니다. 채널별, 키워드별로 인기 영상을 검색하고 분석할 수 있습니다.

## 🎯 주요 기능

### 검색 및 필터링

- **채널 핸들명 검색**: 특정 채널의 인기 영상 분석
- **키워드 기반 검색**: 특정 키워드로 영상 검색 및 랭킹
- **다양한 필터 옵션**:
  - 쇼츠/일반 영상 구분 (봄/쇼츠/둘다)
  - 대상 국가 설정
  - 언어 설정 (기본값: ko)
  - 최소 조회수 설정 (기본값: 20,000)
  - 시간당 최소 조회수 설정 (기본값: 600)
  - 쇼츠 기준 시간 (기본값: 180초)

### 분석 설정

- **실행 모드**: 다양한 분석 모드 제공
- **분석 기간**: 최근 며칠간의 영상 분석 (기본값: 10일)
- **검색 제한**:
  - 채널당 최대 검색 수 (기본값: 10)
  - 키워드당 최대 검색 수 (기본값: 50)
- **API 관리**: YouTube Data API 키 관리 및 쿼터 모니터링
- **대기 시간**: API 키 쿼터 소진 시 대기시간 (기본값: 30분)

### 결과 표시 및 랭킹

- **인기 영상 랭킹**: 조회수, 좋아요, 댓글 수 기반 랭킹
- **채널별 인기 영상**: 채널 내에서 가장 인기 있는 영상 표시
- **실시간 업데이트**: 주기적인 데이터 갱신
- **API 키 상태**: 대기 상태 모니터링

## 🛠 기술 스택

### 프론트엔드

- **Core**: Vanilla JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **차트 라이브러리**: Chart.js
- **HTTP 클라이언트**: Fetch API
- **상태 관리**: LocalStorage + Custom State Manager

### 백엔드

- **Framework**: Spring Boot
- **Database**: MySQL
- **API**: RESTful API
- **외부 API**: YouTube Data API v3
- **스케줄링**: Spring Scheduler

### 개발 도구

- **빌드 도구**: Webpack
- **코드 품질**: ESLint, Prettier
- **버전 관리**: Git
- **패키지 관리**: npm

## 📁 프로젝트 구조

```
youtubehotfinder/
├── src/
│   ├── main/
│   │   ├── java/ (Spring Boot 백엔드)
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   │   ├── components/
│   │       │   │   ├── services/
│   │       │   │   ├── utils/
│   │       │   │   └── app.js
│   │       │   └── index.html
│   │       └── templates/
│   └── test/
├── package.json
├── webpack.config.js
└── README.md
```

## 🚀 설치 및 실행

### 필요 조건

- Node.js (v16+)
- Java 11+
- Maven
- MySQL

### 설치 방법

1. **저장소 클론**

```bash
git clone [repository-url]
cd youtubehotfinder
```

2. **프론트엔드 의존성 설치**

```bash
npm install
```

3. **Spring Boot 애플리케이션 실행**

```bash
./mvnw spring-boot:run
```

4. **웹 브라우저에서 접속**

```
http://localhost:8080
```

## 📊 데이터베이스 설계

### 주요 테이블

- **channels**: 채널 정보
- **videos**: 영상 정보
- **search_logs**: 검색 로그
- **api_keys**: API 키 관리
- **user_settings**: 사용자 설정

## 🔧 개발 단계

### Phase 1: 기본 구조 및 UI (2주)

- [x] HTML/CSS 기본 구조
- [x] JavaScript 모듈 시스템 구축
- [ ] 기본 UI 컴포넌트 구현
- [ ] Spring Boot API 엔드포인트 생성

### Phase 2: 검색 기능 구현 (3주)

- [ ] YouTube API 연동
- [ ] 검색 로직 구현
- [ ] 필터링 기능
- [ ] 결과 표시

### Phase 3: 고급 기능 및 최적화 (2주)

- [ ] 랭킹 알고리즘
- [ ] 데이터 시각화
- [ ] 성능 최적화
- [ ] 에러 처리

## 📝 API 문서

### YouTube Data API v3

- **Search**: 영상 검색
- **Videos**: 영상 상세 정보
- **Channels**: 채널 정보

### 내부 API

- `GET /api/search/channel/{handle}`: 채널 검색
- `GET /api/search/keyword/{keyword}`: 키워드 검색
- `GET /api/ranking`: 랭킹 데이터
- `POST /api/settings`: 설정 저장

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/username/youtubehotfinder](https://github.com/username/youtubehotfinder)

## 🙏 감사의 말

- YouTube Data API v3
- Bootstrap
- Chart.js
- Spring Boot
