'use client'

import { useEffect, useRef, useState } from 'react'

type Shot = { src: string; alt: string; width?: number }

/**
 * 사진 클릭 확대 - 데모 라이트박스 이관.
 *
 * 대상은 두 가지다.
 * 1) 조합 제공 정적 사진(`/archive` 경로)
 * 2) 활동소식 상세의 사진 뷰어 스테이지(`.pv-stage`) - 이미지가 S3 URL 이라 경로로 못 거르고,
 *    `object-fit:contain` 으로 축소돼 있으므로 데모처럼 **실제 렌더 크기의 1.5배**로 띄운다.
 * 뷰어의 썸네일(`.pv-th`)은 사진을 전환하는 버튼이므로 확대 대상에서 뺀다.
 */
export function Lightbox() {
  const [img, setImg] = useState<Shot | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const overlay = overlayRef.current
      const el = target.closest('img')
      const stage = el?.closest('.pv-stage')

      if (
        el &&
        overlay &&
        !overlay.contains(el) &&
        !el.closest('a') &&
        !el.closest('.pv-th') &&
        ((el.getAttribute('src') || '').startsWith('/archive') || stage)
      ) {
        let width: number | undefined
        if (stage && el.naturalWidth && el.naturalHeight) {
          /* contain 으로 실제 그려진 배율(k)을 구해 그 1.5배를 픽셀 폭으로 고정한다 */
          const r = el.getBoundingClientRect()
          const k = Math.min(r.width / el.naturalWidth, r.height / el.naturalHeight)
          if (k > 0) width = Math.round(el.naturalWidth * k * 1.5)
        }
        setImg({ src: el.getAttribute('src') || '', alt: el.alt || '', width })
        document.body.style.overflow = 'hidden'
        return
      }
      if (target === overlay || target.closest('.lb-close')) {
        setImg(null)
        document.body.style.overflow = ''
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setImg(null)
        document.body.style.overflow = ''
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div
      ref={overlayRef}
      className={`lb-overlay${img ? ' show' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 확대 보기"
    >
      <button className="lb-close" aria-label="확대 보기 닫기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
      {img && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={img.src} alt={img.alt} style={img.width ? { width: img.width, height: 'auto' } : undefined} />
      )}
      <div className="lb-cap">{img?.alt || ''}</div>
    </div>
  )
}
