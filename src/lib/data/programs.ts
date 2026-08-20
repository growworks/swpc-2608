/**
 * 교육프로그램 목데이터 — 데모 SPA의 PROGRAMS 배열 100% 이관.
 * 기존 사이트(cwc.or.kr, 74/75~89) 게시 원문 요약. local: 조합 제공 사진.
 * 데모 대비 변경: 아카이브 경로 → /archive ASCII 경로, 해시 링크 → 실제 라우트.
 */
/** 특징 항목 제목 옆에 붙는 실시간 상태 배지 (데모의 .live-badge) */
export interface FeatBadge {
  href: string
  label: string
  title: string
  ariaLabel: string
}

/** [제목, 설명] 또는 [제목, 설명, 배지] */
export type Feat = [string, string] | [string, string, FeatBadge]

export interface Program {
  id: string
  name: string
  tag: string
  local: string
  hero: string
  heroAlt: string
  alt: string
  photoCap: string
  d: string
  intro: string
  feats: Feat[]
  extra?: string
  gallery?: [string, string][]
}

export const PROGRAMS: Program[] = [
  {
    id: 'univ',
    name: '비영리 대학 (Social University)',
    tag: '교육기관 소개',
    local: '/archive/images/program-univ-group.jpg',
    hero: 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=1920',
    heroAlt: '책과 태블릿이 놓인 강의실 책상',
    alt: '초일류 全人 경영자 특강에 참여한 수강생과 조합 임직원 단체 사진',
    photoCap: '초일류 全人 경영자 특강 참여자 단체 사진',
    d: '교육부 제33호 인가 비영리 교육기관이 운영하는 열린 교육 체계입니다.',
    intro: `<p>학교복지진흥사회적협동조합은 <strong>교육부 제33호 인가를 받은 비영리 교육기관</strong>입니다. 사회 발전과 시민 의식 함양 등 건강한 사회활동을 위한 인문·교양·문화·예술 시민교육 등 다양한 공익교육 프로그램을 제공하며, 개인의 삶의 질 향상과 교양 증진을 돕습니다.</p>
  <p>비영리 대학은 <strong>성별·연령의 제한이 없으며</strong>, 학력 보완이 필요한 분을 위한 인간 중심의 전인교육과 문자 해득 교육 등 평생 학습 기회 확대를 통해 민주 시민의 역할과 책임을 다할 수 있도록 하는 교육기관입니다.</p>
  <p>학생과 구성원에게 이익을 분배하지 않고 <strong>공익을 우선</strong>합니다. 일반 대학과 커리큘럼이 유사한 경우가 많지만 운영·법적 근거가 다르며, 학생 개개인의 성장 스토리와 인권·평화·융복합 학문 등 사회적 가치를 알리는 데 중점을 둡니다.</p>`,
    feats: [
      ['열린 입학', '성별·연령 제한 없이 누구나 · 학력 보완, 문자 해득 교육, 전인교육으로 평생 학습 기회를 넓힙니다.'],
      ['공익 우선 운영', '이익을 분배하지 않는 비영리 운영으로 교육의 공공성을 지킵니다.'],
      ['맞춤 진로·미래직업 훈련', '청소년 자기 주도적개발 및 학생별 맞춤 진로와 미래 직업에 도움이 되는 교육프로그램을 전달합니다.'],
      [
        '소셜캠퍼스 온 활용',
        '사회적기업을 위한 전국 18개 센터 공간을 대관해 꿈·취업·도전의 가치를 제시합니다.',
        {
          /* 검색어는 기관명만 — '지금 영업 중' 같은 상태어를 붙이면 결과가 엉뚱해진다 */
          href: 'https://www.google.com/search?q=%EC%86%8C%EC%85%9C%EC%BA%A0%ED%8D%BC%EC%8A%A4+%EC%98%A8&hl=ko&udm=1',
          label: '지금 영업 중',
          title: 'Google에서 소셜캠퍼스 온 실시간 영업 상태 보기',
          ariaLabel: '소셜캠퍼스 온 실시간 영업 상태를 새 창에서 확인하기',
        },
      ],
    ],
    extra: `<h3 style="font-size:21.5px;font-weight:900;color:var(--c-900);margin:32px 0 16px">산하 비영리 대학·캠퍼스</h3>
  <div class="grid-3">
    <a class="plain-card" href="/programs/bio" style="cursor:pointer"><h3 style="font-size:19px">바이오치유과학대학</h3><p>대전캠퍼스 · 바이오기술과 약선을 융합한 교육과정</p><span class="biz-more">소개 보기 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
    <div class="plain-card"><h3 style="font-size:19px">스포츠재활보건대학</h3><p>대구캠퍼스 · 스포츠 손상 예방·재활 교육 과정</p></div>
    <a class="plain-card" href="/programs/ynafc" style="cursor:pointer"><h3 style="font-size:19px">유소년축구사관학교</h3><p>대전YNAFC · 유소년축구클럽 운영</p><span class="biz-more">소개 보기 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
  </div>
  <div class="notice-box" style="margin-top:22px"><strong>안내</strong> · 학력이나 학위 취득이 목적이라면 평생교육시설보다 학점은행제를 통한 학점 취득이 더 효율적일 수 있습니다. 본 대학은 공익 목적의 평생교육 기관입니다.</div>`,
  },
  {
    id: 'ynafc',
    name: '유소년축구 (대전YNAFC)',
    tag: '스포츠',
    local: '/archive/images/ynafc-team.jpg',
    hero: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=1920',
    heroAlt: '잔디 구장 위의 축구공',
    alt: '대전YNA 유소년축구단 U-11·U-12 팀 단체 사진',
    d: '대한축구협회 1종 등록 유소년축구단. 초등학생 대상 전문 엘리트 축구 선수를 체계적으로 육성합니다.',
    photoCap: '',
    gallery: [
      ['/archive/images/ynafc-1.jpg', 'YNA FC 전체 선수단 단체 사진'],
      ['/archive/images/ynafc-2.jpg', '창단 기념식 · 선수단과 관계자'],
      ['/archive/images/ynafc-3.jpg', '코치진과 관계자'],
      ['/archive/images/ynafc-4.jpg', '합숙 훈련 식사 시간'],
    ],
    intro: `<p>유소년축구클럽 <strong>대전YNAFC</strong>는 학교복지진흥사회적협동조합 산하 유소년축구 구단입니다. 초등학생을 대상으로 전문 엘리트 축구 선수를 양성하며, <strong>대한축구협회 1종 등록</strong> 구단입니다.</p>
  <p>대전 지역의 큰 규모 구단으로서 유소년 축구 발전에 이바지하고 있으며, 대전광역시체육회·대전광역시축구협회가 주최하는 유소년 축구 페스티벌에 참여하는 등 학교와 협력해 체계적인 축구 훈련 프로그램을 제공합니다. 학교축구부·관련 기관들과 협력하여 훈련 프로그램, 전국대회 참가, 전문 코칭 시스템을 제공합니다.</p>`,
    feats: [
      ['체계적인 훈련 프로그램', '연령과 수준에 맞는 맞춤형 훈련으로 기본기·기술·전술·체력을 향상시킵니다.'],
      ['전문적인 코칭', '일반 축구 교실보다 전문적인 훈련 · 선수에게 필요한 모든 요소를 지도합니다.'],
      ['대회 참가·선수 발굴', '소년체전 대전대표 선발전 등 대회 참가로 잠재력 있는 선수를 발굴·육성합니다.'],
      ['연령별 팀 운영', 'U-11 · U-12 · U-15 연령별 팀을 운영합니다.'],
    ],
  },
  {
    id: 'mind',
    name: '마음건강진단센터 (교육)',
    tag: '상담·심리',
    local: '/archive/images/mind-1.jpg',
    hero: 'https://images.pexels.com/photos/268134/pexels-photo-268134.jpeg?auto=compress&cs=tinysrgb&w=1920',
    heroAlt: '노을 진 해변에서 명상하는 사람의 실루엣',
    alt: '뇌를 젊고 건강하게 유지하는 법 · 마음건강진단센터 안내 배너',
    photoCap: '',
    d: '개인 상담·심리 검사·집단 상담·스트레스 관리로 마음 건강을 진단하고, 뇌 교육·브레인 트레이닝을 운영합니다.',
    intro: `<p>마음건강진단센터는 개인의 마음 건강 문제를 진단하고 상담·치료를 지원하는 기관입니다. 직장 내 스트레스나 심리적 어려움을 겪는 사람을 위한 뇌 교육, 뇌 기능 향상·학습 능력 증진·집중력 강화를 목표로 하는 브레인 트레이닝 프로그램을 운영합니다.</p>
  <p>뇌는 우리 몸의 중추신경을 관장하는 곳으로, 뇌가 건강해야 몸의 기능이 제대로 작동할 수 있습니다. 기억력이 떨어진다면 뇌 건강을 확인해 보세요.</p>`,
    feats: [
      ['개인 상담', '우울·불안·스트레스 등 심리적 어려움에 전문 상담사가 심리 상담을 제공합니다.'],
      ['심리 검사', '기질·성격, 정신 건강, 학습 능력 등을 진단하는 다양한 심리 검사를 실시합니다.'],
      ['집단 상담·스트레스 관리', '주제별 집단 상담과 직장 스트레스·대인관계 갈등 관리를 지원합니다.'],
      ['예방·자가진단', '정신 질환 예방 교육과 조기 발견·치료 연계, 마음 건강 자가진단을 돕습니다.'],
      ['두뇌 기능 평가', '뇌파 분석·인지 능력 검사로 두뇌 능력을 객관적으로 평가합니다.'],
      ['두뇌 훈련 프로그램', '개인 특성에 맞는 두뇌 훈련 프로그램을 개발·운영합니다.'],
    ],
  },
  {
    id: 'bio',
    name: '바이오치유과학대학',
    tag: '교육과정',
    local: '/archive/images/bio-mentoring.jpg',
    hero: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1920',
    heroAlt: '실험실에서 플라스크를 든 연구자의 손',
    alt: '학과 멘토링 수업에 참여한 학생들의 사진 3장',
    d: '바이오기술과 약선(藥膳)을 융합해 건강식품·바이오 소재 개발 인재를 양성하는 교육과정입니다.',
    photoCap: '학과 멘토링 활동 사진',
    extra: `<h3 style="font-size:21.5px;font-weight:900;color:var(--c-900);margin:32px 0 16px">멘토링 후기</h3>
  <div class="grid-3">
    <div class="plain-card"><h3 style="font-size:18.5px">사회복지학과 멘토</h3><p>학생들이 먼저 관심을 갖고 질문해 준 덕분에 활기찬 멘토링이 되었고, 예상 밖의 질문으로 저의 학과를 더 잘 알게 된 시간이었습니다.</p></div>
    <div class="plain-card"><h3 style="font-size:18.5px">한국어문학부 멘토</h3><p>초롱초롱한 눈으로 들어 주는 아이들 덕분에 저 스스로 고교 시절을 되돌아보는 소중한 시간이었습니다.</p></div>
    <div class="plain-card"><h3 style="font-size:18.5px">사학과 멘토</h3><p>경청해 주고 궁금증을 해결하려 열성적으로 질문하는 모습에 기분 좋았고, 다음 멘토링이 기다려집니다.</p></div>
  </div>`,
    intro: `<p><strong>바이오치유과학대학</strong>(Bio Cure Science University)은 바이오기술(Biotechnology)과 약선(藥膳)의 개념을 융합한 학문 분야입니다. 유전자 재조합·세포 배양·발효 등 첨단 생명공학 기술로 약선 재료의 효능을 과학적으로 분석하고, 고부가가치 건강식품과 바이오 소재를 개발합니다.</p>
  <p>치료학·영양학·조리학의 지식을 결합해 질병을 예방하고 신체를 건강하게 하는 식품을 만들고 개발하는 인재를 육성합니다 · 전통 지혜와 첨단 과학의 융합으로 건강 증진과 삶의 질 향상에 기여하는 실용 학문입니다.</p>`,
    feats: [
      ['약선 × 바이오 × 푸드테크', '미생물 발효 기술로 건강에 이로운 음식을 만들고 푸드테크로 발전시키는 전문 인력을 양성합니다.'],
      ['식의(食醫) 전문가 양성', '한의학과 식품영양학을 접목해 건강 증진·질병 예방을 위한 식의 전문가를 양성합니다.'],
      ['바이오 소재 개발', '고부가가치 건강식품·바이오 소재 개발 역량을 교육합니다.'],
      ['생명과학·보건학 포괄', '생명과학·보건학 관련 분야를 포괄하는 융합 교육과정입니다.'],
    ],
  },
  {
    id: 'foot',
    name: '발진단클리닉 (센터교육)',
    tag: '전문교육',
    local: '/archive/images/foot-1.jpg',
    hero: 'https://images.pexels.com/photos/3865676/pexels-photo-3865676.jpeg?auto=compress&cs=tinysrgb&w=1920',
    heroAlt: '라벤더와 오일이 놓인 케어 용품',
    alt: '발관리실과 페디네이터 교육 강의 현장',
    d: '문제성 발관리사(페디네이터) 양성 과정 · 체계적인 교육으로 발 관리 전문 기능 인력을 양성합니다.',
    photoCap: '발관리실과 페디네이터 교육 강의 현장',
    intro: `<p><strong>문제성 발관리사 양성 과정</strong> · 체계적인 교육을 통해 발 관리 전문가(페디네이터)로서의 기능 인력을 양성하는 전문 교육과정입니다.</p>
  <p>교육은 35년간 의료보건 현장 경험을 쌓아 온 문제요 학부장 교수(초일류기업생명대학)가 맡고 있습니다. 병원 센터장, 여성발전센터·대학 체형교정 요가 강의 등 풍부한 현장 경력과 간호·체형관리·사회복지 분야의 다수 자격을 바탕으로 실무 중심의 교육을 제공합니다.</p>`,
    gallery: [
      ['/archive/images/foot-2.jpg', '실습 교육 · 발 진단·관리 실습 현장'],
      ['/archive/images/foot-1.jpg', '발관리실과 이론 강의'],
      ['/archive/images/foot-3.jpg', '내성발톱 교정 등 케어 사례 (교육 자료)'],
    ],
    extra: `<h3 style="font-size:21.5px;font-weight:900;color:var(--c-900);margin:32px 0 16px">담당 교수</h3>
  <div class="plain-card" style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
    <img src="/archive/images/foot-prof.jpg" alt="발진단클리닉 담당 문제요 교수 프로필 사진" loading="lazy" style="width:120px;border-radius:12px;flex:none">
    <div style="flex:1;min-width:220px">
      <h3 style="font-size:19px;margin-bottom:6px">문제요 학부장 교수 <span style="font-size:15px;font-weight:400;color:var(--ink-muted)">(초일류기업생명대학)</span></h3>
      <p>35년간의 의료보건 경험과 노하우를 바탕으로 사회에 가치 있는 활동을 이어가는 페디네이터 교육 담당 교수입니다. 병원 센터장·여성발전센터·대학 체형교정 요가 강의 등 현장 경력과 간호·체형관리·요가·사회복지 분야의 다수 자격을 보유하고 있습니다.</p>
    </div>
  </div>`,
    feats: [
      ['발 진단 전문 교육', '발 건강 진단의 이론과 실습을 체계적으로 교육합니다.'],
      ['체형·자세 교정 연계', '체형 교정 요가 등 자세·체형 관리와 연계한 커리큘럼을 운영합니다.'],
      ['현장 경력 교수진', '35년 의료보건 경험의 교수진이 실무 중심으로 지도합니다.'],
      ['수료 후 활동 지원', '기능 인력으로서의 사회적 활동을 지원합니다.'],
    ],
  },
  {
    id: 'startup',
    name: '창업특강 (인터넷신문)',
    tag: '특강',
    local: '/archive/images/startup-3.jpg',
    hero: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=1920',
    heroAlt: '쌓여 있는 신문들',
    alt: '창업특강 강의 현장 · 수강생들과 강사',
    d: '1인 창업 인터넷신문사 창간 로드맵과 성공 전략 특강. 기관·단체의 미디어 수익 모델 창출을 안내합니다.',
    photoCap: '창업특강 강의 현장',
    extra: `<h3 style="font-size:21.5px;font-weight:900;color:var(--c-900);margin:32px 0 16px">인터넷신문 솔루션 교육</h3>
  <div class="notice-box" style="margin-bottom:26px">
    <strong>누구나 쉽게 관리·운영할 수 있는 창업교육</strong> · 1인 사업자로 운영 가능한 신문사 등록 절차부터 인터넷신문 솔루션 운영 실무까지 교육합니다.
  </div>
  <h3 style="font-size:21.5px;font-weight:900;color:var(--c-900);margin:0 0 14px">세부 프로그램 (4회차)</h3>
  <div style="overflow-x:auto"><table class="info-table">
    <tr><th>1회차</th><td>교육 과정 안내(환영인사·오리엔테이션) · 창업 비즈니스 구축 전략 1 · 협업 도구 이용 안내(온라인 커뮤니티)</td></tr>
    <tr><th>2회차</th><td>개인과 팀과의 만남 · 창업 비즈니스 구축 전략 2 · 과제물 제출 안내, 온라인 멘토링 안내</td></tr>
    <tr><th>3회차</th><td>팀 경영 및 갈등관리 · 스탠포드 챌린지 · 과제물 제출 안내</td></tr>
    <tr><th>4회차</th><td>사회적기업가 육성사업 안내 · 창업 사업계획서 작성 이론과 실무 · 신문 솔루션 관리·운영 실무 · 수료식</td></tr>
  </table></div>
  <h3 style="font-size:21.5px;font-weight:900;color:var(--c-900);margin:32px 0 16px">창업 지원 체계</h3>
  <div class="flow3" style="max-width:100%">
    <div><b>창업성공멘토링</b><span>ICT 혁신기술 창업가의 창업 성공 멘토링</span></div>
    <div><b>오픈 멘토링·인적교류</b><span>대학생·일반인 대상 창업활성화, 네트워킹</span></div>
    <div><b>실전 창업교육·투자유치</b><span>기업가정신 함양, 선도기업·공공기관 연계 상생협력</span></div>
  </div>`,
    intro: `<p><strong>1인 창업 인터넷신문사 창간 로드맵과 성공 전략</strong> 특강입니다(강사: 이사장 김재호). 인터넷신문 창업 희망자를 위한 필수 가이드를 제공하며, 인터넷신문 창간을 통한 기관·단체의 수익 모델 창출 방법을 안내합니다.</p>
  <p>전통 인쇄 매체가 디지털화되는 흐름 속에서, 인터넷신문은 더 넓은 독자층에 신속하게 뉴스를 전달하는 플랫폼입니다. 특강에서는 창간 절차부터 운영 전략까지 단계별 로드맵을 다룹니다.</p>`,
    feats: [
      ['정보 접근성', '언제 어디서든 최신 뉴스를 접하는 정보의 민주화를 실현합니다.'],
      ['비용 효율성', '인쇄·배포 비용 절감으로 다양한 콘텐츠 생산이 가능합니다.'],
      ['실시간 소통', '독자 피드백을 바로 반영하는 인터랙티브 미디어를 만듭니다.'],
      ['수강 대상', '인터넷신문 창업 희망자 · 지식창업 희망자 · 수익 모델이 필요한 기관·단체.'],
    ],
  },
]
