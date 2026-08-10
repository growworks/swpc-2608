'use client'

import { useEffect, useRef, useState } from 'react'

/** 조합 제공 사진(/archive 경로) 클릭 확대 — 데모 라이트박스 이관 */
export function Lightbox() {
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const overlay = overlayRef.current
      const el = target.closest('img')
      if (
        el &&
        overlay &&
        !overlay.contains(el) &&
        !el.closest('a') &&
        (el.getAttribute('src') || '').startsWith('/archive')
      ) {
        setImg({ src: el.getAttribute('src') || '', alt: el.alt || '' })
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
        <img src={img.src} alt={img.alt} />
      )}
      <div className="lb-cap">{img?.alt || ''}</div>
    </div>
  )
}
