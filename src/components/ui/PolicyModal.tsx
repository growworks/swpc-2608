'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import './PolicyModal.css'

/* 약관 전문은 **열 때** 받아온다.
   children 으로 서버에서 넘기면 방침·약관 전문이 푸터가 있는 모든 페이지의 HTML 에 박혀
   (홈 기준 약 10KB) 페이지마다 같은 법령 문구가 중복된다. 지연 로드로 그 비용을 없앤다.
   전문 페이지(/privacy·/terms)는 같은 컴포넌트를 서버에서 그대로 렌더하므로 문구는 한 소스다. */
const LOADING = () => <p className="pm-loading">불러오는 중…</p>
const BODIES = {
  privacy: dynamic(() => import('@/components/policy/PrivacyBody').then((m) => m.PrivacyBody), {
    ssr: false,
    loading: LOADING,
  }),
  terms: dynamic(() => import('@/components/policy/TermsBody').then((m) => m.TermsBody), {
    ssr: false,
    loading: LOADING,
  }),
}

/**
 * 약관 전문을 모달로 띄우는 링크.
 *
 * 링크는 실제 `href` 를 그대로 갖는다 - 검색엔진·새 탭·가운데 클릭에는 전문 페이지(/privacy, /terms)가
 * 살아 있어야 하기 때문이다. 평범한 좌클릭만 가로채 모달로 대신 연다.
 *
 * 모달은 body 로 포털한다. 대문(.route-intro)처럼 스코프된 CSS 안에서 열려도
 * 그쪽 규칙이 새지 않고, 조상의 transform·overflow 에 갇히지도 않는다.
 */
export function PolicyModal({
  kind,
  href,
  label,
  title,
  className,
}: {
  /** 어느 문서를 띄울지 */
  kind: 'privacy' | 'terms'
  /** 전문 페이지 경로 - 새 탭·크롤러용으로 실제 링크에 남는다 */
  href: string
  /** 링크에 보이는 글자 */
  label: ReactNode
  /** 모달 제목 */
  title: string
  className?: string
}) {
  const Body = BODIES[kind]
  /* open 은 클릭으로만 켜지므로 이 시점엔 이미 하이드레이션이 끝났다 —
     포털을 위한 별도의 mounted 가드가 필요 없다 */
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    openerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  return (
    <>
      <a
        className={className}
        href={href}
        onClick={(e) => {
          /* 새 탭·다운로드 의도(수식키·가운데 클릭)는 그대로 링크로 넘긴다 */
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
          e.preventDefault()
          openerRef.current = e.currentTarget
          setOpen(true)
        }}
      >
        {label}
      </a>

      {open &&
        createPortal(
          <div className="pm-overlay" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
            <div
              className="pm-panel"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              tabIndex={-1}
              ref={panelRef}
            >
              <div className="pm-head">
                <h2>{title}</h2>
                <button type="button" className="pm-close" onClick={close} aria-label="닫기">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="pm-body detail-body"><Body /></div>
              <div className="pm-foot">
                <a className="btn btn-outline btn-sm" href={href}>전문 페이지로 보기</a>
                <button type="button" className="btn btn-primary btn-sm" onClick={close}>확인</button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
