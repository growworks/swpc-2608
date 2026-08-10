import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { getProgram, getPrograms } from '@/lib/api/content'
import { abs, breadcrumbLd, WEBSITE_ID } from '@/lib/seo'

export const revalidate = 3600
export const dynamicParams = false

const TAB_LABELS: Record<string, string> = {
  univ: '비영리 대학',
  ynafc: '유소년축구',
  mind: '마음건강',
  bio: '바이오치유',
  foot: '발진단',
  startup: '창업특강',
}

export async function generateStaticParams() {
  const programs = await getPrograms()
  return programs.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const program = await getProgram(id)
  if (!program) return {}
  return {
    title: program.name,
    description: program.d,
    alternates: { canonical: `/programs/${id}` },
    openGraph: { title: program.name, description: program.d, images: [{ url: program.local }] },
  }
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const programs = await getPrograms()
  const program = programs.find((p) => p.id === id)
  if (!program) notFound()

  const i = programs.indexOf(program)
  const prev = programs[i + 1]
  const next = programs[i - 1]

  return (
    <div className="page active" id="pg-program-detail">
      {/* 프로그램은 게시일 개념이 없어 Article 대신 WebPage 로 기술한다 (교육프로그램 목록 페이지가 없어 브레드크럼 중간 항목은 링크 없음) */}
      <JsonLd
        data={[
          breadcrumbLd([{ name: '홈', path: '/' }, { name: '교육프로그램' }, { name: program.name }]),
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: program.name,
            url: abs(`/programs/${id}`),
            description: program.d,
            image: abs(program.local),
            inLanguage: 'ko-KR',
            isPartOf: { '@id': WEBSITE_ID },
          },
        ]}
      />
      <div className="page-hero short" id="pdHero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img id="pdHeroImg" src={program.hero || program.local} alt={program.heroAlt || program.alt} loading="lazy" />
        <div className="container ph-inner">
          <h1 id="pdTitle">{program.name}</h1>
        </div>
      </div>
      <nav className="tabbar">
        <div className="container tabbar-in">
          {programs.map((p) => (
            <Link key={p.id} href={`/programs/${p.id}`} data-tab={p.id} className={p.id === id ? 'on' : undefined}>
              {TAB_LABELS[p.id] || p.name}
            </Link>
          ))}
        </div>
      </nav>
      <section className="sub-section">
        <div className="container detail-wrap" id="programDetailBody">
          <div className="detail-head">
            <span className="pill pill-navy">{program.tag}</span>
            <h1>{program.name}</h1>
            <div className="detail-meta"><span>학교복지진흥사회적협동조합 교육프로그램</span></div>
          </div>
          <figure className="detail-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={program.local} alt={program.alt} loading="lazy" />
            {program.photoCap ? <figcaption>{program.photoCap}</figcaption> : null}
          </figure>
          <div className="detail-body" data-html-body dangerouslySetInnerHTML={{ __html: program.intro }} />
          <h3 style={{ fontSize: 21.5, fontWeight: 900, color: 'var(--c-900)', margin: '32px 0 16px' }}>주요 내용</h3>
          <div className="grid-2">
            {program.feats.map(([t, d]) => (
              <div className="plain-card" key={t}>
                <h3 style={{ fontSize: 19 }}>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
          {program.extra && <div data-html-body dangerouslySetInnerHTML={{ __html: program.extra }} />}
          {program.gallery && (
            <>
              <h3 style={{ fontSize: 21.5, fontWeight: 900, color: 'var(--c-900)', margin: '32px 0 16px' }}>활동 사진</h3>
              <div className="grid-2 gallery-grid">
                {program.gallery.map(([src, cap]) => (
                  <figure className="detail-img" key={src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={cap} loading="lazy" />
                    <figcaption>{cap}</figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
          <div className="notice-box" style={{ marginTop: 30 }}>
            <strong>참여 문의</strong> · 교육프로그램 참여·모집 일정은 전화 042-931-1479 또는 이메일 post114@hanmail.net으로 문의해 주세요. <span style={{ whiteSpace: 'nowrap' }}>(평일 09:00~18:00)</span>
          </div>
          <nav className="detail-nav" style={{ marginTop: 34 }}>
            {next && (
              <Link href={`/programs/${next.id}`}><span className="dn-label">이전 프로그램</span>{next.name}</Link>
            )}
            {prev && (
              <Link href={`/programs/${prev.id}`}><span className="dn-label">다음 프로그램</span>{prev.name}</Link>
            )}
          </nav>
        </div>
      </section>
    </div>
  )
}
