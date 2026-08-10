import { apiFetchDirect } from '@/lib/api/client'

/**
 * 회원 API.
 *
 * 전 엔드포인트를 **브라우저에서 API 도메인으로 직접 호출**한다.
 * rate limit 이 IP 단위(분당 10회)라 Next 서버 프록시를 경유하면
 * 전 사용자가 한 IP로 합산되어 429 가 나기 때문이다(명세 "호출 경로 주의").
 *
 * 서버에 로그아웃 엔드포인트가 없어 로그아웃은 프론트 저장소를 비우는 것으로 처리한다.
 *
 * ⚠ 서버 실측(2026-08-06): `/members/*` 는 전 테넌트에서 404(라우트 미배포)이고,
 * 브라우저에서 호출하면 `Access-Control-Allow-Origin` 이 없어 CORS 로도 막힌다.
 * (같은 API 의 `/posts` `/contact` 는 브라우저 호출이 정상 동작하므로 CORS 는 엔드포인트별 설정이다.)
 * **배포 시 라우트 추가와 함께 CORS 허용도 같이 필요하다** — 아니면 회원 기능이 동작하지 않는다.
 */

export interface PublicMember {
  id: number
  email: string
  name: string
  /** E.164 정규화 값 (`+821012345678`). 화면 표기는 formatPhone 으로 역포맷 */
  phone: string | null
  phoneCountry: string | null
  /** cwc 는 v1 에 이메일 인증이 없어 항상 null — 게이트로 쓰지 말 것 */
  emailVerifiedAt: string | null
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed: boolean
  /**
   * true 면 약관·개인정보 중 미동의가 있다.
   * 공개 가입 계정은 false 지만 **운영자가 어드민에서 수동 등록한 계정은 true 로 내려온다.**
   * 로그인 후 반드시 확인해 recordConsent 로 보완해야 서버에 동의가 남는다.
   */
  consentRequired: boolean
  providers: string[]
}

export interface MemberAuthResponse {
  /** Bearer 토큰 (유효 30일) */
  token: string
  member: PublicMember
}

export interface SignupInput {
  email: string
  password: string
  name: string
  phone?: string | null
  termsAgreed: boolean
  privacyAgreed: boolean
  marketingAgreed?: boolean
}

/** 가입 — 성공 시 즉시 토큰이 발급되어 별도 로그인 호출이 필요 없다 */
export function signup(input: SignupInput): Promise<MemberAuthResponse> {
  return apiFetchDirect<MemberAuthResponse>('/members/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * 로그인.
 * 계정 열거 방지를 위해 없는 계정과 비밀번호 오류가 같은 `INVALID_CREDENTIALS` 로 온다.
 * "가입되지 않은 이메일입니다" 같은 구분 문구를 만들지 않는다.
 */
export function login(email: string, password: string): Promise<MemberAuthResponse> {
  return apiFetchDirect<MemberAuthResponse>('/members/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(token: string): Promise<PublicMember> {
  return apiFetchDirect<PublicMember>('/members/me', { token })
}

export function updateMe(
  token: string,
  input: { name?: string; phone?: string | null },
): Promise<PublicMember> {
  return apiFetchDirect<PublicMember>('/members/me', {
    method: 'PUT',
    token,
    body: JSON.stringify(input),
  })
}

/** 비밀번호 변경 — currentPassword 불일치는 401 `INVALID_CREDENTIALS` */
export function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success?: boolean }> {
  return apiFetchDirect('/members/password', {
    method: 'POST',
    token,
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

/** 재설정 메일 발송 — 계정 존재 여부와 무관하게 항상 200 (계정 열거 방지) */
export function forgotPassword(email: string): Promise<{ success?: boolean }> {
  return apiFetchDirect('/members/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

/** 재설정 토큰으로 새 비밀번호 설정 — 토큰은 1회용, 성공해도 로그인 토큰은 발급되지 않는다 */
export function resetPassword(token: string, newPassword: string): Promise<{ success?: boolean }> {
  return apiFetchDirect('/members/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  })
}

/** 탈퇴 — 즉시 처리, 되돌릴 수 없음. 같은 이메일로 재가입 가능 */
export function withdraw(token: string): Promise<{ success?: boolean }> {
  return apiFetchDirect('/members/me', { method: 'DELETE', token })
}

/**
 * 약관 동의 기록 (보완용).
 * `consentRequired: true` 인 회원 — 어드민이 수동 등록해 동의 없이 생성된 계정 — 이 동의 화면에서 호출한다.
 * 약관·개인정보는 정확히 true 여야 하며 아니면 TERMS_REQUIRED(400). 이미 동의한 항목의 시각은 덮어쓰지 않는다.
 */
export function recordConsent(
  token: string,
  input: { termsAgreed: boolean; privacyAgreed: boolean; marketingAgreed?: boolean },
): Promise<PublicMember> {
  return apiFetchDirect<PublicMember>('/members/consent', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  })
}

/**
 * E.164 → 국내 표기 역포맷 (`+821012345678` → `010-1234-5678`).
 * 서버는 정규화 값만 돌려주므로 화면 표기는 프론트 책임이다.
 */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return ''
  const digits = e164.replace(/\D/g, '')
  let local = digits
  if (local.startsWith('82')) local = '0' + local.slice(2)
  if (local.length === 11) return `${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`
  if (local.length === 10) return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`
  return e164
}
