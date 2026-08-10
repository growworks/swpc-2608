import type { Metadata } from 'next'
import { SITE_URL, ORG_NAME, ORG_NAME_EN } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${ORG_NAME} | 한 아이도 놓치지 않는 학교복지`,
    template: `%s | ${ORG_NAME}`,
  },
  description:
    '교육부 장관 인가 제33호 사회적협동조합. 경제적·정서적 어려움을 겪는 학생을 지원하고, 학교·지역사회·기관을 잇는 교육복지 협력망을 만드는 비영리 사회적협동조합입니다.',
  keywords: [
    ORG_NAME,
    '사회적협동조합',
    '학교복지',
    '교육복지',
    'CWC교원투데이',
    '기부금 영수증',
    '경영공시',
    '유소년축구',
    '대전YNAFC',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: ORG_NAME,
    title: `${ORG_NAME} | 한 아이도 놓치지 않는 학교복지`,
    description:
      '교육부 장관 인가 제33호 사회적협동조합. 학교와 지역이 함께, 한 아이도 놓치지 않는 학교복지를 만듭니다.',
    images: [{ url: '/archive/images/hero-1.jpg' }],
  },
  other: { 'organization-name': ORG_NAME_EN },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* 루트 레이아웃 폰트는 전 페이지에 적용됨 — App Router에서는 규칙이 오탐 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Noto+Serif+KR:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}
