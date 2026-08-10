'use client'

import { useEffect, useRef, useState } from 'react'

const SLIDES = [
  { src: '/archive/images/hero-1.jpg', alt: '창가로 햇살이 드는 밝은 교실' },
  { src: '/archive/images/hero-2.jpg', alt: '잔디밭에서 책을 보며 공부하는 학생' },
  { src: '/archive/images/hero-3.jpg', alt: '책상에서 자료를 검토하며 학습하는 모습' },
]

/** 홈 히어로 슬라이드 배경 + 도트 — 데모 켄번즈 슬라이더 이관 (7초 주기) */
export function HeroSlides({ children }: { children: React.ReactNode }) {
  const [cur, setCur] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timer.current = setInterval(() => setCur((c) => (c + 1) % SLIDES.length), 7000)
  }

  useEffect(() => {
    start()
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  const goSlide = (i: number) => {
    if (timer.current) clearInterval(timer.current)
    setCur(i % SLIDES.length)
    start()
  }

  return (
    <section className="hero" aria-label="대표 이미지">
      {SLIDES.map((s, i) => (
        <div className={`hero-slide${i === cur ? ' active' : ''}`} key={s.src}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt={s.alt} loading={i === 0 ? undefined : 'lazy'} />
        </div>
      ))}
      {children}
      <div className="hero-dots" role="tablist" aria-label="히어로 슬라이드 선택">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            className={i === cur ? 'on' : undefined}
            aria-label={`${i + 1}번 슬라이드`}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>
    </section>
  )
}
