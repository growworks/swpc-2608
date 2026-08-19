/**
 * 실시간 상태 배지 - 초록 점이 맥박치는 pill 형태의 외부 링크.
 * 데모(2026-08-19 개정본)의 `.live-badge` 마크업을 그대로 옮긴 것으로,
 * 교육프로그램 › 비영리 대학의 '소셜캠퍼스 온' 항목에서 구글 검색 결과를 새 창에 연다.
 *
 * 데모 원본 href 에는 구글 세션 토큰(sxsrf 타임스탬프·ved·uds)이 붙어 있었다.
 * 그 값들은 시간이 지나면 무효가 되므로 목적지가 같은 질의 URL 로만 남긴다.
 */
export function LiveBadge({
  href,
  label,
  title,
  ariaLabel,
}: {
  href: string
  label: string
  title: string
  ariaLabel: string
}) {
  return (
    <a
      className="live-badge"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={ariaLabel}
    >
      <span className="lvb-dot" aria-hidden="true" />
      {label}
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 4.1 12 6" />
        <path d="m5.1 8-2.9-.8" />
        <path d="m6 12-1.9 2" />
        <path d="M7.2 2.2 8 5.1" />
        <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
      </svg>
    </a>
  )
}
