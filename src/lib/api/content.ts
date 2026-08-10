/**
 * 콘텐츠 조회 파사드.
 *
 * 게시판(소식·투명공시)은 growworks posts API 에서 가져온다.
 * 교육프로그램·FAQ·6대 사업은 API v1 범위 밖이라 프론트 상수를 유지한다
 * (프로그램은 수동 정렬이 필요한데 posts 가 지원하지 않고, FAQ 는 텍스트 노드 렌더라
 *  posts 본문 HTML 과 맞지 않음 — 명세 "v1 범위 밖" 참조).
 */
import { CATEGORY, adjacent, getPost, getPosts, type Post } from '@/lib/api/posts'
import { PROGRAMS, type Program } from '@/lib/data/programs'
import { BIZ6, FAQS } from '@/lib/data/faqs'

/** 서버 limit 최대값 (전량 수집용) */
const FETCH_LIMIT = 100
/** 폭주 방지 상한 — 이보다 많아지면 화면에 페이지네이션을 넣어야 한다 */
const MAX_ITEMS = 500

/**
 * 카테고리 전량 수집.
 * limit 최대가 100 이라 게시글이 100 건을 넘으면 목록 뒷부분과 이전/다음 링크가
 * 조용히 사라진다. total 을 보고 페이지를 순회해 그 지점을 막는다(명세 운영 규칙).
 */
async function fetchAll(category: string): Promise<Post[]> {
  const first = await getPosts({ category, limit: FETCH_LIMIT, page: 1 })
  const items = [...first.items]
  const total = Math.min(first.total, MAX_ITEMS)

  for (let page = 2; items.length < total; page += 1) {
    const next = await getPosts({ category, limit: FETCH_LIMIT, page })
    if (!next.items.length) break
    items.push(...next.items)
  }
  return items
}

/* ------------------------------------------------------------------ *
 * 소식 (공지사항 · 활동소식)
 * ------------------------------------------------------------------ */

/** 게시판별 페이지 크기 (화면 기준 확정값) */
export const PAGE_SIZE = {
  notice: 10,
  activity: 4,
  mgmt: 5,
  donation: 5,
} as const

export interface BoardPage {
  items: Post[]
  total: number
  page: number
  limit: number
}

/**
 * 목록은 게시판별로 **각각 호출**해 서버 페이징을 쓴다.
 * 카테고리는 접두 없는 단일 이름이라 접두 조회가 불가능하며, 게시판별 단독 조회의
 * total 이 해당 게시판 건수라 번호 공식(total-(page-1)*limit-index)을 그대로 쓸 수 있다.
 */
export function getNoticeBoard(page = 1): Promise<BoardPage> {
  return getPosts({ category: CATEGORY.NOTICE, page, limit: PAGE_SIZE.notice })
}

export function getActivityBoard(page = 1): Promise<BoardPage> {
  return getPosts({ category: CATEGORY.ACTIVITY, page, limit: PAGE_SIZE.activity })
}

/** 소식 전량 (sitemap 전용 — 화면 목록은 위의 페이징 API 를 쓴다) */
export async function getNewsBoards(): Promise<{
  notices: Post[]
  activities: Post[]
}> {
  const [notices, activities] = await Promise.all([
    fetchAll(CATEGORY.NOTICE),
    fetchAll(CATEGORY.ACTIVITY),
  ])
  return { notices, activities }
}

/** limit 을 주면 단일 조회(홈·대문의 상위 N건), 생략하면 전량 수집 */
export async function getNotices(limit?: number): Promise<Post[]> {
  if (limit) return (await getPosts({ category: CATEGORY.NOTICE, limit })).items
  return fetchAll(CATEGORY.NOTICE)
}

export async function getActivities(limit?: number): Promise<Post[]> {
  if (limit) return (await getPosts({ category: CATEGORY.ACTIVITY, limit })).items
  return fetchAll(CATEGORY.ACTIVITY)
}

export type NewsKind = 'notice' | 'activity'

/**
 * 소식 상세 + 이전/다음.
 * 데모는 id 프리픽스(`n`/`a`)로 공지/활동소식을 나눴지만,
 * 서버 id 가 정수 PK 라 **상세 응답의 category 값으로 분기**한다.
 */
export async function getNewsDetail(id: number): Promise<{
  post: Post
  kind: NewsKind
  prev?: Post
  next?: Post
}> {
  const post = await getPost(id)
  const kind: NewsKind = post.category === CATEGORY.ACTIVITY ? 'activity' : 'notice'
  const siblings = await fetchAll(kind === 'activity' ? CATEGORY.ACTIVITY : CATEGORY.NOTICE)
  const { prev, next } = adjacent(siblings, id)
  return { post, kind, prev, next }
}

/* ------------------------------------------------------------------ *
 * 투명공시 (경영공시 · 기부금공시)
 * ------------------------------------------------------------------ */

export function getMgmtBoard(page = 1): Promise<BoardPage> {
  return getPosts({ category: CATEGORY.MGMT, page, limit: PAGE_SIZE.mgmt })
}

export function getDonationBoard(page = 1): Promise<BoardPage> {
  return getPosts({ category: CATEGORY.DONATION, page, limit: PAGE_SIZE.donation })
}

/** 공시 전량 (sitemap 전용) */
export async function getReportBoards(): Promise<{
  mgmt: Post[]
  donation: Post[]
}> {
  const [mgmt, donation] = await Promise.all([
    fetchAll(CATEGORY.MGMT),
    fetchAll(CATEGORY.DONATION),
  ])
  return { mgmt, donation }
}

export type ReportKind = 'mgmt' | 'donation'

export async function getReportDetail(id: number): Promise<{
  post: Post
  kind: ReportKind
}> {
  const post = await getPost(id)
  const kind: ReportKind = post.category === CATEGORY.DONATION ? 'donation' : 'mgmt'
  return { post, kind }
}

/* ------------------------------------------------------------------ *
 * v1 범위 밖 — 프론트 상수 유지
 * ------------------------------------------------------------------ */

export async function getPrograms(): Promise<Program[]> {
  return PROGRAMS
}

export async function getProgram(id: string): Promise<Program | undefined> {
  return PROGRAMS.find((p) => p.id === id)
}

export async function getFaqs(): Promise<[string, string][]> {
  return FAQS
}

export async function getBiz6(): Promise<[string, string][]> {
  return BIZ6
}
