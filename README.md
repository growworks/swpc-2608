# 학교복지진흥사회적협동조합 (swpc)

학교복지진흥사회적협동조합 공식 홈페이지 + 대문(학교복지×교원투데이 통합 랜딩).
컨펌된 데모 2종을 Next.js 16(App Router) + ISR로 100% 이식하고, growworks 공개 API(`cwc` 테넌트)에 연동했다.

- 도메인: https://coach.cwc.or.kr (학교 홈), https://coach.cwc.or.kr/intro (대문)
- API 명세: `D:\projectClaude\growworks-web-admin\docs\api\openapi-cwc.yaml`
- 원본 데모:
  - 학교: `(학교)클라이언트_전달용/index.html` (해시 라우팅 SPA 통합본)
  - 대문: `(대문)학교복지+교원투데이 랜딩페이지_데모_전달용/학교복지진흥사회적협동조합_통합메인페이지.html`

## 실행

```bash
npm run dev
```

## 배포 (Vercel)

도메인 존(cwc.or.kr)의 네임서버가 외부 DNS(DNSZi)에 있어 Cloudflare Workers 커스텀 도메인을
쓸 수 없다(존이 Cloudflare 에 있어야 함). Vercel 은 외부 DNS 의 CNAME 레코드만으로
커스텀 도메인·SSL 이 연결되므로 Vercel 로 배포한다.
(이전 Cloudflare Workers + OpenNext 구성은 커밋 dbd0f3b 참조 — 존 이전 시 복원 가능.)

- **깃 연동**: Vercel 대시보드 → Add New… → Project → Import `growworks/swpc-2608`.
  Framework 가 Next.js 로 자동 감지되므로 빌드 설정은 기본값 그대로 둔다.
  이후 main 푸시마다 자동 배포된다.
- **환경변수**: 코드 기본값이 운영값과 동일해 대시보드 설정 없이 동작한다(.env.example 참고).
  값을 바꿀 때만 Settings → Environment Variables 에 등록.
- **커스텀 도메인**: 프로젝트 → Settings → Domains → `coach.cwc.or.kr` 추가 후,
  DNSZi(cwc.or.kr DNS 관리)에 레코드 추가: `coach  CNAME  cname.vercel-dns.com`.
  전파되면 SSL 인증서가 자동 발급된다.
- **리전**: [vercel.json](vercel.json) `regions: ["icn1"]` — SSR/ISR 함수를 서울 리전에서 실행.
- ISR/fetch 캐시는 Vercel 기본 인프라를 그대로 쓴다(별도 구성 없음).

환경변수는 `.env.example`를 복사해 `.env.local`로 쓴다.

| 키 | 용도 |
| --- | --- |
| `SITE_SLUG` | 테넌트 slug (고정값 `cwc`) |
| `API_BASE_URL` | 서버(SSR/ISR) 페치용 — 게시판·설정 |
| `NEXT_PUBLIC_API_BASE_URL` | 브라우저 직접 호출용 — 회원 인증·문의 접수 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 절대 URL (메타·sitemap) |

## API 연동 범위

| 화면 | API | 상태 |
| --- | --- | --- |
| 소식 목록/상세 | `GET /cwc/posts?category=공지사항`·`활동소식` **각각 호출 + 서버 페이징**, `GET /cwc/posts/{id}` | 연동 완료 |
| 투명공시 목록/상세 | `GET /cwc/posts?category=경영공시`·`기부금공시` **각각 호출 + 서버 페이징**, `GET /cwc/posts/{id}` | 연동 완료 |
| 홈 활동소식 4건 / 대문 공지 4건 | `GET /cwc/posts?...&limit=N` | 연동 완료 |
| 푸터·후원계좌·오시는 길 | `GET /cwc/settings` | 연동 완료 (폴백 있음) |
| 후원 신청 | `POST /cwc/contact` (+로그인 시 Bearer → 회원 자동 연결) | 연동 완료, **실서버 E2E 검증** |
| 마이페이지 후원 신청 내역 | `GET /cwc/my/contacts` (상태 배지 4종) | 연동 완료 — 단 CORS 미허용이라 `/api/my/contacts` 프록시 경유 |
| 로그인·가입·마이페이지·비밀번호 재설정·동의 보완 | `POST/GET /cwc/members/*` | 연동 완료, **실서버 E2E 검증** (가입→내정보→탈퇴) |
| 기부금 영수증 내역 | - | v1 범위 밖 (서버 리소스 없음) → "준비 중" 안내 |
| 교육프로그램·FAQ·6대 사업·정관/인가증·히어로 | - | API v1 범위 밖 → 프론트 상수 유지 |

### 카테고리 이름 (확정)

카테고리는 **접두 없는 단일 이름**을 쓴다: `공지사항` `활동소식` `경영공시` `기부금공시`.
명세 초안의 `분류/세부` 2단 컨벤션(`소식/공지사항` 등) 대신 어드민에 등록된 실제 분류
이름과 일치시키기로 확정(2026-08-10). 접두 일치 조회는 쓰지 않으며 게시판별로 각각 호출한다.
openapi-cwc.yaml 은 아직 2단 컨벤션으로 기술돼 있으므로 서버 문서 갱신이 필요하다.

### custom 필드 키 (명세 3판 기준)

키는 시맨틱 이름이 아니라 카테고리별 `field_1`/`field_2` **일반 키**이며, 같은 키라도
카테고리마다 타입·의미가 다르다. 파서는 [posts.ts](src/lib/api/posts.ts)에 있고 category 로 분기한다.

| 카테고리 | 키 | 의미 |
| --- | --- | --- |
| 활동소식 | `field_1` (string) / `field_2` (**image[]**) / `field_3` (string) | 구분 배지 / **사진 목록(URL 문자열 배열)** / 이미지 설명 — `field_2[0]` 이 카드 썸네일 겸 상세 대표 사진, 2번째부터는 상세 사진 뷰어에서 넘겨 본다. field_3 은 대표 사진 기준 한 문장이고 2번째부터의 `설명 2`·`설명 3` 은 [activityMeta](src/lib/api/posts.ts)가 자동 생성한다 |
| 경영공시 | `field_1` (file[]) | `{url, name, size바이트}` 배열 — 크기는 프론트에서 `215.9KB` 형식으로 포맷 |
| 기부금공시 | `field_1` (image) | 첨부 내역서 1장 |

## 서버 실측 이슈 (2026-08-10 갱신)

1. ~~cwc 테넌트 콘텐츠 0건~~ → **활동소식 이관 완료**(2026-08-20, 아래 "활동소식 콘텐츠 이관" 참고).
   어드민 등록은 게시일이 등록 당일로 고정되므로 과거 게시일은 `createdAt` 을 지정하는
   DB 직결 시드로만 보존된다. 공지사항·공시는 어드민 입력분을 그대로 쓴다.
2. **`/cwc/settings` 빈 객체** — 어드민 미입력 상태라 프론트 폴백(데모 확정값)이 표시된다.
   어드민은 비운 항목을 `""` 로 저장하므로 폴백은 값 유무(`||` 상당)로 처리돼 있다.
3. ~~`/cwc/members/*` 미배포~~ → **배포 완료**(2026-08-10 실측). 에러 코드도 명세대로
   `INVALID_CREDENTIALS` 등 SCREAMING_SNAKE + 한국어 메시지로 내려온다.
   (client.ts 의 normalizeErrorCode 는 구형 문장형 코드도 흡수하므로 그대로 둔다.)
4. **`/cwc/my/contacts` 만 CORS 미허용** — `/members/me`·`/settings`·`/posts`·`/contact` 는
   브라우저 직접 호출이 되지만 이 엔드포인트만 `Access-Control-Allow-Origin` 이 없다.
   회원 인증 5종(rate limit 대상)이 아니므로 같은 오리진 Next 라우트
   [/api/my/contacts](src/app/api/my/contacts/route.ts) 로 프록시해 동작시켰다.
   **서버 CORS 가 열리면** contact.ts 의 `getMyContacts` 를 `apiFetchDirect` 직접 호출로 되돌리고 프록시를 제거하면 된다.
5. **`createdAt` 은 DB 벽시계 값 그대로** — 서버가 DB 에 저장된 벽시계(KST) 값을 라벨만 Z 로
   붙여 그대로 직렬화하기로 운영 확정(2026-08-10). 프론트 `formatPostDate` 는 시간대 변환 없이
   **문자열의 날짜 부분을 그대로 표기**한다(KST 변환 시 +9시간이 붙어 15시 이후 게시물이
   다음 날로 밀림). 서버가 진짜 UTC 순간을 내려주는 계약으로 바뀌면 KST 변환으로 되돌려야 한다.

### E2E 검증 기록 (2026-08-10, 실서버)

가입(3단계) → 토큰 발급·헤더 갱신 → 마이페이지(내정보 + 전화 역포맷 + 후원 내역 빈 상태)
→ 후원 신청(로그인 상태, 자동입력) → 내역 즉시 표시(`일시 후원 · 30,000원 · 접수됨` pill-navy)
→ 등급 "후원 회원" 승격 → `DELETE /members/me` 로 테스트 계정 탈퇴 정리까지 전부 통과.
테스트 신청 1건(id 59, 이름 "프론트연동테스트")은 어드민 문의함에 남아 있으므로 삭제 요망.

## 구조

```
src/
  app/
    layout.tsx          # 폰트·기본 메타
    globals.css         # 학교 데모 CSS verbatim (수정 금지)
    (school)/           # 학교 홈 전체 (레이아웃에서 조직 JSON-LD를 settings 기반으로 생성)
    intro/              # 대문 (독립 스코프 .route-intro + intro.css, 수정 금지)
    robots.ts, sitemap.ts
  components/
    layout/   Shell, Header, Footer(settings), MobileBar(settings), ClientEffects, Lightbox, Toast
    ui/       Tabbar, BoardPager(데모 .pg-* 규격), LiveBadge
    sections/ HeroSlider, NewsCard, FaqAccordion, KakaoMap, PhotoViewer(활동소식 사진 뷰어)
    forms/    DonateForm(contact API)
    auth/     LoginClient, SignupClient, MypageClient, ResetPasswordClient
  lib/
    constants.ts        # SITE_SLUG·API_BASE_URL·LIST_REVALIDATE
    site.ts             # 기관 상수 (settings 폴백 원본)
    auth.ts             # 회원 토큰 세션 저장소 (client only)
    data/               # v1 범위 밖 상수 (programs, faqs+biz6+menus)
    api/
      client.ts         # 공통 페치 + 에러코드 정규화 + 화면 문구 매핑
      posts.ts          # 게시판 + custom 파서 + 날짜/번호 헬퍼
      content.ts        # 화면용 파사드 (페이지 순회 포함)
      members.ts, contact.ts, settings.ts
public/archive          # 정관·인가증 등 v1 범위 밖 정적 자산
```

## 계약상 주의점 (코드에 반영된 것)

- **상세 URL 은 정수 PK** (`/news/12`, `/report/34`). 데모의 `n6`/`m2025` 문자열 id 는 폐기.
  공지/활동소식 분기는 응답 `category` 값으로 한다.
- **상세는 `force-dynamic`** — `GET /posts/{id}` 가 호출마다 `viewCount` 를 +1 하므로
  ISR 로 감싸면 조회수가 멈춘다. `generateMetadata` 와 본문이 각각 호출해 2씩 오르는 것은
  React `cache()` 로 요청당 1회로 묶어 막았다.
- **페이지 세그먼트 `revalidate` 는 리터럴만 가능** — Next 16 은 SWC AST 로 정적 추출해
  `export const revalidate = LIST_REVALIDATE` 같은 식별자를 만나면 빌드를 중단한다.
  `LIST_REVALIDATE` 는 fetch 옵션 전용이다.
- **에러는 HTTP status 가 아니라 `ApiError.code` 로 분기.** 특히 `UNAUTHORIZED`(재로그인)와
  `ACCOUNT_RESTRICTED`(이용 제한, 재로그인 유도 금지)를 구분하지 않으면 정지 계정이 무한 루프에 빠진다.
  상세 페이지도 `POST_NOT_FOUND` 일 때만 404 로 떨어뜨리고 나머지 장애는 그대로 던진다.
- **회원 인증은 브라우저 직접 호출** — rate limit 이 IP 단위라 Next 서버 프록시를 경유하면
  전 사용자가 한 IP 로 합산돼 429 가 난다. 문의 접수도 클라이언트에서 호출하므로 같은 경로를 쓴다.
- **목록 화면은 게시판별 각각 호출 + 서버 페이징.** 페이지 크기는 공지사항 10 · 활동소식 4 ·
  경영공시 5 · 기부금공시 5 (`content.ts` 의 `PAGE_SIZE`). 페이지 번호는 쿼리 파라미터
  (`/news?np=&ap=`, `/report?mp=&dp=`)로 받으며 — 한 화면에 게시판이 2개라 파라미터를 분리하고
  페이저 링크에 섹션 앵커를 붙인다. searchParams 를 읽는 /news·/report 는 동적 렌더이고
  데이터는 fetch 캐시(300초)를 탄다.
  페이저(BoardPager)는 총 1페이지 이하면 렌더되지 않아 데모 화면과 동일하게 유지된다.
- **이전/다음 글 계산은 100건 단위 페이지 순회** (`content.ts` 의 `fetchAll`). `limit` 최대가
  100 이라 순회 없이는 100건을 넘는 순간 이전/다음 링크가 조용히 사라진다.
- **활동소식은 조회수를 노출하지 않는다** (서버는 viewCount 를 내려주지만 화면 정책상 공지사항
  상세에만 표시 — 데모도 활동소식엔 조회수가 없었다).
- **`updatedAt` 은 수정 시각이 아니라 마지막 조회 시각**이라 sitemap `lastmod` 에 쓰지 않는다.
- **`settings` 는 빈 문자열로 올 수 있어** `??` 가 아니라 값 유무로 폴백한다.

### 지도 (카카오맵)

`/support` 오시는 길과 `/intro` Contact 의 지도 플레이스홀더를 카카오맵 JS SDK 로 교체했다
([KakaoMap.tsx](src/components/sections/KakaoMap.tsx), 키는 `NEXT_PUBLIC_KAKAO_MAP_KEY`).
settings 주소를 지오코딩해 마커를 찍으므로 어드민에서 주소를 바꾸면 지도도 따라간다.

- 학교(/support)는 `.map-box`, 대문(/intro)은 `.map-placeholder` 래퍼를 그대로 써서
  데모 스타일이 실지도에 적용된다 — 대문 지도는 데모 디자인대로 **흑백이었다가 호버 시 컬러**.
- 대문의 "지도로 보기" 버튼은 카카오맵 새 창(`map.kakao.com/link/search/...`)으로 연다.
- SDK 로드/지오코딩 실패 시 폴백: 학교=안내 문구, 대문=데모의 장식용 핀 마크업.

**카카오 개발자 콘솔에 웹 사이트 도메인 등록 필요**(developers.kakao.com → 앱 → 플랫폼 → Web).
`http://localhost:3422` 등록 확인·지도 정상 동작 실측 완료(2026-08-11).
**운영 배포 전 `https://coach.cwc.or.kr` 등록 필수.** 미등록 도메인은 401 `domain mismatched`.

### 정책 페이지 · SEO / 구조화 데이터 (2026-08-11)

- **/privacy(개인정보처리방침)·/terms(이용약관) 신설** — 실제 데이터 처리 실태 기반
  (주민등록번호 미수집 명시, 위탁=그로우웍스, localStorage 토큰·카카오맵 SDK 고지,
  조합원 사항은 정관 위임). 이메일무단수집거부는 /privacy#email-no-collect.
  학교·대문 푸터와 고객센터 정책 카드에서 연결. **표준 템플릿 기반 초안이므로 시행 전 기관 검토 권장.**
- **구조화 데이터(JSON-LD)**: 조직(NGO)+WebSite(학교 레이아웃·대문 공통, settings 기반),
  페이지별 BreadcrumbList, 게시판 목록 ItemList(현재 페이지 항목, 빈 게시판 생략),
  소식·공시 상세 Article(datePublished=YYYY-MM-DD 날짜부만 — DB 벽시계 정책),
  고객센터 FAQPage, 후원 DonateAction, 프로그램 WebPage. 빌더는 [src/lib/seo.ts](src/lib/seo.ts).
- **메타 정리**: 상세 description=본문 요약(stripHtml), 활동소식 og:image=썸네일,
  기부금공시 og:image=내역서, 인증 4페이지 고유 description+noindex.
  sitemap 에 /privacy·/terms 추가, lastmod=날짜부만. robots 는 /api/ 만 차단
  (noindex 페이지는 robots 로 막지 않아야 크롤러가 noindex 를 읽는다).

## 데모 개정본 반영 (2026-08-20)

기준 데모가 **2026-08-19 개정본**(3,243행)으로 바뀌어 아래를 이식했다. 고객 수정요청(PPTX) 반영분이다.

| 반영 | 내용 |
| --- | --- |
| CSS | `globals.css` 를 개정본 `<style>` 에서 재생성 — 치환 17곳(`body:not(.home)`→`.school-shell:not(.is-home)` 8, `body.p-*` 6, 이미지 경로 3)뿐이라 [rebuild 스크립트](scripts/)로 통째 갱신하는 편이 안전하다 |
| 연혁 | 단문 6줄 → 연도 9개·81줄 태그 표 ([history.ts](src/lib/data/history.ts), 데모에서 자동 추출). 최신순 정렬, `.hist-grid` 1컬럼 |
| 인사말 | 우측 사진이 3장 콜라주(`.greet-collage`)로 교체 + 캡션 신설, 이사장 사진 교체, 제목이 본문 컬럼 안으로 이동 |
| 참여하기 | 조합원 카드 5장(자원봉사 회원 추가), 협력·제휴 문구·4가치 카드 전면 교체 |
| 교육프로그램 | 비영리 대학 사진·문구 교체 + '지금 영업 중' [라이브 배지](src/components/ui/LiveBadge.tsx) |
| 홈 | 활동소식 3건 → 4건(2×2), "활동 소식 전체 보기" 버튼 추가 |
| 소식 상세 | 단일 사진 → [사진 뷰어](src/components/sections/PhotoViewer.tsx) (화살표·썸네일·키보드, 클릭 시 라이트박스 1.5배) |
| 페이저 | 데모 `.pg-*` 규격으로 교체 — 전체 건수 표시, 양 끝 화살표 자리 유지, 모바일에서 숫자 숨김 |
| 자산 | 신규 5장 반입, 콜라주로 대체된 `activity-collage.jpg` 제거 |

데모 자체의 미확정 항목(그대로 남김): 설립인가 연도 표기가 인사말은 "2015년", 연혁·공시는 "2014.12.19" 로 어긋난다.

## 데모 대비 의도적 변경

UI 는 100% 보존이 원칙이나, API 계약상 불가피하게 달라진 항목이다.

| 항목 | 변경 | 사유 |
| --- | --- | --- |
| 주민등록번호 관련 문구 | **전면 삭제**(홈 체크리스트·후원 안내박스·고객센터 카드·회원가입 동의·마이페이지·방침 6곳) | 사이트에 주민등록번호를 받는 입력 칸이 **하나도 없다**(회원가입=이름·이메일·연락처·비밀번호, 후원=이름·연락처·이메일·금액·내용). 처리하지 않는 항목은 개인정보처리방침 고지 대상이 아니고, 언급하는 순간 지켜야 할 주장만 생긴다. 데모는 5곳에서 언급하면서 3곳은 "수집한다"·2곳은 "수집/저장하지 않는다"로 서로 어긋나 있었다. 영수증은 기부자가 홈택스에서 직접 신청하므로 조합이 취급할 일이 없다는 안내만 남겼다 |
| 활동소식 사진 | `field_2` 를 image[] 로 운용 | 데모의 대표사진+갤러리를 한 배열로 담는다. 기존 문자열 값도 읽도록 파서가 두 형태를 모두 받는다 |
| 페이저 표시 조건 | 1페이지면 숨김 | 데모는 활동소식에만 페이저를 뒀는데 이 사이트는 네 게시판 모두 서버 페이징이라, 항상 그리면 데모에 없던 페이저가 공지·공시에 늘 뜬다 |
| 라이브 배지 링크 | 구글 세션 토큰 제거 | 데모 href 에 붙은 `sxsrf` 타임스탬프·`ved`·`uds` 는 만료되므로 질의 URL 만 남겼다 |
| 게시일 빈 값 | 요소째 생략 | 날짜를 못 읽으면 빈 `<p>` 가 남아 카드 높이가 어긋난다(데모와 동일 동작) |
| 회원가입 단계 | 4단계 → 3단계 (이메일 인증 제거) | 서버에 인증 발송·검증 API 없음 |
| 로그인 5회 실패 잠금 | 제거 | 서버에 실패 카운트 없음 (IP rate limit 만 존재) |
| 로그인 데모 계정 안내 박스 | 제거 | 실서비스 계정이 아님 |
| 비밀번호 찾기 | `/reset-password` 신규 | 서버 재설정 링크가 이 경로로 옴 (token 이 URL fragment 라 클라이언트에서 파싱) |
| 마이페이지 현재 비밀번호 필드 | 추가 | 서버가 `currentPassword` 필수 |
| 마이페이지 약관 동의 섹션 | 추가 | 어드민 수동 등록 계정은 `consentRequired: true` 로 와서 보완 필요 |
| 후원 접수번호 표시 | 제거 | contact 응답에 접수 id 가 없음 |
| 후원 mailto 발송 버튼 | 제거 | contact API 가 운영자 알림을 자동 발송 |
| 마이페이지 후원 내역 | 실연동 (`GET /my/contacts`, 상태 배지 접수됨/검토중/완료/보류) | 명세 3판에서 조회 API 신설 |
| 마이페이지 영수증 내역 | 준비 중 안내 유지 | 영수증 리소스가 서버에 없음 (v1 범위 밖) |
| 비밀번호 변경 후 재로그인 | 추가 | 변경/재설정 시 기존 토큰 전부 무효화(명세) — 성공 시 로그인 화면으로 이동 |
| 공시 상세 "작성 {이름}" 표기 | 제거 | 작성자 커스텀 필드 없음 (필요 시 본문에 기재) |
| 게시판 "중요"·"최신" 배지 | `isPinned` 기준 | 데모는 번호 하드코딩이었음 |
| 게시판 빈 상태 안내 | 추가 | 콘텐츠 0건 상태 대응 (기존 `.empty-note` 재사용, 새 CSS 없음) |

## 남은 작업

1. 서버: cwc 게시글·카테고리 시드(과거 `createdAt` 보존 이관 필요)
2. 서버: `/cwc/my/contacts` CORS 허용 → 허용되면 [/api/my/contacts](src/app/api/my/contacts/route.ts) 프록시 제거 가능
4. 어드민: `settings` 값 입력 (미입력 시 프론트 폴백으로 동작) + 테스트 문의 1건(이름 "프론트연동테스트") 삭제
5. 콘텐츠 입고 후 확인: 상세 1회 열람 시 `viewCount` 가 +1 만 되는지, 썸네일·공시 첨부 렌더
6. 기부금 영수증 리소스 신설 시 마이페이지 영수증 섹션 복구 (`RECEIPT_COUNT` 자리)

## 활동소식 콘텐츠 이관

데모 개정본의 활동소식 21건·사진 38장을 운영 DB 로 옮기는 절차다.
어드민 UI 로는 과거 게시일을 지정할 수 없어(등록 당일로 고정) prdokdo 와 같은 **DB 직결 + S3 직접 업로드** 방식을 쓴다.

```bash
node scripts/export-activity-seed.mjs
```

위 명령이 데모 HTML 에서 `scripts/activity-seed.json` 을 만든다. 이어서 growworks-web-admin 레포에서:

```bash
pnpm --filter @workspace/scripts run seed-cwc-activity -- --dry
```

`--dry` 로 계획을 확인한 뒤 플래그 없이 다시 실행하면 반영된다.
스크립트가 하는 일은 ①활동소식 카테고리의 `field_2` 를 image[] 로 승격(이미 배열이면 건너뜀)
②기존 글의 문자열 `field_2` 를 1원소 배열로 변환(안 하면 어드민 재저장 시 400)
③제목 기준 upsert(사진은 원본+webp 를 S3 에 올려 URL 배열로 저장)이다.

**날짜 미상 10건은 기본적으로 보류된다.** 데모는 날짜를 모르는 활동에 날짜를 아예 표시하지 않는데,
운영 DB 는 `createdAt` 이 반드시 있어 화면에 어떤 날짜든 찍힌다. 임의 날짜를 넣으면 사실과 다른
게시일이 공개되므로, 조합에서 날짜를 받아 `activity-seed.json` 의 `date` 를 채운 뒤 재실행하는 것이
기본 경로다. 그래도 먼저 올려야 하면 `--include-undated` 를 쓴다(게시일은 실행일로 기록됨).
