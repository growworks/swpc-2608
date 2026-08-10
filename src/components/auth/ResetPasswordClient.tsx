'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ApiError, errorMessage } from '@/lib/api/client'
import { forgotPassword, resetPassword } from '@/lib/api/members'
import { PW_RULES, PW_RULE_LABELS, pwOk } from '@/lib/auth'

type Msg = { type: 'ok' | 'err'; text: string } | null

export function ResetPasswordClient() {
  /* 서버 메일 링크가 /reset-password#token=... 형식이라 fragment 는 서버에서 못 읽는다 */
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState<Msg>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const hash = window.location.hash.replace(/^#/, '')
      const t = new URLSearchParams(hash).get('token')
      if (t) setToken(t)
    } catch {
      /* 파싱 실패 시 이메일 요청 화면으로 */
    }
    setReady(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const requestMail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    const em = email.trim()
    if (!em) {
      setMsg({ type: 'err', text: '가입 이메일을 입력해 주세요.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      await forgotPassword(em)
      /* 계정 열거 방지를 위해 항상 200 이 온다 — 계정 존재를 알려주는 문구를 쓰지 않는다 */
      setMsg({
        type: 'ok',
        text: '가입된 이메일이라면 비밀번호 재설정 링크를 보내드렸습니다. 메일함을 확인해 주세요.',
      })
    } catch (err) {
      setMsg({ type: 'err', text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  const submitNewPw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !token) return
    if (!pwOk(pw)) {
      setMsg({ type: 'err', text: '비밀번호 규칙(8자+영문/숫자/특수문자)을 확인해 주세요.' })
      return
    }
    if (pw !== pw2) {
      setMsg({ type: 'err', text: '비밀번호 확인이 일치하지 않습니다.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      await resetPassword(token, pw)
      /* 재설정 후 로그인 토큰은 발급되지 않아 로그인 화면으로 보낸다 */
      setMsg({ type: 'ok', text: '비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.' })
      setDone(true)
    } catch (err) {
      /* 실패 원인이 서로 달라 error 코드로 분기한다.
         전 케이스에 "재요청" 안내를 붙이면 이용 제한 계정에 재시도를 유도하게 되고(명세 금지),
         비밀번호 규칙 오류에도 만료 안내가 붙어 문구가 모순된다. */
      const base = errorMessage(err)
      const expired = err instanceof ApiError && err.code === 'UNAUTHORIZED'
      setMsg({
        type: 'err',
        text: expired
          ? '재설정 링크가 만료되었거나 이미 사용되었습니다. 아래에서 메일을 다시 요청해 주세요.'
          : base,
      })
      if (expired) setToken(null)
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return null

  const pw2Same = pw === pw2

  return (
    <div className="page active" id="pg-reset">
      <section className="sub-section">
        <div className="container auth-wrap">
          <div className="auth-card">
            <h1>비밀번호 재설정</h1>
            {token ? (
              <>
                <p className="auth-sub">새로 사용할 비밀번호를 입력해 주세요.</p>
                {done ? (
                  <>
                    <div className="form-msg show ok">{msg?.text}</div>
                    <div style={{ marginTop: 20 }}>
                      <Link className="btn btn-primary" href="/login">로그인 화면으로</Link>
                    </div>
                  </>
                ) : (
                  <form className="form" id="rsForm" noValidate onSubmit={submitNewPw}>
                    <div className="field"><label htmlFor="rsPw">새 비밀번호</label>
                      <input id="rsPw" type="password" required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
                      <div className="pw-rules" id="rsRules">
                        {PW_RULE_LABELS.map(([rule, label]) => (
                          <span key={rule} className={pw && PW_RULES[rule](pw) ? 'ok' : undefined}>{label}</span>
                        ))}
                      </div></div>
                    <div className="field"><label htmlFor="rsPw2">새 비밀번호 확인</label>
                      <input id="rsPw2" type="password" required autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
                      <p className={`hint ${pw2Same ? 'ok' : 'err'}`} id="rsPw2Hint">
                        {pw2 ? (pw2Same ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.') : ''}
                      </p></div>
                    <div className={`form-msg${msg ? ` show ${msg.type}` : ''}`} id="rsMsg">{msg?.text}</div>
                    <button type="submit" className="btn btn-primary" disabled={busy}>비밀번호 변경</button>
                  </form>
                )}
              </>
            ) : (
              <>
                <p className="auth-sub">가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
                <form className="form" id="rsMailForm" noValidate onSubmit={requestMail}>
                  <div className="field"><label htmlFor="rsEmail">가입 이메일</label>
                    <input id="rsEmail" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div className={`form-msg${msg ? ` show ${msg.type}` : ''}`} id="rsMailMsg">{msg?.text}</div>
                  <button type="submit" className="btn btn-primary" disabled={busy}>재설정 메일 받기</button>
                </form>
              </>
            )}
            <div className="auth-links">
              <Link href="/login">로그인</Link><span>·</span><Link href="/support">도움이 필요하신가요?</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
