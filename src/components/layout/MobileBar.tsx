import Link from 'next/link'
import { getSettings } from '@/lib/api/settings'

/** 모바일 하단바 — 홈·후원 페이지에서만 노출 (globals.css .school-shell.p-* 제어) */
export async function MobileBar() {
  const { accountNumber } = await getSettings()

  return (
    <div className="mobile-bar">
      <button className="btn btn-outline copy-btn-bar" data-copy={accountNumber}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
        계좌 복사
      </button>
      <Link className="btn btn-accent" href="/donate">후원하기</Link>
    </div>
  )
}
