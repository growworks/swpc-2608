import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ApiError } from '@/lib/api/client'
import { getReportDetail } from '@/lib/api/content'
import { donationDocImage, formatPostDate, postFiles } from '@/lib/api/posts'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleLd, breadcrumbLd, postDateISO, stripHtml } from '@/lib/seo'

/** 상세 조회는 호출마다 viewCount 가 +1 되므로 ISR/프리렌더를 쓰지 않는다 */
export const dynamic = 'force-dynamic'

/**
 * generateMetadata 와 본문 렌더가 각각 API 를 때리면 조회수가 2씩 오른다.
 * 같은 요청 안에서 1회만 호출되도록 React cache 로 묶는다.
 */
const loadReport = cache(async (id: number) => getReportDetail(id))

/** URL 식별자는 정수 PK 계약 — 그 외 문자열은 조회 없이 404 */
function parseId(raw: string): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const pk = parseId(id)
  if (pk === null) return {}
  try {
    const { post, kind } = await loadReport(pk)
    /* 본문 요약을 설명으로 — 공시 글마다 고유해야 한다. 빈 본문만 고정 문구로 폴백 */
    const description =
      stripHtml(post.content) ||
      `${kind === 'mgmt' ? '경영공시' : '기부금공시'} · 게시일 ${formatPostDate(post.createdAt)} · 로그인 없이 공개 열람할 수 있습니다.`
    const docImageUrl = donationDocImage(post)
    return {
      title: post.title,
      description,
      alternates: { canonical: `/report/${post.id}` },
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        /* 공유 이미지는 기부금공시 내역서(field_1)만 — 경영공시 field_1 은 파일 배열이라 이미지가 아니다 */
        ...(docImageUrl ? { images: [{ url: docImageUrl }] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pk = parseId(id)
  if (pk === null) notFound()

  let data: Awaited<ReturnType<typeof loadReport>>
  try {
    data = await loadReport(pk)
  } catch (err) {
    /* 없는 글만 404. API 장애까지 404 로 덮으면 법정 공시 문서가 삭제된 것처럼 보이고
       검색엔진이 유효한 공시 URL 을 색인에서 내린다 — error 코드로만 분기한다 */
    if (err instanceof ApiError && err.code === 'POST_NOT_FOUND') notFound()
    throw err
  }

  const { post, kind } = data
  const isM = kind === 'mgmt'
  /* custom.field_1 은 카테고리마다 의미가 다르다 — 기부금공시=내역서 이미지, 경영공시=첨부 서류 */
  const docImageUrl = donationDocImage(post)
  const files = postFiles(post)

  return (
    <div className="page active" id="pg-report-detail">
      <JsonLd
        data={[
          breadcrumbLd([{ name: '홈', path: '/' }, { name: '투명공시', path: '/report' }, { name: post.title }]),
          articleLd({
            title: post.title,
            path: `/report/${post.id}`,
            datePublished: postDateISO(post.createdAt),
            description: stripHtml(post.content),
            image: docImageUrl,
            section: isM ? '경영공시' : '기부금공시',
          }),
        ]}
      />
      <div className="page-hero short">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=75" alt="결산 서류와 계산기가 놓인 책상" loading="lazy" />
        <div className="container ph-inner">
          <h1>{isM ? '경영공시' : '기부금공시'}</h1>
        </div>
      </div>
      <section className="sub-section">
        <div className="container detail-wrap">
          <div className="detail-head">
            <span className="pill pill-navy">{isM ? '경영공시' : '기부금공시'}</span>
            <h1>{post.title}</h1>
            {/* 작성자 표기는 명세상 커스텀 필드가 없어 두지 않는다 (필요 시 본문에 기재) */}
            <div className="detail-meta">
              <span>게시일 {formatPostDate(post.createdAt)}</span><span>조회 {post.viewCount}</span><span>로그인 없이 공개</span>
            </div>
          </div>
          <div className="detail-body" data-html-body dangerouslySetInnerHTML={{ __html: post.content }} />
          {docImageUrl && (
            <>
              <h3 style={{ fontSize: 21.5, fontWeight: 900, color: 'var(--c-900)', margin: '30px 0 12px' }}>첨부 내역서</h3>
              <figure className="detail-img" style={{ border: '1px solid var(--line)' }}>
                {/* 별도 alt 필드가 없어 게시글 제목을 쓴다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={docImageUrl} alt={post.title} loading="lazy" />
              </figure>
            </>
          )}
          {files.length > 0 && (
            <>
              <h3 style={{ fontSize: 20.5, fontWeight: 900, color: 'var(--c-900)', margin: '30px 0 4px' }}>첨부 서류</h3>
              {files.map((f) => (
                /* 확장자 제한이 없어(hwp·xlsx 가능) 배지는 파일명 확장자로 표기한다 */
                <a className="file-row" key={f.url} href={f.url} download={f.name} target="_blank" rel="noopener">
                  <span className="pill pill-pdf">{(f.name.includes('.') ? f.name.split('.').pop() : 'FILE')?.toUpperCase().slice(0, 5)}</span>
                  {f.name}
                  {f.sizeLabel && <span className="fsize">{f.sizeLabel}</span>}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginLeft: 10 }} aria-hidden="true"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 19h16" /></svg>
                </a>
              ))}
            </>
          )}
          <div className="detail-actions">
            <Link className="btn btn-outline" href={isM ? '/report' : '/report#report-donation'}>목록으로</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
