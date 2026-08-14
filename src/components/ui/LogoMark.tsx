/**
 * 조합 CI 로고 마크 — 3색 육각 스월(파랑·주황·연두) + 인물 3인(남색).
 * 클라이언트 제공 로고 원본(래스터)을 벡터로 재작성한 것.
 * public/favicon.svg 와 동일 아트워크 — 수정 시 두 곳을 함께 갱신할 것.
 *
 * `plate` 는 마크 뒤에 흰 원판을 깐다 — 남색 푸터·홈 히어로 사진 위에서
 * 남색 인물 실루엣이 묻히지 않게 하기 위한 것(기본 켜짐). 파비콘도 동일.
 */
const SEG =
  'M 20 46 L 36 18.4 L 76 18.4 Q 81 18.4 81.5 24.5 C 82.5 31 78.5 37 72.5 39.5 Q 65.5 36 58 36.3 Q 45.5 37.6 39.2 48.2 Q 27 52 20 46 Z'

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
      <path d={SEG} fill="#2BA3DC" />
      <path d={SEG} fill="#F5A623" transform="rotate(120 60 60)" />
      <path d={SEG} fill="#A6BA3E" transform="rotate(240 60 60)" />
      <g fill="#1F3A60">
        <circle cx="45.5" cy="52.5" r="5.9" />
        <path d="M 37 73 C 34.2 65.5 35.6 58.8 40.3 56.6 C 44.6 54.6 49 55.9 51.2 59.2 C 48.2 62.5 45.2 66.5 43.2 71 C 41 71.6 39 72.2 37 73 Z" />
        <circle cx="74.5" cy="52.5" r="5.9" />
        <path d="M 83 73 C 85.8 65.5 84.4 58.8 79.7 56.6 C 75.4 54.6 71 55.9 68.8 59.2 C 71.8 62.5 74.8 66.5 76.8 71 C 79 71.6 81 72.2 83 73 Z" />
        <circle cx="60" cy="48" r="7" />
        <path d="M 60 81.5 C 50.5 73 47.8 63.5 51.2 59.6 C 53.6 56.8 56.6 56 60 56 C 63.4 56 66.4 56.8 68.8 59.6 C 72.2 63.5 69.5 73 60 81.5 Z" />
      </g>
    </svg>
  )
}
