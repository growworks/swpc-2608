import type { NextRequest } from 'next/server'
import { API_BASE_URL, SITE_SLUG } from '@/lib/constants'

/**
 * GET /cwc/my/contacts 프록시.
 *
 * 실측(2026-08-06) 기준 이 엔드포인트만 CORS 가 열려 있지 않아 브라우저 직접 호출이
 * 차단된다(/members/me·/settings 는 열림). rate limit 이 걸린 회원 인증 5종이 아니므로
 * 서버 경유가 계약 위반이 아니다 — 토큰은 헤더로 그대로 전달만 하고 저장하지 않는다.
 * 서버 CORS 가 열리면 contact.ts 의 getMyContacts 를 apiFetchDirect 직접 호출로 되돌리면 된다.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) {
    return Response.json(
      { error: 'UNAUTHORIZED', message: '로그인이 필요합니다' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const page = req.nextUrl.searchParams.get('page') ?? '1'
  const limit = req.nextUrl.searchParams.get('limit') ?? '100'

  let upstream: globalThis.Response
  try {
    upstream = await fetch(
      `${API_BASE_URL}/v1/${SITE_SLUG}/my/contacts?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
      { headers: { Authorization: auth }, cache: 'no-store' },
    )
  } catch {
    return Response.json(
      { error: 'NETWORK', message: '업스트림 API 에 연결하지 못했습니다' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const body = await upstream.text()
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
