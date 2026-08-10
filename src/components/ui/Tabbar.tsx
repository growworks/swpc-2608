'use client'

import { useEffect, useState } from 'react'

export interface TabDef {
  key: string
  label: string
}

/**
 * 페이지 내 섹션 탭바 — 데모의 해시 라우팅 탭 + 스크롤스파이 이관.
 * 섹션 id는 `${prefix}-${key}` 규칙(데모 동일). 첫 탭은 페이지 상단.
 */
export function Tabbar({ prefix, base, tabs }: { prefix: string; base: string; tabs: TabDef[] }) {
  const [on, setOn] = useState<string | null>(null)

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1)
      const found = tabs.find((t) => `${prefix}-${t.key}` === h)
      setOn(found ? found.key : null)
    }
    fromHash()

    /* 스크롤스파이 — 섹션 상단이 200px 이내로 올라오면 활성 (데모 로직) */
    let tick = false
    const spy = () => {
      let current: string | null = null
      for (const t of tabs) {
        const sec = document.getElementById(`${prefix}-${t.key}`)
        if (sec && sec.getBoundingClientRect().top <= 200) current = t.key
      }
      if (current) setOn(current)
    }
    const onScroll = () => {
      if (tick) return
      tick = true
      requestAnimationFrame(() => {
        spy()
        tick = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('hashchange', fromHash)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('hashchange', fromHash)
    }
  }, [prefix, tabs])

  const click = (e: React.MouseEvent, t: TabDef, first: boolean) => {
    e.preventDefault()
    const url = first ? base : `${base}#${prefix}-${t.key}`
    history.pushState(null, '', url)
    if (first) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      setOn(null)
    } else {
      const sec = document.getElementById(`${prefix}-${t.key}`)
      sec?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
      setOn(t.key)
    }
  }

  return (
    <nav className="tabbar">
      <div className="container tabbar-in">
        {tabs.map((t, i) => (
          <a
            key={t.key}
            href={i === 0 ? base : `${base}#${prefix}-${t.key}`}
            data-tab={t.key}
            className={on === t.key ? 'on' : undefined}
            onClick={(e) => click(e, t, i === 0)}
          >
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
