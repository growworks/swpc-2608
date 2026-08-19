import type { Metadata } from 'next'
import { Tabbar } from '@/components/ui/Tabbar'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbLd } from '@/lib/seo'
import { HISTORY } from '@/lib/data/history'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '조합소개',
  description:
    '학교복지진흥사회적협동조합 인사말·미션, 연혁, 조직도·임원, 발행 매체(CWC교원투데이) 안내. 2014년 교육부장관 인가 제33호 사회적협동조합입니다.',
  alternates: { canonical: '/about' },
}

const TABS = [
  { key: 'greeting', label: '인사말·미션' },
  { key: 'history', label: '연혁' },
  { key: 'org', label: '조직도·임원' },
  { key: 'media', label: '발행 매체' },
]

export default function AboutPage() {
  return (
    <div className="page active" id="pg-about">
      <JsonLd data={breadcrumbLd([{ name: '홈', path: '/' }, { name: '조합소개', path: '/about' }])} />
      <div className="page-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=75" alt="높은 서가가 늘어선 도서관 내부" loading="lazy" />
        <div className="container ph-inner">
          <h1>조합소개</h1>
        </div>
      </div>
      <Tabbar prefix="about" base="/about" tabs={TABS} />

      <section className="sub-section" id="about-greeting">
        <div className="container">
          <div className="greet-grid">
            <div className="greet-body">
              {/* 데모 개정본에서 제목이 그리드 바깥 → 본문 컬럼 안쪽으로 이동했다 */}
              <div className="sec-head"><h2>인사말</h2></div>
              <p><strong>안녕하십니까?</strong><br />교육과 학교복지를 위한 사회적협동조합 홈페이지 방문을 진심으로 환영합니다.</p>
              <p>우리 조합기관은 2015년 「사회적협동조합법」에 의거 교육부 장관 제33호 인가를 받아 교육과 학교복지에 이바지하는 사회적협동조합 기관입니다.</p>
              <p>교육은 국가의 백년대계이자 대한민국의 미래 운명을 좌우할 만큼 중요합니다. 또한 교육은 교육 부문에 국한되지 않고 다양한 사회 모든 부분과 연계되어야 하고, 함께 협업해야 미래 교육이 바로 설 수 있다고 봅니다.</p>
              <p>국민 한 사람 한 사람이 나 혼자 잘살겠다는 욕심을 과감하게 내려놓고, 남을 배려하고 이해하는 따뜻한 마음으로 포용할 수 있는 크고 넓은 기량을 키워나가야 할 때입니다. 국민 각자가 올바른 역사관과 가치관을 정립하고 바로 알 때 나라의 기강이 바로 서는 것입니다.</p>
              <p>따뜻한 이웃으로 협력하는 공동체 정신, 곧 홍익인간 사상을 바탕으로 전 세계 인류가 공생·공존하는 사회에 제 역할을 다할 수 있도록, 학교복지진흥사회적협동조합의 새로운 도약과 성장을 위해 최선을 다하여 이바지하겠습니다.</p>
              <p>더 많은 관심과 성원 부탁드립니다. 감사합니다.</p>
              <p className="sign">학교복지진흥사회적협동조합<br />이사장 외 임직원 일동</p>
              <div className="quote-box" style={{ marginTop: 28 }}>
                &quot;함께 성장하는 교육을 통해 사회적 가치를 실현하고,<br />공동체의 상생과 복지 증진에 이바지합니다.&quot;
              </div>
              <div className="vision3">
                <div><b>위기극복</b><span>소통·협력 기반의 경영위기 극복</span></div>
                <div><b>경영혁신</b><span>변화를 선도하는 조직운영과 기술혁신</span></div>
                <div><b>미래성장</b><span>지속가능 성장사업과 핵심역량 강화</span></div>
              </div>
            </div>
            <div className="greet-side">
              {/* 가로 사진 2장 위에 원형으로 오려낸 사진 1장을 겹치는 콜라주 (데모 개정본) */}
              <figure className="greet-photo greet-collage">
                <div className="gc-stack">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/archive/images/greet-career.jpg" alt="청소년 진로체험 기자단 활동에 참여한 학생들과 조합 임원 단체사진" loading="lazy" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/archive/images/greet-dinner.jpg" alt="유소년축구단 선수와 학부모가 함께한 단체 식사 현장" loading="lazy" />
                  <span className="gc-oval">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/archive/images/greet-orchestra.jpg" alt="서울역 광장 청소년 3.1절 기념행사 청소년 오케스트라 공연" loading="lazy" />
                  </span>
                </div>
                <figcaption className="gc-cap">공익적 · 사회적 가치를 위해 긍정 에너지를 전파하는<b>학교복지진흥사회적협동조합</b></figcaption>
              </figure>
              <figure className="greet-photo" style={{ marginTop: 22 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/archive/images/chairman.jpg" style={{ aspectRatio: '1000/1125', objectFit: 'cover', objectPosition: '50% 40%', width: '100%', display: 'block' }} alt="학교복지진흥사회적협동조합 김재호 이사장" loading="lazy" />
                <figcaption style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-900)', padding: 12, textAlign: 'center', background: '#fff' }}>김재호 이사장</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="sub-section bg-soft" id="about-history">
        <div className="container">
          <div className="sec-head"><h2>연혁</h2><p>조합이 걸어온 발자취입니다.</p></div>
          <div className="hist-grid">
            <div className="timeline">
              {HISTORY.map((h) => (
                <div className="tl-item" key={h.year}>
                  <div className="tl-year">{h.year}</div>
                  <div className="tl-rows">
                    {h.rows.map(([tag, txt], i) => (
                      <div className="tl-row" key={`${tag}-${i}`}>
                        <span className="tl-tag">{tag}</span>
                        <span className="tl-txt">{txt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* 데모 개정본에서 연혁이 1컬럼이 되며 퍼즐 블록이 아래로 내려가고 구분선이 생겼다 */}
            <div className="pzl-wrap" style={{ borderTop: '1px solid var(--line)', paddingTop: 52 }}>
              <div className="pzl-side">
                <div><h3>경영자 리더십</h3><p>기업사회공헌에 대한 관심과 실천의지, 솔선수범, 명확한 의사결정</p></div>
                <div><h3>파트너십</h3><p>전문성과 실행력을 갖춘 파트너, 적절한 조직규모, 함께 성장할 수 있는 파트너</p></div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pzl-logo" src="/archive/images/puzzle-logo.png" alt="네 가지 가치를 상징하는 퍼즐 모양 그림" loading="lazy" />
              <div className="pzl-side">
                <div><h3>비즈니스 연관성</h3><p>기업의 업과 연관된 사회공헌, 기업의 기술·전문인력 활용가능한, 기업활동에 유익을 줄 수 있는 사회공헌</p></div>
                <div><h3>임직원의 참여</h3><p>사회공헌활동을 권장하는 기업문화, 본인의 전문적인 기술과 노하우를 활용할 수 있는 사회공헌, 참여한 직원들의 보람과 자긍심</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sub-section" id="about-org">
        <div className="container">
          <div className="sec-head"><h2>조직도·임원</h2><p>2026년 정기총회 회의록 기준 조합원 15명(이사 7명)으로 구성되어 있습니다.</p></div>
          <div className="orgtree-scroll">
            <ul className="orgtree">
              <li>
                <div className="org-node solid">총회 (조합원 15명)</div>
                <ul>
                  <li>
                    <div className="org-node">이사회 (이사 7명)</div>
                    <ul>
                      <li>
                        <div className="org-cluster">
                          <div className="org-node sm">자문위원회</div><span className="clink"></span>
                          <div className="org-node solid pillnode">이사장</div><span className="clink"></span>
                          <div className="org-node sm">감&nbsp;사</div>
                        </div>
                        <ul>
                          <li><div className="org-node dir">기획이사</div></li>
                          <li>
                            <div className="org-node dir">사업이사</div>
                            <ul>
                              <li><div className="org-node sm2">학교환경사업</div></li>
                              <li><div className="org-node sm2">건강클리닉·센터</div></li>
                              <li><div className="org-node sm2">보건교육사업</div></li>
                              <li><div className="org-node sm2">유소년축구클럽</div></li>
                              <li><div className="org-node sm2">영유아교육사업</div></li>
                            </ul>
                          </li>
                          <li><div className="org-node dir">관리이사</div></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <div className="grid-2" style={{ maxWidth: 1150, margin: '36px auto 0' }}>
            <figure className="detail-img match-h" style={{ margin: 0, background: 'none' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/archive/images/committee-1.jpg" alt="조합 운영위원회 위원들의 단체 사진" loading="lazy" />
            </figure>
            <figure className="detail-img" style={{ margin: 0, background: 'none' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/archive/images/committee-2.jpg" alt="행사장에서 촬영한 운영위원회 단체 사진" style={{ width: '100%', display: 'block' }} loading="lazy" />
            </figure>
          </div>
          <div style={{ maxWidth: 860, margin: '36px auto 0' }}>
            <table className="info-table">
              <tbody>
                <tr><th>이사장</th><td>김재호 <span style={{ fontSize: 15 }}>(설립인가증·사업자등록증 원본 기준)</span></td></tr>
                <tr><th>이사진</th><td>기획이사 · 사업이사 · 관리이사 (조직도 기준, 이사 7명 · 명단 오픈 시 게시)</td></tr>
                <tr><th>감사·자문</th><td>감사 · 자문위원회 (조직도 기준)</td></tr>
                <tr><th>조합원</th><td>15명 (2026년 정기총회 회의록 기준)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sub-section bg-soft" id="about-media">
        <div className="container">
          <div className="sec-head"><h2>발행 매체 · CWC교원투데이</h2><p>조합이 발행하는 인터넷신문입니다. 보도 콘텐츠는 교원투데이에 존치하며 <span style={{ whiteSpace: 'nowrap' }}>본 사이트와 상호 링크합니다.</span></p></div>
          <div className="grid-2" style={{ maxWidth: 1080 }}>
            <div className="plain-card">
              <h3><span className="card-ic"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#1F4C77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9" /><path d="M12 6h6M12 10h6M12 14h6M12 18h6" /></svg></span>매체 정보</h3>
              <ul>
                <li>등록번호: 대전 아 00480</li>
                <li>발행·등록일: 2023년 12월 19일</li>
                <li>발행인: 학교복지진흥사회적협동조합</li>
                <li>편집인: 김재호 · 청소년보호책임자: 남위영</li>
              </ul>
            </div>
            <div className="plain-card">
              <h3><span className="card-ic"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#1F4C77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg></span>바로가기</h3>
              <p style={{ marginBottom: 14 }}>교육·학교복지 분야 보도와 청소년 장학기자단 소식은 교원투데이에서 볼 수 있습니다.</p>
              <a className="btn btn-outline btn-sm" href="http://www.cwc.or.kr" target="_blank" rel="noopener">CWC교원투데이 바로가기
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
