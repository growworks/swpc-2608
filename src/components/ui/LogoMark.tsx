/**
 * 조합 CI 로고 마크 — 클라이언트 제공 원본 래스터를 배경(마젠타)만 투명 처리해
 * 그대로 사용한다(public/logo.png · 2026-08-12 지시: 디자인 무변경).
 * favicon.png / apple-touch-icon.png 도 같은 원본에서 나온 파생본.
 *
 * `plate` 는 마크 뒤에 흰 원판을 깐다 — 남색 푸터·홈 히어로 사진 위에서 남색 인물
 * 실루엣이 배경에 묻히지 않게 하는 표시 장치일 뿐, 로고 아트워크는 원본 그대로다.
 */
export function LogoMark({
  className,
  size,
  plate = true,
}: {
  className?: string
  size?: number
  plate?: boolean
}) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      {plate && <circle cx="60" cy="60" r="58" fill="#fff" />}
      <image href="/logo.png" x="12" y="12" width="96" height="96" />
    </svg>
  )
}
