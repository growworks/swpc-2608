import type { Metadata } from 'next'
import { Tabbar } from '@/components/ui/Tabbar'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbLd } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '참여하기',
  description:
    '학교복지진흥사회적협동조합 조합원 가입(생산자·소비자·직원·후원자·자원봉사), 강사·자원봉사, 협력·제휴 안내. 가입 상담 042-931-1479.',
  alternates: { canonical: '/join' },
}

const TABS = [
  { key: 'member', label: '조합원 가입' },
  { key: 'volunteer', label: '강사·자원봉사' },
  { key: 'partner', label: '협력·제휴' },
]

export default function JoinPage() {
  return (
    <div className="page active" id="pg-join">
      <JsonLd data={breadcrumbLd([{ name: '홈', path: '/' }, { name: '참여하기', path: '/join' }])} />
      <div className="page-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=75" alt="밝은 분위기의 협력 사무 공간" loading="lazy" />
        <div className="container ph-inner">
          <h1>참여하기</h1>
        </div>
      </div>
      <Tabbar prefix="join" base="/join" tabs={TABS} />

      <section className="sub-section" id="join-member">
        <div className="container">
          <div className="sec-head"><h2>조합원 가입</h2><p>사회적협동조합의 뜻에 동의하는 누구나 유형별 조합원으로 참여할 수 있습니다.</p></div>
          <div className="biz-grid" style={{ marginBottom: 40 }}>
            <div className="plain-card"><h3>생산자 조합원</h3><p>교육·복지 서비스를 함께 만드는 강사·전문가·활동가.</p></div>
            <div className="plain-card"><h3>소비자 조합원</h3><p>프로그램과 서비스를 이용하는 학생·학부모·교직원.</p></div>
            <div className="plain-card"><h3>직원 조합원</h3><p>조합 사무국·산하 기관에서 일하는 직원.</p></div>
            <div className="plain-card"><h3>후원자 조합원</h3><p>출자와 후원으로 조합의 공익 활동을 응원하는 개인·단체.</p></div>
            <div className="plain-card"><h3>자원봉사 회원</h3><p>주도적으로 일손 돕기 및 운영 참여</p><p className="p-sub">단순 노무, 행정 사무지원, 재능기부 등</p></div>
          </div>
          <div style={{ maxWidth: 980 }}>
            <h3 style={{ fontSize: 21.5, fontWeight: 900, color: 'var(--c-900)', marginBottom: 14 }}>가입 절차</h3>
            <table className="info-table">
              <tbody>
                <tr><th>1. 상담·문의</th><td>042-931-1479 또는 post114@hanmail.net으로 가입 상담</td></tr>
                <tr><th>2. 가입 신청</th><td>가입신청서 작성·제출 (정관 및 출자 안내 제공)</td></tr>
                <tr><th>3. 이사회 승인</th><td>정관에 따른 가입 승인 절차 진행</td></tr>
                <tr><th>4. 출자금 납입</th><td>승인 후 출자금 납입으로 조합원 자격 취득</td></tr>
              </tbody>
            </table>
            <div className="notice-box" style={{ marginTop: 18 }}><strong>안내</strong> · 출자 좌수·최소 출자금 등 세부 기준은 정관을 따르며, 상담 시 안내드립니다.</div>
          </div>
        </div>
      </section>

      <section className="sub-section bg-soft" id="join-volunteer">
        <div className="container">
          <div className="sec-head"><h2>강사·자원봉사</h2><p>소셜교육 프로그램과 학교복지 현장에서 재능을 나눌 분을 기다립니다.</p></div>
          <div className="grid-3" style={{ maxWidth: 1200 }}>
            <div className="plain-card"><h3>교육 강사</h3><p>축구·방송·생태·문화예술·상담 등 프로그램 분야별 강사로 활동합니다. 관련 자격·경력 소지자 우대.</p></div>
            <div className="plain-card"><h3>활동 보조 봉사</h3><p>캠프·행사·훈련 현장에서 학생 안전과 진행을 돕습니다. 봉사시간 확인서 발급.</p></div>
            <div className="plain-card"><h3>재능 나눔</h3><p>사진·영상·디자인·번역 등 전문 재능으로 조합 활동을 지원합니다.</p></div>
          </div>
          <p style={{ marginTop: 24, fontSize: 17.5, color: 'var(--ink-muted)' }}>참여 문의: 042-931-1479 · post114@hanmail.net</p>
        </div>
      </section>

      <section className="sub-section" id="join-partner">
        <div className="container">
          <div className="sec-head"><h2>협력·제휴</h2><p>학교·기관·기업과 함께 교육복지 협력망을 넓힙니다.</p></div>
          <div className="grid-3" style={{ maxWidth: 1200 }}>
            <div className="plain-card"><h3>학교·교육기관</h3><p>창의성 증진 진로·학습 프로그램 공동 개발, 맞춤형 인재 양성, 학교 밖 안전한 돌봄 시스템 구축.</p></div>
            <div className="plain-card"><h3>공공기관·지자체</h3><p>학교복합시설·체육시설·청소년시설 등 위탁 운영 및 공동 사업 협력.</p></div>
            <div className="plain-card"><h3>기업·단체</h3><p>기부금 후원, 환경 보호, 소외계층 지원 등의 캠페인 공동 진행 및 사회공헌 파트너십.</p></div>
          </div>
          <h3 style={{ fontSize: 21.5, fontWeight: 900, color: 'var(--c-900)', margin: '48px 0 18px' }}>함께 만드는 건강증진 사회공헌 파트너십의 핵심 4가지 가치</h3>
          <div className="grid-2" style={{ maxWidth: 1200 }}>
            <div className="plain-card"><h3>건강형평성 제고</h3><p>의료 취약계층과 소외계층이 보건의료 서비스에서 배제되지 않도록 격차를 해소하고 보편적 건강권을 보장합니다.</p></div>
            <div className="plain-card"><h3>지역사회 건강친화 공헌</h3><p>지역사회의 고유한 특성과 구체적인 현장 수요를 반영하여 일상 속 건강 증진 활동과 돌봄 인프라를 넓혀갑니다.</p></div>
            <div className="plain-card"><h3>건강증진 거버넌스 구축·운영</h3><p>기업, 지자체, 전문기관 등 다자간 평등한 파트너십 체계를 만들어 일회성 기부가 아닌 전략적 협력 구조를 확립합니다.</p></div>
            <div className="plain-card"><h3>지역자원 발굴·연계</h3><p>민간 기업이 가진 핵심 기술·인프라와 지역사회의 인적·물적 자원을 유기적으로 연결하여 사회적 가치를 극대화합니다.</p></div>
          </div>
        </div>
      </section>
    </div>
  )
}
