import { ApiError, apiFetchDirect, normalizeErrorCode } from '@/lib/api/client'

/**
 * 문의/후원 신청 접수 API. 후원 신청 폼이 이 엔드포인트로 간다.
 *
 * 계약 제약(명세 /cwc/contact):
 * - 응답에 접수 id 가 없어 **화면에 접수번호를 표시할 수 없다**
 * - 이메일 전용 컬럼이 없어 이메일은 `contactMethod` 에 `email: {주소}` 형태로 담는다
 * - 레이트리밋이 없어 중복 제출 방지는 프론트 책임
 * - **서버가 길이를 검사하지 않고 그대로 저장한다.** maxLength 초과는 400 이 아니라
 *   500 INTERNAL 이 나므로 프론트 maxlength 로 막아야 한다 (아래 MAX 상수)
 * - **로그인 상태면 Authorization 헤더를 함께 보내 회원에 자동 연결**한다.
 *   토큰이 무효여도 익명 접수로 처리될 뿐 401 이 나지 않는다.
 *
 * 호출자가 클라이언트 컴포넌트(후원 폼)라 브라우저 직접 호출 경로를 쓴다.
 */

/** 서버가 검증하지 않는 컬럼 길이 — 초과 시 500 이므로 프론트에서 강제한다 */
export const CONTACT_MAX = {
  name: 100,
  phone: 50,
  serviceType: 255,
  budget: 100,
  contactMethod: 100,
} as const

export interface ContactInput {
  /** 최소 2자 — 미만이면 400 VALIDATION */
  name: string
  /** 형식 검증 없이 입력값 그대로 저장 */
  phone: string
  /** 문의 유형 — 후원 유형(정기 후원/일시 후원/재능기부/물품/부동산) */
  serviceType?: string | null
  /** 자유 문자열 — 후원 금액 */
  budget?: string | null
  /** 회신 수단 — 이메일은 `email: {주소}` 형태 */
  contactMethod?: string | null
  /** 길이 제한 없음 */
  message?: string | null
}

export function submitContact(
  input: ContactInput,
  /** 로그인 상태면 회원 토큰 — 신청이 회원에 연결되어 마이페이지에서 조회된다 */
  token?: string | null,
): Promise<{ success?: boolean; message?: string }> {
  return apiFetchDirect('/contact', {
    method: 'POST',
    token: token ?? undefined,
    body: JSON.stringify(input),
  })
}

/* ------------------------------------------------------------------ *
 * 내 후원/문의 신청 내역 (회원)
 * ------------------------------------------------------------------ */

export type ContactStatus = 'pending' | 'reviewing' | 'completed' | 'hold'

export interface MyContact {
  id: number
  name: string
  phone: string
  /** cwc 후원유형 매핑 */
  serviceType: string | null
  /** cwc 입금자·기부종류 매핑 */
  message: string | null
  /** cwc 금액 매핑 */
  budget: string | null
  contactMethod: string[] | null
  status: ContactStatus
  createdAt: string
}

export interface MyContactList {
  items: MyContact[]
  total: number
  page: number
  limit: number
}

/**
 * 마이페이지 후원 신청 내역 — **로그인 상태로 낸 신청만** 반환된다
 * (비로그인 신청은 회원과 연결되지 않아 포함되지 않음). 최신순.
 *
 * ⚠ 이 엔드포인트만 서버 CORS 가 열려 있지 않아(실측 2026-08-06) 브라우저 직접 호출이
 * 차단된다. 같은 오리진의 Next 라우트(/api/my/contacts)로 프록시해 호출한다.
 * 서버 CORS 가 열리면 apiFetchDirect(`/my/contacts?...`) 직접 호출로 되돌릴 것.
 */
export async function getMyContacts(token: string, page = 1, limit = 100): Promise<MyContactList> {
  let res: Response
  try {
    res = await fetch(`/api/my/contacts?page=${page}&limit=${Math.min(limit, 100)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
  } catch (cause) {
    throw new ApiError(0, 'NETWORK', '후원 신청 내역 API 요청에 실패했습니다', { cause: String(cause) })
  }
  const body = (await res.json().catch(() => null)) as
    | (MyContactList & { error?: unknown; message?: unknown })
    | null
  if (!res.ok || !body) {
    const code = normalizeErrorCode(body?.error)
    throw new ApiError(res.status, code, typeof body?.message === 'string' ? body.message : `API ${res.status}`)
  }
  return body
}

/** 처리 상태 → 화면 라벨·배지 클래스 (데모 pill 팔레트 재사용) */
export const CONTACT_STATUS_LABEL: Record<ContactStatus, { label: string; pill: string }> = {
  pending: { label: '접수됨', pill: 'pill-navy' },
  reviewing: { label: '검토중', pill: 'pill-line' },
  completed: { label: '완료', pill: 'pill-on' },
  hold: { label: '보류', pill: 'pill-wait' },
}
