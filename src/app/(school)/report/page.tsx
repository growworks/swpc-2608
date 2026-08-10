import type { Metadata } from 'next'
import { Tabbar } from '@/components/ui/Tabbar'
import { BoardPager } from '@/components/ui/BoardPager'
import { JsonLd } from '@/components/seo/JsonLd'
import { getDonationBoard, getMgmtBoard, PAGE_SIZE, type BoardPage } from '@/lib/api/content'
import { formatPostDate, postFiles, postNo } from '@/lib/api/posts'
import { abs, breadcrumbLd, itemListLd } from '@/lib/seo'

/* searchParams(페이지 번호)를 읽으므로 동적 렌더 — 데이터는 getPosts 의 fetch 캐시(300초)를 탄다 */

export const metadata: Metadata = {
  title: '투명공시',
  description:
    '학교복지진흥사회적협동조합 경영공시·기부금공시·정관·인가증. 로그인 없이 누구나 열람할 수 있으며 연도별 기록을 삭제 없이 보존합니다.',
  alternates: { canonical: '/report' },
}

const TABS = [
  { key: 'mgmt', label: '경영공시' },
  { key: 'donation', label: '기부금공시' },
  { key: 'docs', label: '정관·인가증' },
]

/**
 * 게시판 조회 실패가 정관·인가증(공개 의무가 있는 정적 자산) 노출까지 막으면 안 되므로
 * 빈 목록으로 낙하시켜 페이지 자체는 항상 렌더한다.
 */
function parsePage(raw: string | undefined): number {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : 1
}

async function loadBoard(load: () => Promise<BoardPage>, limit: number): Promise<BoardPage> {
  try {
    return await load()
  } catch {
    return { items: [], total: 0, page: 1, limit }
  }
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ mp?: string; dp?: string }>
}) {
  const sp = await searchParams
  const mp = parsePage(sp.mp)
  const dp = parsePage(sp.dp)

  /* 경영공시·기부금공시를 게시판별로 각각 호출해 서버 페이징을 쓴다 (각 5건) */
  const [mgmt, donation] = await Promise.all([
    loadBoard(() => getMgmtBoard(mp), PAGE_SIZE.mgmt),
    loadBoard(() => getDonationBoard(dp), PAGE_SIZE.donation),
  ])

  /* 서로의 페이지를 유지한 채 이동 + 섹션 앵커 */
  const mgmtHref = (p: number) => `/report?mp=${p}${dp > 1 ? `&dp=${dp}` : ''}#report-mgmt`
  const donationHref = (p: number) => `/report?${mp > 1 ? `mp=${mp}&` : ''}dp=${p}#report-donation`

  return (
    <div className="page active" id="pg-report">
      {/* 구조화 데이터 — ItemList 는 현재 페이지 항목만 담고, 빈 게시판은 생략(news 와 동일 방침) */}
      <JsonLd
        data={[
          breadcrumbLd([{ name: '홈', path: '/' }, { name: '투명공시' }]),
          ...(mgmt.items.length
            ? [itemListLd('경영공시', mgmt.items.map((p) => ({ url: abs(`/report/${p.id}`), name: p.title })))]
            : []),
          ...(donation.items.length
            ? [itemListLd('기부금공시', donation.items.map((p) => ({ url: abs(`/report/${p.id}`), name: p.title })))]
            : []),
        ]}
      />
      <div className="page-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=75" alt="결산 서류와 계산기가 놓인 책상" loading="lazy" />
        <div className="container ph-inner">
          <h1>투명공시</h1>
        </div>
      </div>
      <Tabbar prefix="report" base="/report" tabs={TABS} />

      <section className="sub-section" id="report-mgmt">
        <div className="container">
          <div className="sec-head"><h2>경영공시</h2><p>경영공시는 <strong>로그인·비밀번호 없이</strong> 누구나 열람할 수 있으며, 연도별 기록을 삭제 없이 보존합니다.</p></div>
          <table className="board-table">
            <thead><tr><th style={{ width: 70 }} className="hide-m">번호</th><th>제목</th><th style={{ width: 110 }}>게시일</th><th style={{ width: 80 }} className="hide-m">첨부</th></tr></thead>
            <tbody id="mgmtBoard">
              {mgmt.items.map((p, i) => {
                const files = postFiles(p)
                return (
                  <tr key={p.id} data-href={`/report/${p.id}`}>
                    <td className="hide-m">{postNo(mgmt.total, mgmt.page, mgmt.limit, i)}</td>
                    <td className="t-title">{p.isPinned && <span className="pill pill-new">최신</span>}{p.title}</td>
                    <td>{formatPostDate(p.createdAt)}</td>
                    <td className="hide-m">{files.length ? `${files.length}건` : '-'}</td>
                  </tr>
                )
              })}
              {mgmt.items.length === 0 && (
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={4}><div className="empty-note">등록된 경영공시가 없습니다.</div></td>
                </tr>
              )}
            </tbody>
          </table>
          <BoardPager page={mgmt.page} total={mgmt.total} limit={mgmt.limit} makeHref={mgmtHref} label="경영공시" />
          <div className="notice-box" style={{ marginTop: 22 }}>
            <strong>경영공시 안내</strong> · 모든 사회적협동조합은 매년 경영공시 의무가 있으며, 정기총회에서 전년도 사업·결산 보고와 금년도 사업계획·예산, 감사보고서를 의결한 뒤 4월에 협동조합 포털(coop.go.kr)에 공시합니다.
          </div>
        </div>
      </section>

      <section className="sub-section bg-soft" id="report-donation">
        <div className="container">
          <div className="sec-head"><h2>기부금공시</h2><p>정관 제59조의2에 따라 매년 3월 31일까지 기부금 모금액 및 활용 실적을 공개합니다.</p></div>
          <table className="board-table">
            <thead><tr><th style={{ width: 70 }} className="hide-m">번호</th><th>제목</th><th style={{ width: 110 }}>게시일</th><th style={{ width: 80 }} className="hide-m">조회</th></tr></thead>
            <tbody id="donBoard">
              {donation.items.map((p, i) => (
                <tr key={p.id} data-href={`/report/${p.id}`}>
                  <td className="hide-m">{postNo(donation.total, donation.page, donation.limit, i)}</td>
                  <td className="t-title">{p.isPinned && <span className="pill pill-new">최신</span>}{p.title}</td>
                  <td>{formatPostDate(p.createdAt)}</td>
                  <td className="hide-m">{p.viewCount}</td>
                </tr>
              ))}
              {donation.items.length === 0 && (
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={4}><div className="empty-note">등록된 기부금공시가 없습니다.</div></td>
                </tr>
              )}
            </tbody>
          </table>
          <BoardPager page={donation.page} total={donation.total} limit={donation.limit} makeHref={donationHref} label="기부금공시" />
        </div>
      </section>

      <section className="sub-section" id="report-docs">
        <div className="container">
          <div className="sec-head"><h2>정관·인가증</h2><p>조합 운영의 근거 문서를 공개합니다. 인허가증은 클라이언트 제공 원본 사본입니다.</p></div>
          <div className="grid-3" style={{ maxWidth: 1200 }}>
            <div className="plain-card">
              <h3>설립인가증</h3>
              <div className="detail-img" style={{ margin: '0 0 12px' }}>{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/archive/images/license-approval.jpg" alt="사회적협동조합 설립인가증 · 인가번호 제33호, 교육부장관, 2014년 12월 19일" loading="lazy" /></div>
              <p>교육부장관 인가번호 제33호 · 「협동조합기본법」 제85조제1항 · 2014.12.19</p>
            </div>
            <div className="plain-card">
              <h3>인터넷신문사업 등록증</h3>
              <div className="detail-img" style={{ margin: '0 0 12px' }}>{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/archive/images/license-newspaper.jpg" alt="인터넷신문사업 등록증 · CWC교원투데이, 대전 아00480, 2023년 12월 19일" loading="lazy" /></div>
              <p>제호 CWC교원투데이 · 대전 아00480 · 등록 2023.12.19 · 대전광역시장</p>
            </div>
            <div className="plain-card">
              <h3>사업자등록증 (본점)</h3>
              <div className="detail-img" style={{ margin: '0 0 12px' }}>{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/archive/images/license-biz-main.jpg" alt="사업자등록증 · 면세법인사업자 본점, 등록번호 213-82-08827" loading="lazy" /></div>
              <p>등록번호 213-82-08827 · 면세법인(본점) · 개업 2015.1.26</p>
            </div>
          </div>
          <div className="grid-3" style={{ marginTop: 22, maxWidth: 1200 }}>
            <div className="plain-card">
              <h3>사업자등록증 (지점)</h3>
              <div className="detail-img" style={{ margin: '0 0 12px' }}>{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/archive/licenses/license-biz-branch.jpg" alt="사업자등록증 · 면세법인사업자 지점, 등록번호 360-82-00382" loading="lazy" /></div>
              <p>등록번호 360-82-00382 · 면세법인(지점) · 개업 2021.12.1</p>
            </div>
            <div className="plain-card">
              <h3>사업자등록증 별지 · 사업의 종류</h3>
              <div className="detail-img" style={{ margin: '0 0 12px' }}>{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/archive/licenses/license-biz-annex.jpg" alt="사업자등록증 별지 · 교육서비스·보건·스포츠 등 사업의 종류 목록" loading="lazy" /></div>
              <p>교육서비스·보건·스포츠·돌봄 등 등록 업종 목록 (본점 별지)</p>
            </div>
            <div className="plain-card">
              <h3>소독업 신고증 <span className="pill pill-line">개인정보 블라인드</span></h3>
              <div className="detail-img" style={{ margin: '0 0 12px' }}>{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/archive/licenses/license-disinfection.jpg" alt="소독업 신고증 · 달성군, 2025년 7월 28일 (대표자 생년월일 등 개인정보 블라인드 처리)" loading="lazy" /></div>
              <p>달성군 신고(2025.7.28) · 대표자 생년월일은 개인정보 보호를 위해 블라인드 처리했습니다.</p>
            </div>
          </div>
          <div style={{ marginTop: 22, maxWidth: 590 }}>
            <div className="plain-card">
              <h3><span className="pill pill-pdf">PDF</span> 정관</h3>
              <p style={{ marginBottom: 14 }}>조합 운영의 기본 규정입니다. 아래에서 전문을 내려받을 수 있습니다.</p>
              <a className="btn btn-outline btn-sm" href="/archive/docs/articles.pdf" download="학교복지진흥사회적협동조합_정관.pdf" target="_blank" rel="noopener">
                정관 내려받기 (PDF · 262KB)
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 19h16" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
