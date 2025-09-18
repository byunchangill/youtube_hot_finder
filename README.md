# YouTube Hot Finder

유튜브 인기/트렌딩 영상을 키워드/채널 기준으로 손쉽게 검색·랭킹하는 순수 프런트엔드 웹 앱입니다. GitHub Pages로 배포되며, YouTube Data API v3를 직접 호출합니다.

## 📦 현재 상태 (중요)

- 보안: 공개 레포에는 API 키가 커밋되지 않습니다. GitHub Actions가 Secrets에서 배포 시점에 `docs/application.properties`를 생성합니다.

## ✨ 주요 기능

- **키워드 검색**: 입력한 키워드로 영상 검색 후 카드 목록으로 표시
- **채널 검색(@handle)**: 채널 정보/통계를 조회
- **필터**: 영상 유형(쇼츠/롱폼/둘다), 국가, 언어, 최소 조회수, 시간당 조회수, 쇼츠 기준 길이 등
- **랭킹/정렬**: 조회수/좋아요/댓글/커스텀 핫스코어로 정렬
- **YouTube로 연결**: 영상/채널을 새 탭으로 열기

## 🗂 디렉터리 구조 (요약)

```
youtube_hot_finder/
├── src/main/resources/static/           # 정적 웹 소스(개발 소스)
│   ├── index.html
│   └── js/
│       ├── app.js
│       ├── components/
│       ├── services/
│       └── utils/
└── docs/                                # Pages 배포 산출물(액션으로 생성)
```

## 🚀 로컬 실행

1. 단순히 파일로 열기

- `src/main/resources/static/index.html`을 브라우저로 엽니다.
- 팁: CORS 문제를 피하려면 간단 서버 사용 권장

2. 간단 HTTP 서버 사용 예

```bash
cd src/main/resources/static
npx http-server -p 8080
# http://localhost:8080
```

3. API 키 주입(로컬)

- `src/main/resources/application.properties`에 다음 키를 설정합니다.
  - `youtube.api.default-key=YOUR_YOUTUBE_API_KEY`
- 또는 브라우저 콘솔에서 임시 주입:

```js
window.__YOUTUBE_API_KEY__ = 'YOUR_YOUTUBE_API_KEY';
```

## 🌐 GitHub Pages 배포 (Actions + Secrets)

1. 레포 Secrets 등록

- 레포 Settings → Secrets and variables → Actions → New repository secret
- Name: `YOUTUBE_API_KEY`
- Value: 본인 YouTube Data API v3 키

2. Pages 설정

- Settings → Pages → Build and deployment: “GitHub Actions” 선택

3. 워크플로우

- `.github/workflows/pages.yml`가 커밋되어 있습니다.
- 푸시 시 Actions가 실행되어 `docs/`를 만들고 `docs/application.properties`에 키를 주입하여 배포합니다.

## 🔐 보안 권장 설정(GCP)

- 키 제한: YouTube Data API v3만 허용
- HTTP Referrer 제한: `https://byunchangill.github.io/youtube_hot_finder/*`
- 키 로테이션/사용량 알림 설정 권장

## ⚠️ 문제 해결

- API_KEY_MISSING: `application.properties`가 배포되지 않았거나 키가 비어있음 → Secrets 설정/Actions 로그 확인
- 404(application.properties): Pages 캐시/전파 지연 → 수 분 후 새로고침(Ctrl+F5), Actions 성공 여부 확인
- QUOTA_EXCEEDED: 키 쿼터 초과 → 잠시 후 재시도 또는 다른 키 사용

## 🧩 기술 스택

- Vanilla JS(ES6+), Bootstrap 5, Fetch API, Chart.js
- 배포: GitHub Pages + GitHub Actions(Artifacts → Pages 배포)

## 📄 라이선스

MIT (필요 시 `LICENSE` 추가/수정)

## 🔗 레포

`https://github.com/byunchangill/youtube_hot_finder`
