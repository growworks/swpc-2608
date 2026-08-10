import type { Metadata } from 'next'
import Link from 'next/link'
import { Tabbar } from '@/components/ui/Tabbar'
import { FaqAccordion } from '@/components/sections/FaqAccordion'
import { KakaoMap } from '@/components/sections/KakaoMap'
import { KAKAO_MAP_KEY } from '@/lib/constants'
import { getFaqs } from '@/lib/api/content'
import { getSettings } from '@/lib/api/settings'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbLd, faqPageLd } from '@/lib/seo'

/* Next 16 은 세그먼트 설정을 정적 분석하므로 상수 import 를 쓸 수 없다 (LIST_REVALIDATE 와 같은 값) */
export const revalidate = 300

export const metadata: Metadata = {
  title: '고객센터',
  description:
    '학교복지진흥사회적협동조합 자주 묻는 질문, 오시는 길(대전광역시 서구 월평동로 83, 122호), 정책·약관 안내. 대표전화 042-931-1479.',
  alternates: { canonical: '/support' },
}

const TABS = [
  { key: 'faq', label: '자주 묻는 질문' },
  { key: 'location', label: '오시는 길' },
  { key: 'policy', label: '정책·약관' },
]

const ARROW = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

const COPY_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
)

export default async function SupportPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()])

  /* 지도 검색·지오코딩은 도로명 주소까지만 넣어야 결과가 잡힌다 - 괄호·호수는 잘라낸다 */
  const roadAddress =
    settings.address.replace(/\s*\(.*$/, '').split(',')[0].trim() || settings.address
  const mapQuery = encodeURIComponent(roadAddress)
  /* 데모는 주소를 괄호 앞에서 줄바꿈한다. settings.address 는 한 줄 문자열이라 괄호에서 나눈다 */
  const parenAt = settings.address.indexOf(' (')
  const addrHead = parenAt > 0 ? settings.address.slice(0, parenAt) : settings.address
  const addrTail = parenAt > 0 ? settings.address.slice(parenAt + 1) : ''
  /* settings.supportHours 는 '평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)' 한 줄이라
     데모의 평일·점심시간 2행으로 나눠 표기한다 */
  const hours = settings.supportHours.match(/^(.*?)\s*\((?:점심\s*)?(.*?)\)\s*$/)
  const weekdayHours = (hours ? hours[1] : settings.supportHours).replace(/^평일\s*/, '')
  const lunchHours = hours ? hours[2] : ''

  return (
    <div className="page active" id="pg-support">
      <JsonLd
        data={[
          breadcrumbLd([{ name: '홈', path: '/' }, { name: '고객센터', path: '/support' }]),
          faqPageLd(faqs),
        ]}
      />
      <div className="page-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=75" alt="정돈된 상담 데스크와 사무 공간" loading="lazy" />
        <div className="container ph-inner">
          <h1>고객센터</h1>
        </div>
      </div>
      <Tabbar prefix="support" base="/support" tabs={TABS} />

      <section className="sub-section" id="support-faq">
        <div className="container">
          <div className="sec-head"><h2>자주 묻는 질문</h2></div>
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      <section className="sub-section bg-soft" id="support-location">
        <div className="container">
          <div className="sec-head"><h2>오시는 길</h2></div>
          <KakaoMap appKey={KAKAO_MAP_KEY} address={roadAddress} title={settings.companyName} />
          {/* 길찾기 링크는 지도가 떠도 항상 접근 가능하도록 지도 아래에 둔다 */}
          <div className="map-links" style={{ marginTop: 14 }}>
            <a className="btn btn-outline btn-sm" href={`https://map.kakao.com/link/search/${mapQuery}`} target="_blank" rel="noopener">카카오맵에서 보기</a>
            <a className="btn btn-outline btn-sm" href={`https://map.naver.com/p/search/${mapQuery}`} target="_blank" rel="noopener">네이버지도에서 보기</a>
          </div>
          <div className="grid-2" style={{ marginTop: 28 }}>
            <div className="plain-card">
              <h3>주소·연락처</h3>
              <dl className="acct-dl">
                <div><dt>주소</dt><dd style={{ textAlign: 'right' }}>{addrHead}{addrTail && (<><br />{addrTail}</>)}</dd></div>
                <div><dt>대표전화</dt><dd>{settings.phone}
                  <button className="copy-btn" data-copy={settings.phone} aria-label="전화번호 복사">
                    {COPY_ICON}복사
                  </button></dd></div>
                <div><dt>이메일</dt><dd>{settings.email}</dd></div>
              </dl>
            </div>
            <div className="plain-card">
              <h3>운영시간·교통</h3>
              <dl className="acct-dl">
                <div><dt>평일</dt><dd>{weekdayHours}</dd></div>
                {lunchHours && <div><dt>점심시간</dt><dd>{lunchHours}</dd></div>}
                <div><dt>주말·공휴일</dt><dd>휴무</dd></div>
                <div><dt>시내버스</dt><dd style={{ textAlign: 'right' }}>602·116번 월평주공아파트 종점<br />514·916번 월평주공아파트 하차 도보 2분</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="sub-section" id="support-policy">
        <div className="container">
          <div className="sec-head"><h2>정책·약관</h2></div>
          <div className="grid-3" style={{ maxWidth: 1200 }}>
            <div className="plain-card">
              <h3>개인정보처리방침</h3>
              {/* 주민등록번호는 수집하지 않는다(방침 본문과 일치) - 기부금 영수증은 홈택스 전자 발급 */}
              <p>최소 수집 원칙을 지킵니다. 회원가입·후원 신청 시 필요한 정보만 수집하며, 주민등록번호는 수집하지 않습니다.</p>
              <Link className="biz-more" href="/privacy">자세히 보기 {ARROW}</Link>
            </div>
            <div className="plain-card">
              <h3>이용약관</h3>
              <p>홈페이지 이용, 회원 서비스, 게시물 운영 원칙을 규정합니다.</p>
              <Link className="biz-more" href="/terms">자세히 보기 {ARROW}</Link>
            </div>
            <div className="plain-card">
              <h3>청소년 보호정책</h3>
              <p>청소년보호책임자를 지정하고 유해 정보로부터 청소년을 보호합니다. 발행 매체와 공통 적용됩니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
