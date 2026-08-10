'use client'

import { useEffect, useRef, useState } from 'react'

/** FAQ 아코디언 — 한 번에 1개만 열림 (데모 로직 이관) */
export function FaqAccordion({ faqs }: { faqs: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(null)
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([])

  /* 데모와 동일하게 열린 항목의 scrollHeight를 max-height로 지정해 전환 */
  useEffect(() => {
    bodyRefs.current.forEach((el, i) => {
      if (!el) return
      el.style.maxHeight = open === i ? `${el.scrollHeight}px` : ''
    })
  }, [open])

  return (
    <div className="accordion" id="faqAcc" style={{ maxWidth: 1030 }}>
      {faqs.map(([q, a], i) => (
        <div className={`acc-item${open === i ? ' open' : ''}`} key={i}>
          <button
            className="acc-q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="q-mark">Q</span>
            {q}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <div
            className="acc-a"
            ref={(el) => {
              bodyRefs.current[i] = el
            }}
          >
            <div className="acc-a-in">{a}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
