import Link from 'next/link'
import './BoardPager.css'

/**
 * 게시판 페이저 (서버 컴포넌트).
 * 총 1페이지 이하면 아무것도 그리지 않는다 — 데모에 없던 요소라 페이징이 필요해질 때만 나타난다.
 * 한 화면에 게시판이 2개씩 있어(공지+활동, 경영+기부금) 페이지 파라미터를 분리해서 받고,
 * 링크에 해당 게시판 섹션 앵커를 붙여 이동 후에도 그 게시판 위치에 머물게 한다.
 */
export function BoardPager({
  page,
  total,
  limit,
  makeHref,
  label,
}: {
  page: number
  total: number
  limit: number
  /** 페이지 번호 → href (다른 게시판의 페이지 파라미터 유지 + 섹션 앵커 포함) */
  makeHref: (page: number) => string
  /** 접근성용 게시판 이름 (예: "공지사항") */
  label: string
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) return null

  const current = Math.min(Math.max(1, page), totalPages)

  /* 현재 페이지 중심 최대 5칸 창 */
  let start = Math.max(1, current - 2)
  const end = Math.min(totalPages, start + 4)
  start = Math.max(1, end - 4)
  const pages: number[] = []
  for (let p = start; p <= end; p += 1) pages.push(p)

  return (
    <nav className="board-pager" aria-label={`${label} 페이지 이동`}>
      {current > 1 && (
        <Link className="nav" href={makeHref(current - 1)} aria-label="이전 페이지">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
      )}
      {start > 1 && (
        <>
          <Link href={makeHref(1)}>1</Link>
          {start > 2 && <span className="gap" aria-hidden="true">…</span>}
        </>
      )}
      {pages.map((p) =>
        p === current ? (
          <Link key={p} href={makeHref(p)} className="on" aria-current="page">{p}</Link>
        ) : (
          <Link key={p} href={makeHref(p)}>{p}</Link>
        ),
      )}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="gap" aria-hidden="true">…</span>}
          <Link href={makeHref(totalPages)}>{totalPages}</Link>
        </>
      )}
      {current < totalPages && (
        <Link className="nav" href={makeHref(current + 1)} aria-label="다음 페이지">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
        </Link>
      )}
    </nav>
  )
}
