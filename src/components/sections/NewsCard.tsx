import Link from 'next/link'
import { activityMeta, formatPostDate, type Post } from '@/lib/api/posts'

/**
 * 활동 소식 카드.
 * 썸네일이 없어도 .news-thumb 래퍼는 유지한다 — 데모가 16:10 그라디언트 플레이스홀더로
 * 카드 높이를 맞추고 있어 래퍼를 없애면 그리드 리듬이 깨진다(데모 onerror 는 img 만 제거했다).
 */
export function NewsCard({ post }: { post: Post }) {
  const { topic, thumbnailUrl, thumbnailAlt } = activityMeta(post)
  /* 날짜를 못 읽으면 빈 <p> 가 남아 카드 높이가 어긋난다 — 데모처럼 요소째 생략 */
  const date = formatPostDate(post.createdAt)

  return (
    <Link className="news-card" href={`/news/${post.id}`}>
      <div className="news-thumb">
        {thumbnailUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={thumbnailUrl} alt={thumbnailAlt} loading="lazy" />
        )}
      </div>
      <div className="news-body">
        {topic && <span className="news-cat">{topic}</span>}
        <h3>{post.title}</h3>
        {date && <p className="news-date">{date}</p>}
      </div>
    </Link>
  )
}
