import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* 로그인·가입·마이페이지·비밀번호 재설정은 robots 로 막지 않는다 —
         Disallow 를 걸면 크롤러가 페이지의 noindex 메타를 읽지 못해
         외부 링크 시 "차단됐지만 색인됨" 상태로 남을 수 있다. noindex 메타가 색인 제외를 담당한다.
         /api/ 는 프록시 라우트(HTML 아님)라 크롤 자체를 차단한다. */
      disallow: ['/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
