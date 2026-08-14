/**
 * SEO 헬퍼 — 구조화 데이터(JSON-LD) 빌더와 공용 유틸.
 * 전 페이지가 같은 조직 @id 를 참조하도록 여기서만 LD 를 만든다.
 */
import type { SiteSettings } from '@/lib/api/settings'
import { NEWS_SITE_URL, ORG_NAME, ORG_NAME_EN, SITE_URL } from '@/lib/site'

export const ORG_ID = `${SITE_URL}#organization`
export const WEBSITE_ID = `${SITE_URL}#website`

/** 상대 경로 → 절대 URL */
export const abs = (path: string): string =>
  path.startsWith('http') ? path : `${SITE_URL}${path}`

/** `042-931-1479` → `+82-42-931-1479` (schema.org telephone 표기) */
export const toIntlTel = (tel: string): string =>
  tel.trim().startsWith('0') ? `+82-${tel.trim().slice(1)}` : tel.trim()

/**
 * 게시일 ISO 날짜(YYYY-MM-DD).
 * 서버 createdAt 은 DB 벽시계 값을 그대로 직렬화한 것이라(운영 확정) 시각·시간대를 쓰지 않고
 * 날짜부만 잘라 쓴다 — 화면 표기(formatPostDate)와 같은 정책.
 */
export const postDateISO = (iso: string): string => iso.slice(0, 10)

/** 본문 HTML → 메타 설명용 평문 (기본 160자) */
export function stripHtml(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** 조직(NGO) LD — settings 값 기반. 학교 레이아웃과 대문이 공유한다 */
export function organizationLd(s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': ORG_ID,
    name: s.companyName,
    alternateName: [ORG_NAME_EN, 'SWPC'],
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      '교육부 장관 인가 제33호 사회적협동조합. 학교와 지역이 함께, 한 아이도 놓치지 않는 학교복지를 만듭니다.',
    foundingDate: '2014-12-19',
    founder: { '@type': 'Person', name: s.ceoName },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      streetAddress: s.address,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: toIntlTel(s.phone),
        contactType: 'customer service',
        areaServed: 'KR',
        availableLanguage: 'ko',
        hoursAvailable: 'Mo-Fr 09:00-18:00',
      },
      { '@type': 'ContactPoint', email: s.email, contactType: 'customer service' },
    ],
    sameAs: [NEWS_SITE_URL],
    nonprofitStatus: 'NonprofitType',
  }
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: ORG_NAME,
    url: SITE_URL,
    inLanguage: 'ko-KR',
    publisher: { '@id': ORG_ID },
  }
}

/** 브레드크럼 — path 없는 항목은 링크 없이 이름만 */
export function breadcrumbLd(items: Array<{ name: string; path?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: abs(item.path) } : {}),
    })),
  }
}

/**
 * 게시글 Article LD (공지사항·활동소식·공시 상세 공용).
 * datePublished 는 날짜(YYYY-MM-DD)만 쓴다 — createdAt 의 시각·시간대 라벨을 신뢰하지 않는다.
 */
export function articleLd(input: {
  title: string
  path: string
  datePublished: string
  description?: string
  image?: string | null
  section?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    url: abs(input.path),
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(input.path) },
    datePublished: input.datePublished,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: [input.image] } : {}),
    ...(input.section ? { articleSection: input.section } : {}),
    inLanguage: 'ko-KR',
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  }
}

/** 게시판 목록 ItemList (건수가 많으면 현재 페이지 항목만 담는다) */
export function itemListLd(name: string, items: Array<{ url: string; name: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: item.url,
      name: item.name,
    })),
  }
}

/** FAQ 페이지 LD — 답변은 평문 */
export function faqPageLd(faqs: Array<[string, string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
