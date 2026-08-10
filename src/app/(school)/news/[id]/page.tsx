import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ApiError } from '@/lib/api/client'
import { getNewsDetail } from '@/lib/api/content'
import { activityMeta, formatPostDate } from '@/lib/api/posts'
import { JsonLd } from '@/components/seo/JsonLd'
import { articleLd, breadcrumbLd, postDateISO, stripHtml } from '@/lib/seo'

/* 상세 조회(GET /posts/{id})는 호출마다 viewCount 가 +1 된다 — ISR 로 굳히면 조회수가 멈춘다 */
export const dynamic = 'force-dynamic'

/**
 * generateMetadata 와 본문이 각각 조회하면 viewCount 가 한 번 열람에 2씩 오른다.
 * React cache 로 요청 단위 1회 호출로 묶어 증가량을 1로 유지한다.
 */
const loadNews = cache((id: number) => getNewsDetail(id))

/** 상세 식별자는 명세상 정수 PK — 문자열 id(n6 등)는 더 이상 유효하지 않다 */
function parseId(raw: string): number | null {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const postId = parseId(id)
  if (postId === null) return {}
  try {
    const { post, kind } = await loadNews(postId)
    /* 본문 요약을 설명으로 쓴다 — 글마다 고유해야 검색 스니펫이 겹치지 않는다. 빈 본문만 고정 문구로 폴백 */
    const description =
      stripHtml(post.content) ||
      `${kind === 'notice' ? '공지사항' : '활동 소식'} · 게시일 ${formatPostDate(post.createdAt)} · 학교복지진흥사회적협동조합`
    const thumbnailUrl = kind === 'notice' ? null : activityMeta(post).thumbnailUrl
    return {
      title: post.title,
      description,
      alternates: { canonical: `/news/${postId}` },
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        /* 공유 썸네일은 활동소식의 field_2 만 — 공지사항은 대표 이미지 필드가 없다 */
        ...(thumbnailUrl ? { images: [{ url: thumbnailUrl }] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = parseId(id)
  if (postId === null) notFound()

  let data: Awaited<ReturnType<typeof getNewsDetail>>
  try {
    data = await loadNews(postId)
  } catch (err) {
    /* 없는 글만 404. status 로 분기하면 SITE_NOT_FOUND·NOT_DEPLOYED(설정·배포 장애)까지
       "없는 글"로 위장돼 원인을 놓친다 — 명세대로 error 코드로만 분기한다 */
    if (err instanceof ApiError && err.code === 'POST_NOT_FOUND') notFound()
    throw err
  }

  const { post, kind, prev, next } = data
  const isNotice = kind === 'notice'
  /* 공지/활동소식 분기는 id 프리픽스가 아니라 category 기반(content.getNewsDetail) */
  const meta = isNotice ? null : activityMeta(post)

  const pill = isNotice ? (post.isPinned ? 'pill-new' : 'pill-navy') : 'pill-line'
  /* 활동소식 라벨은 custom.topic — 운영자가 비워두면 빈 pill 이 남으므로 기본값을 쓴다 */
  const pillLabel = isNotice
    ? post.isPinned
      ? '중요 공지'
      : '공지사항'
    : (meta?.topic ?? '활동 소식')

  return (
    <div className="page active" id="pg-news-detail">
      <JsonLd
        data={[
          breadcrumbLd([{ name: '홈', path: '/' }, { name: '소식', path: '/news' }, { name: post.title }]),
          articleLd({
            title: post.title,
            path: `/news/${postId}`,
            datePublished: postDateISO(post.createdAt),
            description: stripHtml(post.content),
            image: meta?.thumbnailUrl,
            /* 활동소식은 운영자가 넣은 구분 배지(topic)가 있으면 그 값이 실제 섹션명 */
            section: isNotice ? '공지사항' : (meta?.topic ?? '활동소식'),
          }),
        ]}
      />
      <div className="page-hero short">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1920&q=75" alt="책상 위에 펼쳐진 신문과 소식지" loading="lazy" />
        <div className="container ph-inner">
          <h1>{isNotice ? '공지사항' : '활동 소식'}</h1>
        </div>
      </div>
      <section className="sub-section">
        <div className="container detail-wrap">
          <div className="detail-head">
            <span className={`pill ${pill}`}>{pillLabel}</span>
            <h1>{post.title}</h1>
            <div className="detail-meta">
              <span>게시일 {formatPostDate(post.createdAt)}</span>
              {/* 활동소식은 조회수 미노출 (데모도 활동소식엔 views 없음) — 공지사항만 표시 */}
              {isNotice && post.viewCount ? <span>조회 {post.viewCount}</span> : null}
              <span>학교복지진흥사회적협동조합</span>
            </div>
          </div>
          {/* 데모 원본 마크업: figure.detail-img > img + figcaption(이미지 설명 = field_3) */}
          {meta?.thumbnailUrl && (
            <figure className="detail-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={meta.thumbnailUrl} alt={meta.thumbnailAlt} loading="lazy" />
              {meta.caption && <figcaption>{meta.caption}</figcaption>}
            </figure>
          )}
          <div className="detail-body" data-html-body dangerouslySetInnerHTML={{ __html: post.content }} />
          <nav className="detail-nav">
            {next && (
              <Link href={`/news/${next.id}`}><span className="dn-label">다음 글</span>{next.title}</Link>
            )}
            {prev && (
              <Link href={`/news/${prev.id}`}><span className="dn-label">이전 글</span>{prev.title}</Link>
            )}
          </nav>
          <div className="detail-actions">
            <Link className="btn btn-outline" href={isNotice ? '/news' : '/news#news-list'}>목록으로</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
