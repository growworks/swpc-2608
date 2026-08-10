import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      /* 어드민 업로드 자산 (게시판 썸네일·공시 내역서·첨부). 업로드 이미지는 .webp 로 자동 변환됨 */
      { protocol: 'https', hostname: 'growworks.s3.ap-northeast-2.amazonaws.com' },
      /* 데모에서 사용한 스톡 이미지 (페이지 히어로·프로그램 소개) */
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
}

export default nextConfig
