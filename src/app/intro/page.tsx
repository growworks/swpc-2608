import type { Metadata } from 'next'
import Link from 'next/link'
import { getNotices } from '@/lib/api/content'
import { formatPostDate } from '@/lib/api/posts'
import { getSettings } from '@/lib/api/settings'
import { JsonLd } from '@/components/seo/JsonLd'
import { KakaoMap } from '@/components/sections/KakaoMap'
import { KAKAO_MAP_KEY } from '@/lib/constants'
import { organizationLd, websiteLd } from '@/lib/seo'
import { NEWS_SITE_URL, ORG_NAME } from '@/lib/site'
import { IntroEffects } from './IntroEffects'
import { FamilySelect } from './FamilySelect'
import './intro.css'

/* 세그먼트 설정은 SWC 가 AST 로 정적 추출하므로 반드시 리터럴이어야 한다
   (식별자를 쓰면 next build 가 unsupported 로 판정해 실패). LIST_REVALIDATE 와 같은 값 */
export const revalidate = 300

export const metadata: Metadata = {
  title: { absolute: ORG_NAME },
  description: '조합 공식 홈페이지와 CWC교원투데이로 연결됩니다',
  alternates: { canonical: '/intro' },
  openGraph: {
    title: ORG_NAME,
    description: '조합 공식 홈페이지와 CWC교원투데이로 연결됩니다',
  },
}

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
)

const ARROW_EXT = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
)

/**
 * 대문 공지 4건.
 * 조회 실패로 대문 전체가 죽으면 안 되므로 실패도 빈 목록으로 취급하고
 * 아래 빈 상태 UI 로 흡수한다(getSettings 폴백과 같은 방침).
 */
async function introNotices() {
  try {
    return await getNotices(4)
  } catch {
    return []
  }
}

export default async function IntroPage() {
  const [notices, settings] = await Promise.all([introNotices(), getSettings()])

  /* 지도 검색·지오코딩은 도로명 주소까지만 넣어야 결과가 잡힌다 - 괄호·호수는 잘라낸다 */
  const roadAddress =
    settings.address.replace(/\s*\(.*$/, '').split(',')[0].trim() || settings.address
  const mapQuery = encodeURIComponent(roadAddress)

  return (
    <div className="route-intro">
      {/* 대문은 학교 레이아웃 밖이라 조직·웹사이트 LD 를 직접 렌더한다 */}
      <JsonLd data={[organizationLd(settings), websiteLd()]} />
      {/* JS 미실행 환경에서도 콘텐츠가 보이도록 보장 */}
      <noscript>
        <style>{`.route-intro .reveal { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>

      {/* 접근성 스킵링크 (화면 비노출) */}
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>

      <main id="main-content">
        {/* ===== S1. 풀스크린 스플릿 히어로 ===== */}
        <section className="hero" aria-label="방문하실 홈페이지를 선택해 주세요">
          {/* 배경 워터마크 */}
          <div className="hero-watermark" aria-hidden="true"><span>EDUCATION</span></div>

          {/* 클릭 이동 안내 문구 */}
          <p className="hero-guide">클릭 시 해당 홈페이지로 이동합니다.</p>

          {/* 좌측: 조합 영역 */}
          <Link href="/" className="hero-panel hero-panel-left" aria-label="조합 홈페이지 입장">
            <div className="hero-bg"></div>
            <div className="hero-overlay"></div>
            <div className="hero-dim"></div>
            <div className="hero-content">
              <div className="hero-accent-line" aria-hidden="true"></div>
              <h1 className="hero-title">학교복지진흥사회적협동조합</h1>
              <p className="hero-desc">한 아이도 놓치지 않는 학교복지를 만드는 공식 홈페이지</p>
              <div className="hero-keywords" aria-hidden="true">
                <span className="hero-keyword">기관소개</span>
                <span className="hero-keyword">사업안내</span>
                <span className="hero-keyword">투명공시</span>
                <span className="hero-keyword">후원</span>
                <span className="hero-keyword">교육프로그램</span>
              </div>
              <div className="hero-cta">
                <div className="hero-cta-btn" aria-hidden="true">{ARROW_RIGHT}</div>
                <span className="hero-cta-label">Explore Channel</span>
              </div>
            </div>
          </Link>

          {/* 우측: 교원투데이 영역 */}
          <a
            href={`${NEWS_SITE_URL}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-panel hero-panel-right"
            aria-label="교원투데이 뉴스 보기 (새 탭)"
          >
            <div className="hero-bg"></div>
            <div className="hero-overlay"></div>
            <div className="hero-dim"></div>
            <div className="hero-content">
              <div className="hero-accent-line" aria-hidden="true"></div>
              <h2 className="hero-title" style={{ fontFamily: "'Noto Serif KR',serif" }}>CWC 교원투데이</h2>
              <p className="hero-desc">교육 전문 인터넷 신문 및 미디어 채널</p>
              <div className="hero-keywords" aria-hidden="true">
                <span className="hero-keyword">통합뉴스</span>
                <span className="hero-keyword">교육</span>
                <span className="hero-keyword">문화</span>
                <span className="hero-keyword">의료</span>
                <span className="hero-keyword">칼럼</span>
              </div>
              <div className="hero-cta">
                <div className="hero-cta-btn" aria-hidden="true">{ARROW_RIGHT}</div>
                <span className="hero-cta-label">Explore Channel</span>
              </div>
            </div>
          </a>

          {/* 스크롤 인디케이터 */}
          <div className="scroll-indicator" aria-hidden="true">
            <div className="scroll-mouse"></div>
            <span>Scroll</span>
          </div>
        </section>

        {/* 모바일 하단 고정 분기 버튼 */}
        <div className="mobile-channel-btns" aria-label="채널 선택">
          <Link href="/" className="mobile-channel-btn left" aria-label="조합 홈페이지">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="9" width="18" height="13" /><polyline points="3 9 12 3 21 9" /></svg>
            조합 홈페이지
          </Link>
          <a href={`${NEWS_SITE_URL}/`} target="_blank" rel="noopener noreferrer" className="mobile-channel-btn right" aria-label="교원투데이 (새 탭)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            교원투데이 ↗
          </a>
        </div>

        {/* ===== S2. 기관 소개 요약 ===== */}
        <section id="about" className="section intro" aria-label="기관 소개">
          <div className="container intro-inner">
            <div className="flex-1 reveal">
              <p className="intro-body">
                <span className="brand-coop">학교복지진흥사회적협동조합</span>은 교육의 질적 향상과 교직원의 복지 증진을 위해 설립된 <span className="nb">교육부 인가 제33호</span> 사회적협동조합입니다.
              </p>
            </div>
            <div className="flex-1 reveal reveal-delay-2">
              <p className="intro-body">
                투명하고 신뢰받는 조합 운영을 위한 <span className="nb">공식 홈페이지</span>와, <span className="nb">교육 현장의</span> 생생한 소식을 전하는 <span className="nb">미디어 채널</span> <span className="brand-news">CWC 교원투데이</span>를 통해 여러분과 소통합니다.
              </p>
            </div>
          </div>
        </section>

        {/* ===== S3. 목적별 퀵링크 ===== */}
        <section id="quicklinks" className="section quicklinks" aria-labelledby="quicklinks-heading">
          <div className="container">
            <div className="quicklinks-header reveal">
              <div>
                <h2 id="quicklinks-heading">Quick Access</h2>
                <p>자주 찾는 서비스를 빠르고 편리하게 이용하세요.</p>
              </div>
            </div>

            <div className="qa-groups">
              {/* 조합 퀵액세스 */}
              <div className="qa-group coop reveal">
                <div className="qa-group-head">
                  <div className="qa-group-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /><line x1="22" y1="10" x2="22" y2="15" /></svg>
                  </div>
                  <div>
                    <h3>학교복지진흥사회적협동조합</h3>
                    <p>조합 홈페이지로 이동합니다</p>
                  </div>
                </div>
                <ul className="qa-list">
                  <li><Link className="qa-item" href="/about"><span>조합소개</span>{ARROW_RIGHT}</Link></li>
                  <li><Link className="qa-item" href="/business"><span>사업안내</span>{ARROW_RIGHT}</Link></li>
                  <li><Link className="qa-item" href="/report"><span>투명공시</span><span className="qa-tag gold">법정 공시</span>{ARROW_RIGHT}</Link></li>
                  <li><Link className="qa-item" href="/donate"><span>후원안내</span>{ARROW_RIGHT}</Link></li>
                  <li><Link className="qa-item" href="/programs/univ"><span>교육프로그램</span>{ARROW_RIGHT}</Link></li>
                </ul>
              </div>

              {/* 교원투데이 퀵액세스 (새 탭 이동) */}
              <div className="qa-group newsg reveal reveal-delay-1">
                <div className="qa-group-head">
                  <div className="qa-group-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h13a2 2 0 0 1 2 2v12M4 5v14a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9" /><path d="M8 9h5M8 13h9M8 17h9" /></svg>
                  </div>
                  <div>
                    <h3>CWC 교원투데이</h3>
                    <p>새 탭으로 이동합니다</p>
                  </div>
                </div>
                <ul className="qa-list">
                  {['통합뉴스', '교육', '문화', '의료', '칼럼'].map((label) => (
                    <li key={label}>
                      <a className="qa-item" href={`${NEWS_SITE_URL}/`} target="_blank" rel="noopener noreferrer">
                        <span>{label}</span>{ARROW_EXT}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S4. 새소식 ===== */}
        <section id="news" className="section news" aria-labelledby="news-heading">
          <div className="container">
            <div className="news-inner">
              <div className="news-header reveal">
                <h2 id="news-heading">최근 공지사항</h2>
                <p>조합의 새로운 소식과 주요 공지사항을 빠르게 확인하세요.</p>
                <Link href="/news" className="news-more">
                  모든 소식 보기
                  {ARROW_RIGHT}
                </Link>
              </div>

              <div className="news-list" role="list">
                {notices.map((post, i) => (
                  <Link
                    href={`/news/${post.id}`}
                    className={`news-item reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}
                    role="listitem"
                    key={post.id}
                  >
                    <div className="news-item-left">
                      <div className="news-date">{formatPostDate(post.createdAt)}</div>
                      <div className="news-meta">
                        <div className="news-tag-row">
                          <span className="news-category">공지사항</span>
                          {/* 데모의 important 배지 = 서버의 상단고정(isPinned) */}
                          {post.isPinned && <span className="news-new">NEW</span>}
                        </div>
                        <div className="news-title">{post.title}</div>
                      </div>
                    </div>
                    <div className="news-arrow" aria-hidden="true">{ARROW_EXT}</div>
                  </Link>
                ))}
                {notices.length === 0 && (
                  /* reveal 미부여 — 빈 상태는 JS 없이도 보여야 한다 */
                  <div className="empty-note">등록된 공지사항이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== S5. 사업 하이라이트 ===== */}
        <section id="business" className="section business" aria-labelledby="business-heading">
          <div className="container">
            <div className="business-header reveal">
              <h2 id="business-heading">주요 사업</h2>
              <p>학교복지진흥사회적협동조합과 CWC 교원투데이는 교육 현장의 실질적인 필요를 채우고, 더 나은 교육 환경을 만들기 위해 다양한 사업을 전개합니다.</p>
            </div>

            <div className="business-grid">
              <div className="business-card reveal">
                <div className="business-num-bg" aria-hidden="true">01</div>
                <div>
                  <div className="business-label">01 — 조합 사업</div>
                  <div className="business-title">교육 복지 지원</div>
                  <div className="business-desc">교직원과 학생을 위한 실질적인 복지 서비스 기획 및 제공. 학교 현장의 필요에 맞춘 맞춤형 복지 프로그램을 운영합니다.</div>
                </div>
              </div>

              <div className="business-card reveal reveal-delay-2">
                <div className="business-num-bg" aria-hidden="true">02</div>
                <div>
                  <div className="business-label">02 — 조합 사업</div>
                  <div className="business-title">교육 콘텐츠 개발</div>
                  <div className="business-desc">미래 교육 환경에 맞는 혁신적인 교육 프로그램 및 교재 개발. 소셜교육 프로그램부터 역량 강화 연수까지 다양하게 제공합니다.</div>
                </div>
              </div>

              <div className="business-card reveal reveal-delay-3">
                <div className="business-num-bg" aria-hidden="true">03</div>
                <div>
                  <div className="business-label">03 — 조합 사업</div>
                  <div className="business-title">네트워크 구축</div>
                  <div className="business-desc">교육 기관 간의 협력 및 정보 교류를 위한 플랫폼 운영. 기부금 모금·배분(공익법인) 및 협력 기관 네트워크를 관리합니다.</div>
                </div>
              </div>

              <div className="business-card reveal">
                <div className="business-num-bg" aria-hidden="true">04</div>
                <div>
                  <div className="business-label">04 — CWC 교원투데이</div>
                  <div className="business-title">교육 전문 보도</div>
                  <div className="business-desc">통합뉴스·교육·문화·의료 분야의 소식을 신속하고 정확하게 전하는 교육 전문 인터넷신문을 발행합니다.</div>
                </div>
              </div>

              <div className="business-card reveal reveal-delay-2">
                <div className="business-num-bg" aria-hidden="true">05</div>
                <div>
                  <div className="business-label">05 — CWC 교원투데이</div>
                  <div className="business-title">칼럼·오피니언</div>
                  <div className="business-desc">교육 현장 전문가들의 시각과 통찰을 담은 칼럼·오피니언을 연재하며 교육 담론의 장을 만듭니다.</div>
                </div>
              </div>

              <div className="business-card reveal reveal-delay-3">
                <div className="business-num-bg" aria-hidden="true">06</div>
                <div>
                  <div className="business-label">06 — CWC 교원투데이</div>
                  <div className="business-title">기자단·제보 운영</div>
                  <div className="business-desc">교육 현장과 함께하는 기자단을 운영하고, 독자 제보와 광고 문의를 접수해 현장의 목소리를 전합니다.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== S7. 오시는 길 ===== */}
        <section className="section contact" aria-labelledby="contact-heading">
          <div className="container">
            <div className="contact-inner">
              <div className="contact-info reveal">
                <h2 id="contact-heading">Contact Us</h2>
                <div className="contact-items">
                  <div className="contact-item">
                    <div className="contact-item-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    </div>
                    <div>
                      <div className="contact-item-title">오시는 길</div>
                      <div className="contact-item-text">대전광역시 서구 월평동로 83, 122호<br />(월평동, 다모아프라자)</div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-item-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </div>
                    <div>
                      <div className="contact-item-title">전화번호</div>
                      <div className="contact-item-text">042-931-1479</div>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-item-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    </div>
                    <div>
                      <div className="contact-item-title">이메일</div>
                      <div className="contact-item-text">post114@hanmail.net</div>
                    </div>
                  </div>
                </div>
                {/* 지도로 보기 = 카카오맵 새 창 */}
                <a
                  href={`https://map.kakao.com/link/search/${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-btn"
                >
                  지도로 보기
                  {ARROW_RIGHT}
                </a>
              </div>

              <div className="contact-map reveal reveal-delay-2">
                {/* 실지도에도 데모 .map-placeholder 스타일(라운드·흑백→호버 컬러)이 그대로 적용된다.
                    SDK 실패 시에는 데모의 장식용 핀 마크업이 폴백으로 남는다 */}
                <KakaoMap
                  appKey={KAKAO_MAP_KEY}
                  address={roadAddress}
                  title={settings.companyName}
                  className="map-placeholder"
                  ariaLabel="지도 위치 표시"
                  fallback={
                    <>
                      <div className="map-placeholder-bg"></div>
                      <div className="map-pin-wrap">
                        <div className="map-pin">
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                        <div className="map-label">{settings.companyName}</div>
                      </div>
                    </>
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== S8 + S9. 패밀리 사이트 & 푸터 ===== */}
      <footer role="contentinfo">
        <div className="footer-inner">
          {/* 패밀리 사이트 & 로고 */}
          <div className="footer-top">
            <Link href="/intro" className="footer-logo" aria-label="학교복지진흥사회적협동조합 · CWC교원투데이 홈">
              <div className="footer-logo-icon">
                {/* 조합 홈페이지와 동일한 로고 마크 */}
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <circle cx="20" cy="20" r="19" fill="#16395C" />
                  <path d="M20 9 L31 15 L20 21 L9 15 Z" fill="#fff" />
                  <path d="M13 19.5 V25 C13 27.5 16 29.5 20 29.5 C24 29.5 27 27.5 27 25 V19.5" fill="none" stroke="#9CC4E8" strokeWidth="2.4" strokeLinecap="round" />
                  <line x1="31" y1="15" x2="31" y2="23" stroke="#DD8A1E" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="footer-logo-text">학교복지진흥사회적협동조합·CWC교원투데이</span>
            </Link>

            <div className="footer-family">
              <span className="footer-family-label">Family Sites</span>
              <FamilySelect />
            </div>
          </div>

          {/* 법인 정보 & 저작권 */}
          <div className="footer-bottom">
            <div>
              <div className="footer-links">
                <Link href="/terms">이용약관</Link>
                <Link href="/privacy" className="highlight">개인정보처리방침</Link>
                <Link href="/privacy#email-no-collect">이메일무단수집거부</Link>
                {/* 조합원 관련 사항은 약관이 아닌 정관을 따른다 - 경영공시의 정관·인가증으로 연결 */}
                <Link href="/report#report-docs">조합원약관</Link>
                <a href="https://www.hometax.go.kr/" target="_blank" rel="noopener noreferrer">공익법인 공시 포털 ↗</a>
              </div>
              <div className="footer-info">
                {/* 인가번호는 settings 에 대응 필드가 없어 데모 표기를 유지한다 */}
                법인명: {settings.companyName} | 교육부 인가 제33호 (2014.12.19)<br />
                대표자: {settings.ceoName} | 사업자등록번호: {settings.businessNumber}<br />
                주소: {settings.address}<br />
                전화: {settings.phone} | 이메일: {settings.email}
              </div>
            </div>
            <div className="footer-copy">
              © 2026 학교복지진흥사회적협동조합. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <IntroEffects />
    </div>
  )
}
