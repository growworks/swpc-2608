'use client'

import { usePathname } from 'next/navigation'

/**
 * 학교 사이트 공통 래퍼 — 데모의 body 클래스(home/p-*)를 라우트 기반으로 재현.
 * globals.css 의 .school-shell.is-home/.p-* 셀렉터가 이 클래스를 참조한다.
 */
function pageKey(path: string): string {
  if (path === '/') return 'home'
  if (path.startsWith('/about')) return 'about'
  if (path.startsWith('/business')) return 'biz'
  if (path.startsWith('/join')) return 'join'
  if (path.startsWith('/donate')) return 'donate'
  if (path.startsWith('/report/')) return 'report-detail'
  if (path.startsWith('/report')) return 'report'
  if (path.startsWith('/news/')) return 'news-detail'
  if (path.startsWith('/news')) return 'news'
  if (path.startsWith('/programs')) return 'program-detail'
  if (path.startsWith('/login')) return 'login'
  if (path.startsWith('/signup')) return 'signup'
  if (path.startsWith('/mypage')) return 'mypage'
  return 'home'
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const key = pageKey(pathname)
  const cls = `school-shell${key === 'home' ? ' is-home' : ''} p-${key}`
  return <div className={cls}>{children}</div>
}
