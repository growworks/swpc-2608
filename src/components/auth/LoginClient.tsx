'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { errorMessage } from '@/lib/api/client'
import { login } from '@/lib/api/members'
import { setSession, takeLoginDest } from '@/lib/auth'
import { showToast } from '@/lib/toast'

type Msg = { type: 'ok' | 'err'; text: string } | null

export function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState<Msg>(null)
  const [busy, setBusy] = useState(false)

  /* 서버에는 실패 카운트가 없고 IP 단위 rate limit 만 있어 데모의 계정 잠금 흐름은 두지 않는다 */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    const em = email.trim()
    if (!em || !pw) {
      setMsg({ type: 'err', text: '이메일과 비밀번호를 입력해 주세요.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const res = await login(em, pw)
      setSession(res.token, res.member)
      showToast(res.member.name + '님, 환영합니다.')
      const dest = takeLoginDest()
      /* 운영자가 어드민에서 수동 등록한 계정은 동의 없이 생성돼 consentRequired 가 true 로 온다.
         동의를 서버에 남길 화면이 마이페이지뿐이라 그쪽으로 먼저 보낸다(명세 지시). */
      router.push(res.member.consentRequired ? '/mypage' : dest)
    } catch (err) {
      /* 없는 계정과 비밀번호 오류가 같은 INVALID_CREDENTIALS 로 오므로 구분 문구를 만들지 않는다 */
      setMsg({ type: 'err', text: errorMessage(err) })
      setBusy(false)
    }
  }

  return (
    <div className="page active" id="pg-login">
      <section className="sub-section">
        <div className="container auth-wrap">
          <div className="auth-card">
            <h1>로그인</h1>
            <p className="auth-sub">회원 로그인 후 프로그램 신청·후원 이력을 관리할 수 있습니다.</p>
            <form className="form" id="loginForm" noValidate onSubmit={submit}>
              <div className="field"><label htmlFor="liEmail">이메일</label>
                <input id="liEmail" type="email" required autoComplete="username" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="field"><label htmlFor="liPw">비밀번호</label>
                <input id="liPw" type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
              <div className={`form-msg${msg ? ` show ${msg.type}` : ''}`} id="loginMsg">{msg?.text}</div>
              <button type="submit" className="btn btn-primary" disabled={busy}>로그인</button>
            </form>
            <div className="auth-links">
              <Link href="/signup">회원가입</Link><span>·</span><Link href="/reset-password">비밀번호를 잊으셨나요?</Link><span>·</span><Link href="/support">도움이 필요하신가요?</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
