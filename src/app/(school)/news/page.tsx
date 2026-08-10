import type { Metadata } from 'next'
import { Tabbar } from '@/components/ui/Tabbar'
import { BoardPager } from '@/components/ui/BoardPager'
import { NewsCard } from '@/components/sections/NewsCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { getActivityBoard, getNoticeBoard, PAGE_SIZE, type BoardPage } from '@/lib/api/content'
import { formatPostDate, postNo } from '@/lib/api/posts'
import { abs, breadcrumbLd, itemListLd } from '@/lib/seo'

/* searchParams(페이지 번호)를 읽으므로 동적 렌더 — 데이터 자체는 getPosts 의 fetch 캐시(300초)를 탄다 */

export const metadata: Metadata = {
  title: '소식',
  description: '학교복지진흥사회적협동조합의 공지사항과 활동 소식을 알립니다.',
  /* 페이지 파라미터 변형은 canonical 로 /news 에 수렴시킨다 */
  alternates: { canonical: '/news' },
}

const TABS = [
  { key: 'notice', label: '공지사항' },
  { key: 'list', label: '활동 소식' },
]

/** 페이지 파라미터 파싱 — 비정상 값은 1페이지 */
function parsePage(raw: string | undefined): number {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : 1
}

/* 조회 실패로 페이지 전체가 죽으면 안 되므로 빈 목록으로 낙하시킨다(report·home 과 같은 방침) */
async function loadBoard(load: () => Promise<BoardPage>, limit: number): Promise<BoardPage> {
  try {
    return await load()
  } catch {
    return { items: [], total: 0, page: 1, limit }
  }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ np?: string; ap?: string }>
}) {
  const sp = await searchParams
  const np = parsePage(sp.np)
  const ap = parsePage(sp.ap)

  /* 공지사항·활동소식을 게시판별로 각각 호출해 서버 페이징을 쓴다 (공지 10건 · 활동 4건) */
  const [notices, activities] = await Promise.all([
    loadBoard(() => getNoticeBoard(np), PAGE_SIZE.notice),
    loadBoard(() => getActivityBoard(ap), PAGE_SIZE.activity),
  ])

  /* 한 화면에 게시판이 2개라 페이지 파라미터를 분리하고, 서로의 페이지를 유지한 채 이동한다 */
  const noticeHref = (p: number) =>
    `/news?np=${p}${ap > 1 ? `&ap=${ap}` : ''}#news-notice`
  const activityHref = (p: number) =>
    `/news?${np > 1 ? `np=${np}&` : ''}ap=${p}#news-list`

  /* 구조화 데이터 — ItemList 는 현재 페이지 항목만 담고, 빈 게시판은 생략한다(빈 목록 LD 는 무의미) */
  const ld: object[] = [breadcrumbLd([{ name: '홈', path: '/' }, { name: '소식' }])]
  if (notices.items.length > 0) {
    ld.push(itemListLd('공지사항', notices.items.map((n) => ({ url: abs(`/news/${n.id}`), name: n.title }))))
  }
  if (activities.items.length > 0) {
    ld.push(itemListLd('활동 소식', activities.items.map((a) => ({ url: abs(`/news/${a.id}`), name: a.title }))))
  }

  return (
    <div className="page active" id="pg-news">
      <JsonLd data={ld} />
      <div className="page-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1920&q=75" alt="책상 위에 펼쳐진 신문과 소식지" loading="lazy" />
        <div className="container ph-inner">
          <h1>소식</h1>
        </div>
      </div>
      <Tabbar prefix="news" base="/news" tabs={TABS} />

      <section className="sub-section" id="news-notice">
        <div className="container">
          <div className="sec-head"><h2>공지사항</h2><p>조합의 주요 소식을 알립니다.</p></div>
          <table className="board-table">
            <thead><tr><th style={{ width: 70 }} className="hide-m">번호</th><th>제목</th><th style={{ width: 110 }}>게시일</th><th style={{ width: 80 }} className="hide-m">조회</th></tr></thead>
            <tbody id="noticeBoard">
              {notices.items.length === 0 ? (
                /* 행에 data-href 가 없어 이동이 안 되므로 tbody tr 의 pointer 커서만 되돌린다 */
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={4}><div className="empty-note">등록된 공지사항이 없습니다.</div></td>
                </tr>
              ) : (
                notices.items.map((n, i) => (
                  <tr key={n.id} data-href={`/news/${n.id}`}>
                    {/* 번호 열은 서버가 주지 않아 명세 공식(total-(page-1)*limit-index)으로 계산 */}
                    <td className="hide-m">{postNo(notices.total, notices.page, notices.limit, i)}</td>
                    <td className="t-title">{n.isPinned && <span className="pill pill-new">중요</span>}{n.title}</td>
                    <td>{formatPostDate(n.createdAt)}</td>
                    <td className="hide-m">{n.viewCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <BoardPager page={notices.page} total={notices.total} limit={notices.limit} makeHref={noticeHref} label="공지사항" />
        </div>
      </section>

      <section className="sub-section bg-soft" id="news-list">
        <div className="container">
          <div className="sec-head"><h2>활동 소식</h2><p>조합 활동 현장의 소식입니다.</p></div>
          {activities.items.length === 0 ? (
            /* .news-grid 는 2열 그리드라 안내문 한 칸만 채우면 반쪽으로 보인다 — 컨테이너째 교체 */
            <div className="empty-note">등록된 활동 소식이 없습니다.</div>
          ) : (
            <div className="news-grid" id="newsGrid">
              {activities.items.map((a) => (
                <NewsCard key={a.id} post={a} />
              ))}
            </div>
          )}
          <BoardPager page={activities.page} total={activities.total} limit={activities.limit} makeHref={activityHref} label="활동 소식" />
        </div>
      </section>
    </div>
  )
}
