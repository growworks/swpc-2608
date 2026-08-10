'use client'

import type { PublicMember } from '@/lib/api/members'

/**
 * 회원 세션 저장소 (브라우저).
 *
 * 서버에 로그아웃 엔드포인트가 없어(토큰 폐기 수단 없음) 로그아웃은 이 저장소를
 * 비우는 것으로 처리한다. 토큰 유효기간은 30일이다.
 */

const TOKEN_KEY = 'swpc_token'
const MEMBER_KEY = 'swpc_member'
const DEST_KEY = 'swpc_dest'

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

export function subscribeSession(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** 마지막으로 받은 회원 정보 (화면 초기 표시용 캐시 — 진실 소스는 GET /members/me) */
export function getCachedMember(): PublicMember | null {
  try {
    const raw = localStorage.getItem(MEMBER_KEY)
    return raw ? (JSON.parse(raw) as PublicMember) : null
  } catch {
    return null
  }
}

export function setSession(token: string, member: PublicMember) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(MEMBER_KEY, JSON.stringify(member))
  } catch {
    /* 저장 불가 환경에서는 이번 세션만 동작 */
  }
  emit()
}

/** 회원 정보만 갱신 (정보 수정 후) */
export function updateCachedMember(member: PublicMember) {
  try {
    localStorage.setItem(MEMBER_KEY, JSON.stringify(member))
  } catch {
    /* noop */
  }
  emit()
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(MEMBER_KEY)
  } catch {
    /* noop */
  }
  emit()
}

/** 로그인 후 돌아갈 목적지 (마이페이지 진입 가드용) */
export function setLoginDest(path: string) {
  try {
    sessionStorage.setItem(DEST_KEY, path)
  } catch {
    /* noop */
  }
}

export function takeLoginDest(): string {
  try {
    const v = sessionStorage.getItem(DEST_KEY)
    sessionStorage.removeItem(DEST_KEY)
    return v || '/'
  } catch {
    return '/'
  }
}

/**
 * 비밀번호 규칙 — **서버는 8자 이상만 검증한다.**
 * 데모의 영문+숫자+특수문자 규칙은 서버에 없으므로 프론트에서 계속 검사한다.
 */
export const PW_RULES: Record<string, (v: string) => boolean> = {
  len: (v) => v.length >= 8,
  alpha: (v) => /[a-zA-Z]/.test(v),
  num: (v) => /\d/.test(v),
  spec: (v) => /[^a-zA-Z0-9]/.test(v),
}

export const PW_RULE_LABELS: [string, string][] = [
  ['len', '8자 이상'],
  ['alpha', '영문'],
  ['num', '숫자'],
  ['spec', '특수문자'],
]

export const pwOk = (v: string) => Object.values(PW_RULES).every((f) => f(v))
