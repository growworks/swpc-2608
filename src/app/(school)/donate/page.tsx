import type { Metadata } from 'next'
import Link from 'next/link'
import { Tabbar } from '@/components/ui/Tabbar'
import { DonateForm } from '@/components/forms/DonateForm'
import { JsonLd } from '@/components/seo/JsonLd'
import { getSettings } from '@/lib/api/settings'
import { ORG_ID, abs, breadcrumbLd } from '@/lib/seo'

/* Next 16 은 세그먼트 설정을 정적 분석하므로 상수 import 를 쓸 수 없다 (LIST_REVALIDATE 와 같은 값) */
export const revalidate = 300

export const metadata: Metadata = {
  title: '후원안내',
  description:
    '학교복지진흥사회적협동조합 후원 계좌 안내(새마을금고 9005-0002-9343-2), 후원 신청, 기부금 영수증 발급 안내. 기부금 영수증 발급 자격(공익법인등) 보유 기관입니다.',
  alternates: { canonical: '/donate' },
}

const TABS = [
  { key: 'account', label: '후원계좌 안내' },
  { key: 'apply', label: '후원 신청' },
  { key: 'receipt', label: '기부금 영수증' },
]

const CHECK = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3E76A8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
)

const COPY_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
)

export default async function DonatePage() {
  const settings = await getSettings()

  return (
    <div className="page active" id="pg-donate">
      <JsonLd
        data={[
          breadcrumbLd([{ name: '홈', path: '/' }, { name: '후원안내', path: '/donate' }]),
          /* 후원 행위 LD — 수혜자는 레이아웃의 조직 LD(@id)를 참조한다 */
          {
            '@context': 'https://schema.org',
            '@type': 'DonateAction',
            name: '후원하기',
            recipient: { '@id': ORG_ID },
            target: abs('/donate'),
          },
        ]}
      />
      <div className="page-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.pexels.com/photos/6994944/pexels-photo-6994944.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="기부용으로 준비된 통조림과 식료품 물품" loading="lazy" />
        <div className="container ph-inner">
          <h1>후원안내</h1>
        </div>
      </div>
      <Tabbar prefix="donate" base="/donate" tabs={TABS} />

      <section className="sub-section" id="donate-account">
        <div className="container">
          <div className="don-banner">
            <div className="db-ic">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD9A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 14c1.5-1.4 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .8-4.5 2.5C10.5 3.8 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.1 3 5.5l7 7Z" /></svg>
            </div>
            <div>
              <b>사회교육복지 기부장학사업</b>
              <span>교육부 제33호 인가 학교복지진흥사회적협동조합 · 후원금은 청소년 장학과 교육복지 사업에 쓰입니다.</span>
            </div>
          </div>
        </div>
        <div className="container donate-grid">
          <div className="donate-left">
            <span className="trust-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B96F10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 10h8M8 14h5" /></svg>
              기부금 영수증 발급 자격(공익법인등) 보유 · 자격 무중단 유지 운영
            </span>
            <h2>계좌 입금으로<br />간편하게 후원할 수 있습니다</h2>
            <p>비영리 법인으로서 개인 및 단체의 기부금 납부가 가능합니다. 기부금은 정관 제55조에 명시된 사업 목적과 관련 법령의 취지에 맞게 공익 사업에 활용되며, 정관 제59조의2에 따라 매년 모금액과 활용 실적을 공개합니다.</p>
            <ul className="check-list">
              <li>{CHECK}입금 후 후원 신청 폼 제출 → 입금자명 대조 확인</li>
              <li>{CHECK}연말정산 세액공제 · 개인은 소득금액 30% 한도 내 기부금의 15% 세액공제, 법인은 소득금액 10% 한도</li>
              <li>{CHECK}모금·활용 내역은 투명공시 메뉴에서 로그인 없이 열람</li>
            </ul>
          </div>
          <div>
            <div className="acct-card">
              <h3>후원 계좌</h3>
              <dl className="acct-dl">
                <div><dt>은행</dt><dd>{settings.bankName}</dd></div>
                <div><dt>계좌번호</dt><dd>{settings.accountNumber}
                  <button className="copy-btn" data-copy={settings.accountNumber} aria-label="계좌번호 복사">
                    {COPY_ICON}복사
                  </button></dd></div>
                <div><dt>예금주</dt><dd>{settings.accountHolder}</dd></div>
                <div><dt>문의전화</dt><dd>{settings.phone}
                  <button className="copy-btn" data-copy={settings.phone} aria-label="전화번호 복사">
                    {COPY_ICON}복사
                  </button></dd></div>
              </dl>
              <div className="acct-btns">
                <Link className="btn btn-accent" href="/donate#donate-apply">후원 신청하기</Link>
                <Link className="btn btn-outline" href="/donate#donate-receipt">기부금 영수증 안내</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sub-section bg-soft" id="donate-apply">
        <div className="container">
          <div className="sec-head"><h2>후원 신청</h2><p>후원 유형을 선택하고 신청서를 제출해 주시면 담당자가 확인 후 연락드립니다.</p></div>
          <div style={{ maxWidth: 860 }}>
            <DonateForm />

            <div className="grid-2" style={{ marginTop: 34 }}>
              <div className="plain-card">
                <h3>이메일 문의</h3>
                <p style={{ marginBottom: 12 }}>신청서 접수·상담 문의는 이메일로 보내 주세요.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <a href={`mailto:${settings.email}`} style={{ fontWeight: 700, color: 'var(--c-700)' }}>{settings.email}</a>
                  <button className="copy-btn" data-copy={settings.email} aria-label="이메일 주소 복사">
                    {COPY_ICON}복사
                  </button>
                </div>
              </div>
              <div className="plain-card">
                <h3>전화 문의</h3>
                <p style={{ marginBottom: 12 }}>{settings.supportHours}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <a href={`tel:${settings.phone}`} style={{ fontWeight: 700, color: 'var(--c-700)' }}>{settings.phone}</a>
                  <button className="copy-btn" data-copy={settings.phone} aria-label="전화번호 복사">
                    {COPY_ICON}복사
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sub-section" id="donate-receipt">
        <div className="container">
          <div className="sec-head"><h2>기부금 영수증</h2><p>기부금을 납부한 개인·단체는 연말정산 세제 혜택을 위한 <span style={{ whiteSpace: 'nowrap' }}>기부금 영수증을 발급받을 수 있습니다.</span></p></div>
          <div style={{ maxWidth: 1030 }}>
            <table className="info-table">
              <tbody>
                <tr><th>발급 대상</th><td>기부금을 납부한 개인 및 단체 (요청 시 발급)</td></tr>
                <tr><th>세제 혜택</th><td>개인: 소득금액의 30% 한도 내 기부금의 15% 세액공제 / 법인: 소득금액의 10% 한도</td></tr>
                <tr><th>발급 방식</th><td>국세청 홈택스 전자기부금영수증 (별도 요청이 없을 때는 발급하지 않습니다)</td></tr>
                <tr><th>발급 문의</th><td>전화 <a href={`tel:${settings.phone}`} style={{ fontWeight: 700, color: 'var(--c-700)' }}>{settings.phone}</a>
                  {' '}· 이메일 <a href={`mailto:${settings.email}`} style={{ fontWeight: 700, color: 'var(--c-700)' }}>{settings.email}</a></td></tr>
              </tbody>
            </table>
            <h3 style={{ fontSize: 20.5, fontWeight: 900, color: 'var(--c-900)', margin: '30px 0 12px' }}>홈택스 전자기부금영수증 신청 절차</h3>
            <div className="notice-box">
              <ul>
                <li>국세청 홈택스(hometax.go.kr) 접속 → 장려금·연말정산·전자기부금 → 전자기부금영수증</li>
                <li>(기부자용) 발급신청 및 목록관리 → 전자기부금영수증 발급 신청 → 로그인(공동인증서·아이디·간편인증)</li>
                <li>기부금단체 검색에서 <strong>&quot;학교복지진흥사회적협동조합&quot;</strong> 선택 (고유번호는 오픈 시 확정 표기)</li>
                <li>기부일자·기부금액 등록, 구분 &quot;금전&quot; 선택 → 등록 → 신청</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
