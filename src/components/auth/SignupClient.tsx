'use client'

import { useState } from 'react'
import Link from 'next/link'
import { errorMessage } from '@/lib/api/client'
import { signup } from '@/lib/api/members'
import { PW_RULES, PW_RULE_LABELS, pwOk, setSession } from '@/lib/auth'

type Msg = { type: 'ok' | 'err'; text: string } | null

/* 서버에 이메일 인증 API 가 없어 데모의 4단계에서 인증 단계를 뺀 3단계로 진행한다 */
const STEPS = ['약관 동의', '정보 입력', '완료']

export function SignupClient() {
  const [step, setStep] = useState(1)
  const [ag1, setAg1] = useState(false)
  const [ag2, setAg2] = useState(false)
  const [ag3, setAg3] = useState(false)
  const [msg1, setMsg1] = useState<Msg>(null)
  const [name, setName] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg2, setMsg2] = useState<Msg>(null)
  const [busy, setBusy] = useState(false)

  const agAll = ag1 && ag2 && ag3
  const setAll = (v: boolean) => {
    setAg1(v)
    setAg2(v)
    setAg3(v)
  }

  const next1 = () => {
    if (ag1 && ag2) setStep(2)
    else setMsg1({ type: 'err', text: '필수 약관에 모두 동의해 주세요.' })
  }

  const submitInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    const em = email.trim()
    if (!name.trim() || !tel.trim() || !em) {
      setMsg2({ type: 'err', text: '필수 항목을 모두 입력해 주세요.' })
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
      setMsg2({ type: 'err', text: '이메일 형식을 확인해 주세요.' })
      return
    }
    /* 서버는 8자 이상만 검증하므로 데모의 영문/숫자/특수문자 규칙은 프론트에서 계속 확인한다 */
    if (!pwOk(pw)) {
      setMsg2({ type: 'err', text: '비밀번호 규칙(8자+영문/숫자/특수문자)을 확인해 주세요.' })
      return
    }
    if (pw !== pw2) {
      setMsg2({ type: 'err', text: '비밀번호 확인이 일치하지 않습니다.' })
      return
    }
    setBusy(true)
    setMsg2(null)
    try {
      /* phone 은 국가 내 번호 그대로 보낸다 (phoneCountry 미전송 = KR 기본값) */
      const res = await signup({
        email: em,
        password: pw,
        name: name.trim(),
        phone: tel.trim(),
        termsAgreed: ag1,
        privacyAgreed: ag2,
        marketingAgreed: ag3,
      })
      /* 가입 응답에 토큰이 함께 오므로 별도 로그인 호출이 필요 없다 */
      setSession(res.token, res.member)
      setStep(3)
    } catch (err) {
      setMsg2({ type: 'err', text: errorMessage(err) })
      setBusy(false)
    }
  }

  const pw2Same = pw === pw2

  return (
    <div className="page active" id="pg-signup">
      <section className="sub-section">
        <div className="container auth-wrap wide">
          <div className="auth-card">
            <h1>회원가입</h1>
            <p className="auth-sub">이메일 회원가입 (SNS 로그인은 제공하지 않습니다)</p>
            <div className="stepper" id="suStepper">
              {STEPS.map((label, i) => (
                <span key={label} style={{ display: 'contents' }}>
                  {i > 0 && <div className="step-line" />}
                  <div className={`step${step === i + 1 ? ' on' : ''}${step > i + 1 ? ' done' : ''}`} data-step={i + 1}>
                    <span className="s-num">{i + 1}</span>
                    <span className="s-label">{label}</span>
                  </div>
                </span>
              ))}
            </div>

            {step === 1 && (
              <div id="suStep1">
                <div className="agree-line all">
                  <input type="checkbox" id="agAll" checked={agAll} onChange={(e) => setAll(e.target.checked)} />
                  <label htmlFor="agAll">전체 동의</label>
                </div>
                <div className="agree-line">
                  <input type="checkbox" className="ag-item ag-req" id="ag1" checked={ag1} onChange={(e) => setAg1(e.target.checked)} />
                  <label htmlFor="ag1">이용약관 동의 <span className="req-tag">(필수)</span></label>
                </div>
                <div className="agree-line">
                  <input type="checkbox" className="ag-item ag-req" id="ag2" checked={ag2} onChange={(e) => setAg2(e.target.checked)} />
                  <label htmlFor="ag2">개인정보 수집·이용 동의 <span className="req-tag">(필수)</span> · 수집 항목: 이름·이메일·연락처</label>
                </div>
                <div className="agree-line">
                  <input type="checkbox" className="ag-item" id="ag3" checked={ag3} onChange={(e) => setAg3(e.target.checked)} />
                  <label htmlFor="ag3">소식·프로그램 안내 수신 동의 <span className="opt-tag">(선택)</span></label>
                </div>
                <div className={`form-msg${msg1 ? ` show ${msg1.type}` : ''}`} id="suMsg1">{msg1?.text}</div>
                <button className="btn btn-primary" id="suNext1" style={{ marginTop: 20 }} onClick={next1}>다음</button>
              </div>
            )}

            {step === 2 && (
              <div id="suStep2">
                <form className="form" id="suForm" noValidate onSubmit={submitInfo}>
                  <div className="form-grid2">
                    <div className="field"><label htmlFor="suName">이름 <span className="req">*</span></label>
                      <input id="suName" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                    <div className="field"><label htmlFor="suTel">연락처 <span className="req">*</span></label>
                      <input id="suTel" required placeholder="010-0000-0000" autoComplete="tel" value={tel} onChange={(e) => setTel(e.target.value)} /></div>
                  </div>
                  <div className="field"><label htmlFor="suEmail">이메일 <span className="req">*</span></label>
                    <input id="suEmail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <p className="hint" id="suEmailHint">로그인 아이디로 사용됩니다.</p></div>
                  <div className="field"><label htmlFor="suPw">비밀번호 <span className="req">*</span></label>
                    <input id="suPw" type="password" required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
                    <div className="pw-rules" id="suRules">
                      {PW_RULE_LABELS.map(([rule, label]) => (
                        <span key={rule} className={pw && PW_RULES[rule](pw) ? 'ok' : undefined}>{label}</span>
                      ))}
                    </div></div>
                  <div className="field"><label htmlFor="suPw2">비밀번호 확인 <span className="req">*</span></label>
                    <input id="suPw2" type="password" required autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
                    <p className={`hint ${pw2Same ? 'ok' : 'err'}`} id="suPw2Hint">
                      {pw2 ? (pw2Same ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.') : ''}
                    </p></div>
                  <div className={`form-msg${msg2 ? ` show ${msg2.type}` : ''}`} id="suMsg2">{msg2?.text}</div>
                  <button type="submit" className="btn btn-primary" disabled={busy}>가입 완료</button>
                </form>
              </div>
            )}

            {step === 3 && (
              <div id="suStep3" style={{ textAlign: 'center', padding: '20px 0' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2E7D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}><circle cx="12" cy="12" r="10" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--c-900)', marginBottom: 8 }}>가입이 완료되었습니다</h2>
                <p style={{ fontSize: 17.5, color: 'var(--ink-muted)', marginBottom: 22 }}>자동 로그인되었습니다. 마이페이지에서 정보를 관리할 수 있습니다.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link className="btn btn-primary" href="/mypage">마이페이지</Link>
                  <Link className="btn btn-outline" href="/">홈으로</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
