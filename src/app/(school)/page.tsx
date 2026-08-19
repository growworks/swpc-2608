import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroSlides } from '@/components/sections/HeroSlider'
import { NewsCard } from '@/components/sections/NewsCard'
import { getActivities } from '@/lib/api/content'
import { getSettings } from '@/lib/api/settings'

/* 세그먼트 설정은 SWC 가 AST 로 정적 추출하므로 반드시 리터럴이어야 한다
   (식별자를 쓰면 next build 가 unsupported 로 판정해 실패). LIST_REVALIDATE 와 같은 값 */
export const revalidate = 300

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const ARROW = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

const CHECK = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3E76A8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
)

const COPY_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
)

const RP_ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)

/**
 * 홈 활동소식 카드 4건 — .news-grid 가 2열이라 4건이어야 2×2 로 맞아떨어진다.
 * 조회 실패로 첫 화면 전체가 죽으면 안 되므로 실패도 빈 목록으로 취급해
 * 섹션의 빈 상태 UI 로 흡수한다(getSettings 폴백과 같은 방침).
 */
async function homeActivities() {
  try {
    return await getActivities(4)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [activities, settings] = await Promise.all([homeActivities(), getSettings()])

  return (
    <div className="page active" id="pg-home">
      <HeroSlides>
        <div className="container hero-inner">
          <span className="hero-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFD9A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 3 7v5c0 5 3.5 8.5 9 10 5.5-1.5 9-5 9-10V7Z" /><path d="m9 12 2 2 4-4" /></svg>
            교육부 장관 인가 제33호 · 사회적협동조합
          </span>
          <h1>학교와 지역이 함께,<br /><em>한 아이도 놓치지 않는</em> 학교복지</h1>
          <p className="hero-sub">경제적·정서적 어려움을 겪는 학생을 지원하고,<br className="br-pc" />학교·지역사회·기관을 잇는 교육복지 협력망을 만드는 <span style={{ whiteSpace: 'nowrap' }}>비영리 사회적협동조합입니다.</span></p>
          <div className="hero-ctas">
            <Link className="btn btn-accent" href="/donate">후원하기
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
            <Link className="btn btn-ghost" href="/business">사업 살펴보기</Link>
          </div>
        </div>
      </HeroSlides>

      <section className="block" id="biz-home">
        <div className="container">
          <div className="sec-head reveal">
            <h2>조합이 하는 일</h2>
            <p>학교 안팎의 복지 사각지대를 줄이는 네 갈래의 활동을 이어가고 있습니다.</p>
          </div>
          <div className="biz-grid">
            <Link className="biz-card reveal" href="/business">
              <div className="biz-thumb">{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=75" alt="펼쳐진 책과 학습 자료" loading="lazy" /></div>
              <div className="biz-body">
                <h3>학교복지 지원</h3>
                <p>학교 환경개선·보건교육·아동복지 등 6대 사업으로 학교 안 안전망을 만듭니다.</p>
                <span className="biz-more">자세히 보기 {ARROW}</span>
              </div>
            </Link>
            <Link className="biz-card reveal" href="/programs/univ">
              <div className="biz-thumb">{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=800&q=75" alt="강의실에서 강의가 진행되는 모습" loading="lazy" /></div>
              <div className="biz-body">
                <h3>5개 교육프로그램</h3>
                <p>유소년축구 YNAFC, 마음건강진단센터, 바이오치유과학대학, 발진단클리닉, 창업특강을 운영합니다.</p>
                <span className="biz-more">자세히 보기 {ARROW}</span>
              </div>
            </Link>
            <Link className="biz-card reveal" href="/business">
              <div className="biz-thumb">{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=75" alt="정돈된 회의 공간" loading="lazy" /></div>
              <div className="biz-body">
                <h3>공공 위탁운영</h3>
                <p>정부·지방자치단체의 학교복합시설, 체육·청소년 시설 등을 위탁 운영합니다.</p>
                <span className="biz-more">자세히 보기 {ARROW}</span>
              </div>
            </Link>
            <Link className="biz-card reveal" href="/report">
              <div className="biz-thumb">{/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=75" alt="결산 서류와 계산기가 놓인 책상" loading="lazy" /></div>
              <div className="biz-body">
                <h3>투명한 살림 공개</h3>
                <p>경영공시·기부금공시를 로그인 없이 누구나 열람하도록 연도별로 공개합니다.</p>
                <span className="biz-more">자세히 보기 {ARROW}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="block news-home">
        <div className="container">
          <div className="sec-head reveal">
            <h2>현장의 소식</h2>
            <p>교실과 운동장, 숲과 방송 스튜디오에서 전해 온 조합 활동 기록입니다.</p>
          </div>
        </div>
        <div className="container">
          {activities.length > 0 ? (
            <div className="news-grid reveal" id="homeNewsGrid">
              {activities.map((post) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            /* reveal 미부여 — 빈 상태는 JS 없이도 보여야 한다 */
            <div className="empty-note">등록된 활동소식이 없습니다.</div>
          )}
          {activities.length > 0 && (
            <div className="reveal" style={{ textAlign: 'center', marginTop: 34 }}>
              <Link className="btn btn-outline" href="/news#news-list">활동 소식 전체 보기</Link>
            </div>
          )}
        </div>
      </section>

      <section className="block">
        <div className="container donate-grid">
          <div className="donate-left reveal">
            <span className="trust-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B96F10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 10h8M8 14h5" /></svg>
              기부금 영수증 발급 자격(공익법인등) 보유
            </span>
            <h2>후원금은 계좌로,<br />쓰임은 공시로 투명하게</h2>
            <p>PG 결제 없이 계좌 입금과 후원 신청 폼(입금자명 대조)으로 운영하며, 모금과 활용 내역은 연도별 공시로 공개합니다.</p>
            <ul className="check-list">
              <li>{CHECK}계좌번호 원터치 복사로 간편한 입금</li>
              <li>{CHECK}홈택스 전자기부금영수증 발급 안내</li>
              <li>{CHECK}모금·활용 내역 연도별 공개 게시</li>
              <li>{CHECK}주민등록번호는 영수증 신청 단계에서만 수집</li>
            </ul>
          </div>
          <div className="reveal">
            <div className="acct-card">
              <h3>후원 계좌 안내</h3>
              <dl className="acct-dl">
                <div><dt>은행</dt><dd>{settings.bankName}</dd></div>
                <div><dt>계좌번호</dt><dd>{settings.accountNumber}
                  {/* data-copy 는 복사 버튼이 읽는 실제 값 — 표시 문자열과 반드시 동일해야 한다 */}
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

      <section className="block report-home-tone">
        <div className="container report-grid">
          <div className="report-left reveal">
            <h2>숫자가 아니라<br />기록으로 증명합니다</h2>
            <p>모든 공시자료는 비밀번호와 로그인 없이 누구나 열람할 수 있으며, 연도별 기록을 삭제 없이 보존합니다.</p>
          </div>
          <div className="report-items reveal">
            <div className="report-item">
              <span className="rp-badge">경영공시</span>
              <h3>정기총회·결산 자료 공개 열람</h3>
              <p>총회 자료·사업계획·결산 서류를 연도별로 공개 게시합니다.</p>
              <Link className="rp-link" href="/report">경영공시 보기 {RP_ARROW}</Link>
            </div>
            <div className="report-item">
              <span className="rp-badge">기부금공시</span>
              <h3>기부금 모금·활용 실적</h3>
              <p>2023~2025년도 기부금 내역서를 공개합니다. 정관 제59조의2에 따라 매년 3월 31일까지 게시합니다.</p>
              <Link className="rp-link" href="/report#report-donation">기부금공시 보기 {RP_ARROW}</Link>
            </div>
            <div className="report-item">
              <span className="rp-badge">외부 공시</span>
              <h3>협동조합 포털 공시 확인</h3>
              <p>기획재정부 협동조합 포털(coop.go.kr)에서도 조합 공시를 확인할 수 있습니다.</p>
              <a className="rp-link" href="https://www.coop.go.kr" target="_blank" rel="noopener">협동조합 포털 바로가기
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
