import Link from 'next/link'

const ARROW = (dir: -1 | 1) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir < 0 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
  </svg>
)

/**
 * 게시판 페이저 - 데모(2026-08-19 개정본)의 `.pager` 마크업을 그대로 쓴다.
 * 스타일은 globals.css 의 `.pg-*` 규칙(데모 CSS)이 담당한다.
 *
 * 데모와 다른 점 하나: 총 1페이지면 그리지 않는다.
 * 데모는 활동소식 한 곳에만 페이저를 뒀지만 이 사이트는 네 게시판 모두 서버 페이징이라,
 * 항상 그리면 데모에 없던 페이저가 공지·공시 화면에 늘 떠 있게 된다.
 *
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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="pager" aria-label={`${label} 페이지`}>
      <div className="pg-nav">
        {/* 양 끝에서도 자리를 비우지 않는다 - 좁은 화면에서 화살표 2칸이 균등 분할되기 때문 */}
        {current > 1 ? (
          <Link className="pg-btn pg-arrow" href={makeHref(current - 1)} aria-label="이전 페이지">
            {ARROW(-1)}<span className="pg-lbl">이전</span>
          </Link>
        ) : (
          <span className="pg-btn pg-arrow is-off" aria-hidden="true">
            {ARROW(-1)}<span className="pg-lbl">이전</span>
          </span>
        )}

        {pages.map((p) =>
          p === current ? (
            <span key={p} className="pg-btn is-on" aria-current="page">{p}</span>
          ) : (
            <Link key={p} className="pg-btn" href={makeHref(p)} aria-label={`${p}페이지`}>{p}</Link>
          ),
        )}

        {current < totalPages ? (
          <Link className="pg-btn pg-arrow" href={makeHref(current + 1)} aria-label="다음 페이지">
            <span className="pg-lbl">다음</span>{ARROW(1)}
          </Link>
        ) : (
          <span className="pg-btn pg-arrow is-off" aria-hidden="true">
            <span className="pg-lbl">다음</span>{ARROW(1)}
          </span>
        )}
      </div>
      <span className="pg-count">전체 {total}건 · {current}/{totalPages} 페이지</span>
    </nav>
  )
}
