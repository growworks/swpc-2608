import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbLd } from '@/lib/seo'
import { PrivacyBody } from '@/components/policy/PrivacyBody'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description:
    '학교복지진흥사회적협동조합 개인정보처리방침. 수집 항목·이용 목적·보유 기간, 처리 위탁, 정보주체 권리와 행사 방법, 개인정보 보호책임자(042-931-1479) 안내. 시행일 2026년 8월 11일.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="page active" id="pg-privacy">
      <JsonLd
        data={breadcrumbLd([
          { name: '홈', path: '/' },
          { name: '고객센터', path: '/support' },
          { name: '개인정보처리방침', path: '/privacy' },
        ])}
      />
      <div className="page-hero short">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=75" alt="정돈된 상담 데스크와 사무 공간" loading="lazy" />
        <div className="container ph-inner">
          <h1>개인정보처리방침</h1>
        </div>
      </div>
      <section className="sub-section">
        <div className="container detail-wrap">
          <div className="detail-head">
            <span className="pill pill-navy">정책·약관</span>
            <h1>개인정보처리방침</h1>
            <div className="detail-meta">
              <span>시행일 2026-08-11</span>
              <span>학교복지진흥사회적협동조합</span>
            </div>
          </div>
          <div className="detail-body">
            <PrivacyBody />
          </div>
        </div>
      </section>
    </div>
  )
}
