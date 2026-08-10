import type { Metadata } from 'next'
import { Tabbar } from '@/components/ui/Tabbar'
import { JsonLd } from '@/components/seo/JsonLd'
import { getBiz6 } from '@/lib/api/content'
import { breadcrumbLd } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '사업소개',
  description:
    '학교복지진흥사회적협동조합의 6대 사업(학교 환경개선·전자상거래·보건교육·위탁운영·유소년축구·영유아교육)과 기타 사업, 법령 근거를 안내합니다.',
  alternates: { canonical: '/business' },
}

const TABS = [
  { key: 'main', label: '6대 사업' },
  { key: 'etc', label: '기타 사업' },
  { key: 'law', label: '법령 근거' },
]

export default async function BusinessPage() {
  const biz6 = await getBiz6()

  return (
    <div className="page active" id="pg-biz">
      <JsonLd data={breadcrumbLd([{ name: '홈', path: '/' }, { name: '사업소개', path: '/business' }])} />
      <div className="page-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1920&q=75" alt="책과 노트가 놓인 학습 책상" loading="lazy" />
        <div className="container ph-inner">
          <h1>사업소개</h1>
        </div>
      </div>
      <Tabbar prefix="biz" base="/business" tabs={TABS} />

      <section className="sub-section" id="biz-main">
        <div className="container">
          <div className="sec-head"><h2>6대 사업</h2>
            <p>조합은 아래 각 호의 사업을 주 사업으로 하며, 주 사업은 협동조합 전체 사업비의 100분의 40 이상으로 합니다.</p></div>
          <div className="grid-3" id="bizMainGrid">
            {biz6.map(([t, d]) => (
              <div className="plain-card" key={t}><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
          <h3 style={{ fontSize: 21.5, fontWeight: 900, color: 'var(--c-900)', margin: '48px 0 18px' }}>운영 방향</h3>
          <div className="flow3">
            <div><b>운영기반 구축</b><span>협업 능력을 갖춘 조직 기반 마련</span></div>
            <div><b>공동체 활성화</b><span>공동체 활성화 프로그램 운영</span></div>
            <div><b>운영 활성화</b><span>인재 육성으로 지속 가능한 운영</span></div>
          </div>
        </div>
      </section>

      <section className="sub-section bg-soft" id="biz-etc">
        <div className="container">
          <div className="sec-head"><h2>기타 사업</h2><p>조합은 주 사업 목적 달성을 위해 다음 각 호의 사업을 기타 사업으로 합니다.</p></div>
          <div className="grid-2" style={{ maxWidth: 1150 }}>
            <div className="plain-card"><h3>1. 조합원·직원 상담·교육·훈련 및 정보제공</h3><p>조합원과 직원에 대한 상담·교육·훈련 및 정보제공 사업을 운영합니다.</p></div>
            <div className="plain-card"><h3>2. 조합 간 협력</h3><p>협동조합 간 연대와 협력을 위한 사업을 수행합니다.</p></div>
            <div className="plain-card"><h3>3. 홍보 및 지역사회 사업</h3><p>조합의 홍보 및 지역사회를 위한 사업을 수행합니다.</p></div>
            <div className="plain-card"><h3>4. 청소년 활동·복지·문화·보호 및 장학 연수</h3>
              <ul><li>청소년교육(장학)연수 · 직원(조합원)연수 · 소통(교류)·정보(제공) 서비스</li>
                <li>청소년활동: 수련·문화·교류·참여활동</li>
                <li>청소년복지: 자립지원·상담복지·학교 밖 지원센터</li></ul></div>
          </div>
          <h3 style={{ fontSize: 21.5, fontWeight: 900, color: 'var(--c-900)', margin: '48px 0 8px' }}>직업능력개발 교육·지원</h3>
          <p style={{ fontSize: 17.5, color: 'var(--ink-muted)', marginBottom: 22 }}>근로자의 직업능력개발을 교육·지원하고 기업의 인적자원 경쟁력을 높이는 서비스를 제공합니다.</p>
          <div className="ring-grid">
            <div className="ring">청년<br />직업능력개발<br />교육</div>
            <div className="ring">근로자·기업<br />직업능력개발<br />교육</div>
            <div className="ring">직업능력개발<br />인프라 지원</div>
            <div className="ring">훈련품질 향상<br />교육</div>
          </div>
        </div>
      </section>

      <section className="sub-section" id="biz-law">
        <div className="container">
          <div className="sec-head"><h2>법령 근거</h2><p>사회적협동조합의 설립·운영과 조세 특례의 근거 법령입니다.</p></div>
          <table className="board-table" style={{ maxWidth: 1150 }}>
            <thead><tr><th style={{ width: 220 }}>법령</th><th>내용</th></tr></thead>
            <tbody>
              <tr><td>협동조합기본법 제85조</td><td className="t-title">사회적협동조합의 설립인가 · 기획재정부장관(관계 중앙행정기관의 장) 인가</td></tr>
              <tr><td>협동조합기본법 제93조</td><td className="t-title">사회적협동조합의 사업 · 지역사회 재생·주민 권익 증진, 취약계층 사회서비스·일자리 제공 등 공익사업 40% 이상 수행</td></tr>
              <tr><td>협동조합기본법 제96조</td><td className="t-title">경영공시 · 결산결과·총회 의사록 등 주요 경영자료의 공시 의무</td></tr>
              <tr><td>협동조합기본법 제96조의2</td><td className="t-title">경영공시의 통합 공시 · 기획재정부장관이 지정하는 인터넷 사이트를 통한 통합 공시</td></tr>
              <tr><td>부가가치세법 시행령 제36조</td><td className="t-title">면세하는 인적 용역의 범위 · 비영리 교육·복지 용역 관련 면세 근거</td></tr>
            </tbody>
          </table>
          <div className="notice-box" style={{ marginTop: 22, maxWidth: 1150 }}>
            <strong>참고</strong> · 조문 요지는 안내용 요약입니다. 정확한 내용은 국가법령정보센터(law.go.kr)의 현행 법령을 확인해 주세요.
          </div>
        </div>
      </section>
    </div>
  )
}
