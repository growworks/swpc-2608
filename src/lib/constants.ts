/**
 * 환경변수 기반 상수.
 * 게시판·설정·문의는 growworks 공개 API에서 가져온다 (lib/api/ 참고).
 */

/** 테넌트 slug — 전 경로 고정값 `cwc` */
export const SITE_SLUG = process.env.SITE_SLUG ?? 'cwc'

/** 서버(SSR/ISR) 페치용 베이스 */
export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://api.growworks.co.kr'

/**
 * 브라우저 직접 호출용 베이스.
 * 회원 인증 API는 rate limit 이 IP 단위라 Next 서버 프록시를 경유하면
 * 전 사용자가 한 IP로 합산돼 429 가 난다. 반드시 브라우저에서 직접 호출한다.
 */
export const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.growworks.co.kr'

/**
 * 카카오맵 JavaScript 키 (오시는 길 지도).
 * JS 키는 브라우저에 노출되는 공개 키이며, 카카오 개발자 콘솔의 **사이트 도메인 등록**으로만
 * 보호된다 — localhost:3422 와 1479.cwc.or.kr 이 등록돼 있어야 지도가 뜬다.
 */
export const KAKAO_MAP_KEY =
  process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? 'b17dcccbfd909891fae73d3a6ae9514c'

/**
 * 목록 재검증 주기(초). 상세는 조회수 반영을 위해 동적 렌더한다.
 *
 * **fetch 옵션 전용이다.** 페이지의 `export const revalidate` 에는 쓸 수 없다 —
 * Next 16 은 세그먼트 설정을 SWC AST 로 정적 추출하므로 식별자를 만나면
 * "Unknown identifier" 로 판정해 next build 를 중단시킨다. 페이지에는 리터럴 300 을 쓴다.
 */
export const LIST_REVALIDATE = 300
