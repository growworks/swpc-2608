import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbLd } from '@/lib/seo'
import { TermsBody } from '@/components/policy/TermsBody'

export const metadata: Metadata = {
  title: '이용약관',
  description:
    '학교복지진흥사회적협동조합 홈페이지 이용약관. 서비스 내용, 회원가입·탈퇴, 회원과 조합의 의무, 게시물·저작권, 면책과 관할 안내. 시행일 2026년 8월 11일.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div className="page active" id="pg-terms">
      <JsonLd
        data={breadcrumbLd([
          { name: '홈', path: '/' },
          { name: '고객센터', path: '/support' },
          { name: '이용약관', path: '/terms' },
        ])}
      />
      <div className="page-hero short">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=75" alt="정돈된 상담 데스크와 사무 공간" loading="lazy" />
        <div className="container ph-inner">
          <h1>이용약관</h1>
        </div>
      </div>
      <section className="sub-section">
        <div className="container detail-wrap">
          <div className="detail-head">
            <span className="pill pill-navy">정책·약관</span>
            <h1>이용약관</h1>
            <div className="detail-meta">
              <span>시행일 2026-08-11</span>
              <span>학교복지진흥사회적협동조합</span>
            </div>
          </div>
          <div className="detail-body">
            <TermsBody />
          </div>
        </div>
      </section>
    </div>
  )
}
