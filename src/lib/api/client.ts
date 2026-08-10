import { API_BASE_URL, PUBLIC_API_BASE_URL, SITE_SLUG } from '@/lib/constants'

/**
 * growworks 공개 API 호출 래퍼.
 *
 * 에러 코드 정규화가 이 파일의 핵심이다. 명세는 `VALIDATION` / `SITE_NOT_FOUND` 처럼
 * SCREAMING_SNAKE 를 규정하지만 **실제 서버는 `Validation` / `Site not found` 처럼
 * 문장형으로 내려준다**(2026-08 확인). 어느 쪽이 오든 같은 코드로 분기할 수 있도록
 * 대문자화 + 공백/하이픈 → 언더스코어 변환을 거친 값을 `ApiError.code` 에 담는다.
 */

/** 명세 + 실제 서버 양쪽에서 관측되는 에러 코드 */
export type ApiErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'ACCOUNT_RESTRICTED'
  | 'SITE_NOT_FOUND'
  | 'POST_NOT_FOUND'
  | 'MEMBER_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'TERMS_REQUIRED'
  | 'DUPLICATE_EMAIL'
  | 'INVALID_CREDENTIALS'
  | 'SNS_ONLY_ACCOUNT'
  | 'INVALID_PHONE'
  | 'INVALID_PHONE_COUNTRY'
  | 'NOT_DEPLOYED'
  | 'NETWORK'
  | 'INTERNAL'
  | (string & {})

/** `Site not found` → `SITE_NOT_FOUND`, `Validation` → `VALIDATION` */
export function normalizeErrorCode(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return 'INTERNAL'
  return raw.trim().toUpperCase().replace(/[\s-]+/g, '_')
}

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details?: Record<string, unknown>

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  /** 429 응답의 재시도까지 남은 초 */
  get retryAfterSec(): number | null {
    const v = this.details?.retryAfterSec
    return typeof v === 'number' ? v : null
  }
}

interface FetchOptions extends RequestInit {
  next?: { revalidate?: number | false; tags?: string[] }
  /** 브라우저에서 API 도메인으로 직접 호출 (회원 인증 전용) */
  direct?: boolean
  /** 회원 Bearer 토큰 */
  token?: string | null
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { direct, token, headers, ...init } = options
  const base = direct ? PUBLIC_API_BASE_URL : API_BASE_URL
  const url = `${base}/v1/${SITE_SLUG}${path}`

  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
    })
  } catch (cause) {
    throw new ApiError(0, 'NETWORK', `API 요청에 실패했습니다: ${url}`, {
      cause: String(cause),
    })
  }

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      /* 라우트 미배포 시 Express 기본 HTML 404 가 오는 경우가 있다 */
      body = null
    }
  }

  if (!res.ok) {
    const payload = (body ?? {}) as { error?: unknown; message?: unknown; details?: unknown }
    /* JSON 이 아닌 404 = 라우트 자체가 서버에 없음 (회원 API 미배포 상태) */
    const code =
      body === null && res.status === 404 ? 'NOT_DEPLOYED' : normalizeErrorCode(payload.error)
    const message =
      typeof payload.message === 'string' ? payload.message : `API ${res.status} ${res.statusText}`
    throw new ApiError(
      res.status,
      code,
      message,
      (payload.details as Record<string, unknown> | undefined) ?? undefined,
    )
  }

  return body as T
}

/** 서버(SSR/ISR) 페치 — 게시판·설정 조회용. 레이트리밋 없음 */
export function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  return request<T>(path, options)
}

/** 브라우저 직접 페치 — 회원 인증 전용 (IP 단위 rate limit 회피) */
export function apiFetchDirect<T>(path: string, options: FetchOptions = {}): Promise<T> {
  return request<T>(path, { ...options, direct: true, cache: 'no-store' })
}

/**
 * 에러 코드 → 화면 문구.
 * 서버 `message` 는 일부 구간이 영문이라 그대로 노출하지 않는다(명세 지시).
 */
export function errorMessage(err: unknown, fallback = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'): string {
  if (!(err instanceof ApiError)) return fallback
  switch (err.code) {
    case 'INVALID_CREDENTIALS':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    case 'DUPLICATE_EMAIL':
      return '이미 가입된 이메일입니다.'
    case 'INVALID_EMAIL':
      return '이메일 형식을 확인해 주세요.'
    case 'WEAK_PASSWORD':
      return '비밀번호는 8자 이상이어야 합니다.'
    case 'TERMS_REQUIRED':
      return '필수 약관에 모두 동의해 주세요.'
    case 'INVALID_PHONE':
    case 'INVALID_PHONE_COUNTRY':
      return '연락처 형식을 확인해 주세요. (예: 010-1234-5678)'
    case 'ACCOUNT_RESTRICTED':
      return '이용이 제한된 계정입니다. 042-931-1479로 문의해 주세요.'
    case 'UNAUTHORIZED':
      return '로그인이 필요합니다. 다시 로그인해 주세요.'
    case 'FORBIDDEN':
      return '접근 권한이 없습니다. 다시 로그인해 주세요.'
    case 'RATE_LIMITED': {
      const sec = err.retryAfterSec
      return sec
        ? `요청이 너무 잦습니다. ${sec}초 후 다시 시도해 주세요.`
        : '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.'
    }
    case 'VALIDATION':
      return '입력값을 확인해 주세요.'
    case 'NOT_DEPLOYED':
      return '해당 기능이 아직 서버에 준비되지 않았습니다. 042-931-1479로 문의해 주세요.'
    case 'NETWORK':
      /* 브라우저는 CORS 차단과 네트워크 단절을 구분해 주지 않는다(둘 다 TypeError).
         사용자 탓으로 읽히지 않게 중립적으로 안내한다. */
      return '서버에 연결하지 못했습니다. 잠시 후 다시 시도하거나 042-931-1479로 문의해 주세요.'
    default:
      return fallback
  }
}

/**
 * 토큰을 폐기하고 로그인 화면으로 보내야 하는 인증 실패인지.
 * ACCOUNT_RESTRICTED 는 재로그인을 유도하면 안 되므로 별도 취급한다(명세 401/403 계약).
 */
export function isAuthExpired(err: unknown): boolean {
  return err instanceof ApiError && (err.code === 'UNAUTHORIZED' || err.code === 'FORBIDDEN')
}

export function isAccountRestricted(err: unknown): boolean {
  return err instanceof ApiError && err.code === 'ACCOUNT_RESTRICTED'
}
