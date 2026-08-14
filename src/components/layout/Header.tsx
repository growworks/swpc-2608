'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MENUS } from '@/lib/data/faqs'
import type { PublicMember } from '@/lib/api/members'
import { clearSession, getCachedMember, subscribeSession } from '@/lib/auth'
import { showToast } from '@/lib/toast'
import { LogoMark } from '@/components/ui/LogoMark'

/** 데모 GNB — 상위 메뉴 href는 첫 하위 항목과 동일 */
const GNB: [string, string][] = MENUS.map(([label, subs]) => [label, subs[0][1]])

export function Header() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<number | null>(null)
  const [session, setSess] = useState<PublicMember | null>(null)

  useEffect(() => {
    const sync = () => setSess(getCachedMember())
    sync()
    return subscribeSession(sync)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => {
    setMenuOpen(false)
    setOpenGroup(null)
  }

  /* 서버에 로그아웃 엔드포인트가 없어 프론트 저장소를 비우는 것으로 처리한다 */
  const logout = () => {
    clearSession()
    showToast('로그아웃되었습니다.')
    router.push('/')
  }

  const blurSelf = (e: React.MouseEvent<HTMLAnchorElement>) => {
    ;(e.currentTarget as HTMLAnchorElement).blur()
  }

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`} id="siteHeader">
        <div className="container">
          <Link className="logo" href="/" aria-label="학교복지진흥사회적협동조합 홈">
            <LogoMark className="logo-mark" />
            <span className="logo-text">학교복지진흥사회적협동조합</span>
          </Link>

          <nav aria-label="주 메뉴">
            <ul className="gnb">
              {GNB.map(([label, href], i) => (
                <li key={label}>
                  <Link href={href} onClick={blurSelf}>{label}</Link>
                  <div className="dropdown">
                    {MENUS[i][1].map(([s, h]) => (
                      <Link key={h} href={h} onClick={blurSelf}>{s}</Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-util">
            <div className="util-links" id="headerAuth">
              {session ? (
                <>
                  <Link href="/mypage" className="u-name">{session.name}님</Link>
                  <Link href="/mypage">마이페이지</Link>
                  <a onClick={logout}>로그아웃</a>
                </>
              ) : (
                <>
                  <Link href="/login">로그인</Link>
                  <Link href="/signup">회원가입</Link>
                </>
              )}
            </div>
            <Link className="btn btn-accent header-cta" href="/donate">후원하기</Link>
            <button
              className="hamburger"
              aria-label="전체 메뉴 열기"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      <div className={`mm-dim${menuOpen ? ' show' : ''}`} onClick={closeMenu} />
      <aside className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-label="모바일 메뉴">
        <div className="mm-head">
          <strong>전체 메뉴</strong>
          <button className="mm-close" aria-label="메뉴 닫기" onClick={closeMenu}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C2630" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div id="mmGroups">
          {MENUS.map(([g, subs], i) => (
            <div className={`mm-group${openGroup === i ? ' open' : ''}`} key={g}>
              <button
                aria-expanded={openGroup === i}
                onClick={() => setOpenGroup(openGroup === i ? null : i)}
              >
                {g}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div className="mm-sub" style={openGroup === i ? { maxHeight: 420 } : undefined}>
                {subs.map(([s, h]) => (
                  <Link key={h} href={h} className="mm-link" onClick={closeMenu}>{s}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mm-foot">
          <Link className="btn btn-accent mm-link" href="/donate" onClick={closeMenu}>후원하기</Link>
          {session ? (
            <Link className="btn btn-outline mm-link" href="/mypage" onClick={closeMenu}>{session.name}님 · 마이페이지</Link>
          ) : (
            <Link className="btn btn-outline mm-link" href="/login" onClick={closeMenu}>로그인 / 회원가입</Link>
          )}
        </div>
      </aside>
    </>
  )
}
