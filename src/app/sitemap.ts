import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getNewsBoards, getPrograms, getReportBoards } from '@/lib/api/content'
import type { Post } from '@/lib/api/posts'
import { postDateISO } from '@/lib/seo'

/**
 * lastmod 는 게시일(createdAt)의 날짜부(YYYY-MM-DD)만 쓴다.
 * createdAt 은 DB 벽시계 값이라 시각·시간대 라벨을 신뢰하지 않는다(Article datePublished 와 동일 정책).
 * updatedAt 은 글 수정 시각이 아니라 사실상 "마지막 조회 시각"이라 쓰지 않는다.
 */
const postDate = (p: Post) => postDateISO(p.createdAt)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const programs = await getPrograms()

  /* 게시글 URL 은 API 상태에 따라 비어도 되지만, API 장애로 sitemap 전체가
     실패하면 안 되므로 여기서만 실패를 흡수한다 */
  let posts: MetadataRoute.Sitemap = []
  try {
    const [news, reports] = await Promise.all([getNewsBoards(), getReportBoards()])
    posts = [
      ...[...news.notices, ...news.activities].map((p) => ({
        url: `${SITE_URL}/news/${p.id}`,
        lastModified: postDate(p),
        priority: 0.6,
        changeFrequency: 'yearly' as const,
      })),
      ...[...reports.mgmt, ...reports.donation].map((p) => ({
        url: `${SITE_URL}/report/${p.id}`,
        lastModified: postDate(p),
        priority: 0.6,
        changeFrequency: 'yearly' as const,
      })),
    ]
  } catch {
    posts = []
  }

  /* 로그인·가입·마이페이지·비밀번호 재설정은 색인 대상이 아니라 제외한다 */
  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, priority: 1, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/intro`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/business`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/join`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/donate`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/report`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/news`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/support`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/privacy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${SITE_URL}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  ]

  return [
    ...statics,
    ...programs.map((p) => ({
      url: `${SITE_URL}/programs/${p.id}`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })),
    ...posts,
  ]
}
