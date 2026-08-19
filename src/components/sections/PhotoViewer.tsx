'use client'

import { useRef, useState } from 'react'

const ARROW = (dir: -1 | 1) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir < 0 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
  </svg>
)

/**
 * 활동소식 상세 사진 뷰어 - 데모(2026-08-19 개정본)의 photoViewer 이관.
 *
 * 원본 비율을 유지한 채(잘림 없음) 좌우 화살표·썸네일·키보드 좌우키로 사진을 넘긴다.
 * 스테이지 사진을 클릭하면 라이트박스가 1.5배로 띄운다(Lightbox 가 처리).
 * 사진이 1장이면 데모와 같이 화살표·번호·썸네일을 모두 감춘다.
 */
export function PhotoViewer({ photos }: { photos: [string, string][] }) {
  const [i, setI] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  if (photos.length === 0) return null

  const multi = photos.length > 1
  const [src, cap] = photos[Math.min(i, photos.length - 1)]
  const go = (n: number) => setI(((n % photos.length) + photos.length) % photos.length)

  return (
    <div
      className={`pv${multi ? ' is-multi' : ''}`}
      ref={rootRef}
      onKeyDown={(e) => {
        if (!multi) return
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          go(i - 1)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          go(i + 1)
        }
      }}
    >
      <div className="pv-view">
        {multi && (
          <button type="button" className="pv-arrow pv-prev" onClick={() => go(i - 1)} aria-label="이전 사진">
            {ARROW(-1)}
          </button>
        )}
        <div className="pv-stage">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={cap} loading="lazy" />
        </div>
        {multi && (
          <button type="button" className="pv-arrow pv-next" onClick={() => go(i + 1)} aria-label="다음 사진">
            {ARROW(1)}
          </button>
        )}
      </div>

      <div className="pv-meta">
        {multi && (
          <span className="pv-count">
            <b>{i + 1}</b> / {photos.length}
          </span>
        )}
        <p className="pv-cap">{cap}</p>
      </div>

      {multi && (
        <div className="pv-thumbs">
          {photos.map(([thumb], idx) => (
            <button
              type="button"
              key={thumb}
              className={`pv-th${idx === i ? ' on' : ''}`}
              onClick={() => go(idx)}
              aria-label={`${idx + 1}번째 사진 보기`}
              aria-current={idx === i ? 'true' : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
