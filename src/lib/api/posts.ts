import { apiFetch } from '@/lib/api/client'
import { LIST_REVALIDATE } from '@/lib/constants'

/**
 * 게시판 API — 화면의 4개 게시판을 하나의 posts + 카테고리로 운영한다.
 * 카테고리는 접두 없는 단일 이름을 쓴다 — 명세 초안의 `분류/세부` 2단 컨벤션 대신
 * 어드민에 등록된 실제 분류 이름과 일치시키기로 확정(2026-08-10).
 * 접두 일치 조회를 쓰지 않으므로 게시판별로 각각 호출한다.
 */

export const CATEGORY = {
  /** 소식 › 공지사항 */
  NOTICE: '공지사항',
  /** 소식 › 활동 소식 */
  ACTIVITY: '활동소식',
  /** 투명공시 › 경영공시 */
  MGMT: '경영공시',
  /** 투명공시 › 기부금공시 */
  DONATION: '기부금공시',
} as const

export interface Post {
  id: number
  title: string
  content: string
  category: string | null
  custom: Record<string, unknown> | null
  isPinned: boolean
  viewCount: number
  createdAt: string
  updatedAt?: string
  /** 타 테넌트(뉴스) 호환 필드 — cwc 에서는 무시 (작성자 커스텀 필드 없음) */
  authorName?: string | null
}

export interface PostList {
  items: Post[]
  total: number
  page: number
  limit: number
}

export interface PostQuery {
  category?: string
  page?: number
  limit?: number
  search?: string
  sort?: 'views'
}

/** limit 최대값은 서버 계약상 100 */
const MAX_LIMIT = 100

/**
 * 게시판 목록. 기본 정렬은 `isPinned DESC, createdAt DESC`(중요 공지 최상단 → 최신순).
 * 응답에 본문 전문이 실리므로 limit 은 화면에 맞게 줄여 쓴다.
 */
export async function getPosts(query: PostQuery = {}): Promise<PostList> {
  const params = new URLSearchParams()
  if (query.category) params.set('category', query.category)
  if (query.page) params.set('page', String(query.page))
  params.set('limit', String(Math.min(query.limit ?? 20, MAX_LIMIT)))
  if (query.search) params.set('search', query.search)
  if (query.sort) params.set('sort', query.sort)

  return apiFetch<PostList>(`/posts?${params.toString()}`, {
    next: { revalidate: LIST_REVALIDATE, tags: ['posts'] },
  })
}

/**
 * 게시글 상세. **호출할 때마다 viewCount 가 +1 되고 증가된 값이 반환된다.**
 * ISR 로 감싸면 조회수가 멈추므로 호출부(상세 페이지)는 동적 렌더로 둔다.
 */
export async function getPost(id: number): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, { cache: 'no-store' })
}

/* ------------------------------------------------------------------ *
 * custom 필드 파서
 *
 * 키는 시맨틱 이름이 아니라 카테고리별 `field_1`/`field_2` 일반 키다(어드민 기본 키).
 * **같은 field_1 이라도 카테고리마다 타입·의미가 다르므로** 반드시 category 로 분기해 읽는다:
 *   활동소식   field_1=구분 배지(string)  field_2=썸네일(image)  field_3=이미지 설명(string)
 *   경영공시   field_1=첨부 서류(file[] {url,name,size바이트})
 *   기부금공시 field_1=첨부 내역서(image 1장)
 * 값이 비면 키 자체가 빠지고 custom 이 null 일 수 있어 전부 방어적으로 읽는다.
 * ------------------------------------------------------------------ */

function str(custom: Record<string, unknown> | null | undefined, key: string): string | null {
  const v = custom?.[key]
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

export interface PostFile {
  name: string
  url: string
  /** 표시용 크기 문자열 (바이트 숫자를 프론트에서 포맷) */
  sizeLabel: string | null
}

/** 바이트 → 데모식 표기 (`215.9KB`, `2.4MB`, `262KB`) */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  const fmt = (v: number, unit: string) => `${v.toFixed(1).replace(/\.0$/, '')}${unit}`
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return fmt(bytes / 1024, 'KB')
  return fmt(bytes / (1024 * 1024), 'MB')
}

/**
 * 경영공시 첨부 목록 — `custom.field_1` = `{url, name, size}` 배열(최대 20개).
 * name·size 는 업로드 시 브라우저가 취득한 원본 파일명·바이트 크기다(운영자 수기 입력 아님).
 */
export function postFiles(post: Post): PostFile[] {
  if (post.category !== CATEGORY.MGMT) return []
  const raw = post.custom?.field_1
  if (!Array.isArray(raw)) return []

  return raw.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const r = row as Record<string, unknown>
    const url = typeof r.url === 'string' ? r.url.trim() : ''
    if (!url) return []
    const name =
      typeof r.name === 'string' && r.name.trim()
        ? r.name.trim()
        : decodeURIComponent(url.split('/').pop() || '첨부파일')
    const sizeLabel = typeof r.size === 'number' ? formatFileSize(r.size) || null : null
    return [{ name, url, sizeLabel }]
  })
}

/**
 * 활동소식 카드/상세용 메타.
 * field_3(이미지 설명)이 상세 figcaption 겸 img alt 로 쓰인다(데모의 item.alt 역할).
 * 설명이 비어 있으면 alt 는 제목으로 폴백하고 figcaption 은 생략한다.
 */
export function activityMeta(post: Post) {
  const isActivity = post.category === CATEGORY.ACTIVITY
  const caption = isActivity ? str(post.custom, 'field_3') : null
  return {
    topic: isActivity ? str(post.custom, 'field_1') : null,
    thumbnailUrl: isActivity ? str(post.custom, 'field_2') : null,
    caption,
    thumbnailAlt: caption ?? post.title,
  }
}

/** 기부금공시 첨부 내역서 이미지 — `custom.field_1` = 이미지 URL 1장 */
export function donationDocImage(post: Post): string | null {
  if (post.category !== CATEGORY.DONATION) return null
  return str(post.custom, 'field_1')
}

/* ------------------------------------------------------------------ *
 * 표기 헬퍼
 * ------------------------------------------------------------------ */

/**
 * 게시일 표기 (`YYYY.MM.DD`).
 *
 * 서버는 **DB 에 저장된 벽시계 값을 그대로 직렬화**해 내려준다(운영 확정, 2026-08-10).
 * 라벨(Z)은 무시하고 문자열의 날짜 부분을 시간대 변환 없이 그대로 표기한다 —
 * new Date() 파싱 후 KST 변환하면 +9시간이 붙어 15시 이후 게시물이 전부 다음 날로 밀린다.
 * (서버가 진짜 UTC 순간을 내려주는 계약으로 바뀌면 이 함수도 KST 변환으로 되돌려야 한다)
 */
export function formatPostDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return ''
  return `${m[1]}.${m[2]}.${m[3]}`
}

/** 게시판 번호 열 — 서버가 주지 않으므로 프론트에서 계산 */
export function postNo(total: number, page: number, limit: number, index: number): number {
  return total - (page - 1) * limit - index
}

/** 이전/다음 글 — 서버가 주지 않으므로 같은 카테고리 목록의 인접 인덱스로 계산 */
export function adjacent<T extends { id: number }>(list: T[], id: number) {
  const i = list.findIndex((x) => x.id === id)
  if (i < 0) return { prev: undefined, next: undefined }
  return { prev: list[i + 1], next: list[i - 1] }
}
