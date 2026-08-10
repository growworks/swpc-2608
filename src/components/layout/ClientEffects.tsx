'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { showToast } from '@/lib/toast'

/**
 * 데모 SPA의 전역 스크립트 이관:
 * [data-copy] 복사 버튼 · tr[data-href] 게시판 행 이동 · 본문 innerHTML 내부 링크 ·
 * 이미지 로드 실패 제거(onerror 대체) · 리빌 IO · 조직도 가운데 정렬 · 해시 즉시 점프
 */
export function ClientEffects() {
  const router = useRouter()
  const pathname = usePathname()

  /* 전역 위임 이벤트 — 1회 등록 */
  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement

      /* 복사 버튼 */
      const btn = target.closest<HTMLElement>('[data-copy]')
      if (btn) {
        const v = btn.dataset.copy || ''
        try {
          await navigator.clipboard.writeText(v)
        } catch {
          alert('복사해 주세요: ' + v)
          return
        }
        if (btn.classList.contains('copy-btn')) {
          const o = btn.innerHTML
          btn.classList.add('copied')
          btn.textContent = '복사됨'
          setTimeout(() => {
            btn.classList.remove('copied')
            btn.innerHTML = o
          }, 2000)
        }
        showToast('복사되었습니다: ' + v)
        return
      }

      /* 게시판 행 이동 */
      const tr = target.closest<HTMLElement>('tr[data-href]')
      if (tr && tr.dataset.href) {
        router.push(tr.dataset.href)
        return
      }

      /* dangerouslySetInnerHTML 본문 내 내부 링크 → 클라이언트 내비게이션 */
      const a = target.closest<HTMLAnchorElement>('[data-html-body] a[href^="/"]')
      if (a && !a.target && !a.hasAttribute('download')) {
        e.preventDefault()
        router.push(a.getAttribute('href') || '/')
      }
    }
    document.addEventListener('click', onClick)

    /* 이미지 로드 실패 시 제거 (데모 onerror="this.remove()" 대체) */
    const onError = (e: Event) => {
      const el = e.target as HTMLElement
      if (el && el.tagName === 'IMG') {
        const fig = el.closest('figure.detail-img')
        if (fig) fig.remove()
        else el.remove()
      }
    }
    document.addEventListener('error', onError, true)

    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('error', onError, true)
    }
  }, [router])

  /* 라우트 변경 시: 리빌 재관찰 · 조직도 정렬 · 해시 즉시 점프 */
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        }),
      { threshold: 0.12 },
    )
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))

    /* 조직도 가로 스크롤 — 화면에 보이면 가운데부터 시작 */
    const centerOrg = (el: HTMLElement) => {
      const gap = el.scrollWidth - el.clientWidth
      if (gap <= 4) return
      if (el.dataset.centered && el.scrollLeft > 2) return
      const r = el.getBoundingClientRect()
      if (r.top > innerHeight || r.bottom < 0) return
      el.scrollLeft = gap / 2
      if (el.scrollLeft > 2) el.dataset.centered = '1'
    }
    const centerOrgAll = () =>
      document.querySelectorAll<HTMLElement>('.orgtree-scroll').forEach(centerOrg)
    document
      .querySelectorAll<HTMLElement>('.orgtree-scroll')
      .forEach((el) => delete el.dataset.centered)
    const timers = [200, 520].map((t) => setTimeout(centerOrgAll, t))

    let tick = false
    const onScroll = () => {
      if (tick) return
      tick = true
      requestAnimationFrame(() => {
        centerOrgAll()
        tick = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    /* 해시 진입 시 레이아웃 확정 후 즉시 점프 (데모 route() 보정 로직) */
    const hash = window.location.hash.slice(1)
    if (hash) {
      const target = document.getElementById(hash)
      if (target) {
        const jump = () =>
          target.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
        jump()
        timers.push(setTimeout(jump, 0), setTimeout(jump, 140))
      }
    }

    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname])

  return null
}
