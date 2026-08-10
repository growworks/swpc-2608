'use client'

import { useEffect } from 'react'

/** 대문 스크롤 등장 애니메이션 — 데모 스크립트 이관 (관찰 실패 시 강제 노출 안전장치 포함) */
export function IntroEffects() {
  useEffect(() => {
    const revealEls = document.querySelectorAll('.route-intro .reveal')
    const showAll = () => revealEls.forEach((el) => el.classList.add('visible'))

    if (!('IntersectionObserver' in window)) {
      showAll()
      return
    }
    let observerFired = false
    const revealObserver = new IntersectionObserver(
      (entries) => {
        observerFired = true
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            revealObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    revealEls.forEach((el) => revealObserver.observe(el))

    /* 안전장치: 관찰이 한 번도 동작하지 않으면 콘텐츠를 그대로 노출 */
    const t = setTimeout(() => {
      if (!observerFired) showAll()
    }, 2000)

    /* prefers-reduced-motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) showAll()

    return () => {
      revealObserver.disconnect()
      clearTimeout(t)
    }
  }, [])

  return null
}
