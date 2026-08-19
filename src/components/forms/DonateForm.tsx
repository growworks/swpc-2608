'use client'

import { useEffect, useState } from 'react'
import { PolicyModal } from '@/components/ui/PolicyModal'
import { errorMessage } from '@/lib/api/client'
import { CONTACT_MAX, submitContact } from '@/lib/api/contact'
import { formatPhone } from '@/lib/api/members'
import { getCachedMember, getToken } from '@/lib/auth'

/** 후원 유형별 안내 문구 (데모 동일) */
const DON_KIND_HINT: Record<string, string> = {
  재능기부: '예) 분야·활동 가능 시간 (사진·영상·강의·통번역 등)',
  물품: '예) 물품명·수량·상태 (교육기자재, 도서, 스포츠용품 등)',
  부동산: '예) 소재지·종류·면적 (기부 방식은 담당자와 협의합니다)',
}

const AMOUNTS: [string, string][] = [
  ['10000', '1만원'],
  ['30000', '3만원'],
  ['50000', '5만원'],
  ['100000', '10만원'],
  ['etc', '직접 입력'],
]

const TYPES = ['정기 후원', '일시 후원', '재능기부', '물품', '부동산']

export function DonateForm() {
  const [donType, setDonType] = useState('')
  const [amt, setAmt] = useState('30000')
  const [amtEtc, setAmtEtc] = useState('')
  const [depositor, setDepositor] = useState('')
  const [kind, setKind] = useState('')
  const [name, setName] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [agree1, setAgree1] = useState(false)
  const [agree2, setAgree2] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [autofilled, setAutofilled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const isCash = donType === '정기 후원' || donType === '일시 후원'

  /* 회원 정보 자동입력 (데모 applyAutofill) */
  const applyAutofill = () => {
    const m = getCachedMember()
    if (!m) return
    setName((v) => v || m.name)
    /* 서버는 E.164 로만 돌려주므로 화면 표기는 역포맷한다 */
    setTel((v) => v || formatPhone(m.phone))
    setEmail((v) => v || m.email)
    setAutofilled(true)
  }
  /* localStorage 세션은 마운트 후에만 접근 가능 */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    applyAutofill()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    /* contact API 에 레이트리밋이 없어 중복 접수 차단은 프론트 책임 */
    if (submitting || done) return

    if (!donType) {
      setMsg({ type: 'err', text: '후원 유형을 선택해 주세요.' })
      return
    }
    if (!name.trim() || !tel.trim() || !email.trim()) {
      setMsg({ type: 'err', text: '이름·연락처·이메일을 모두 입력해 주세요.' })
      return
    }
    /* 서버가 name 2자 미만을 400 VALIDATION 으로 거절한다 */
    if (name.trim().length < 2) {
      setMsg({ type: 'err', text: '이름(단체명)은 2자 이상 입력해 주세요.' })
      return
    }
    if (!agree1) {
      setMsg({ type: 'err', text: '개인정보 수집·이용(필수)에 동의해 주세요.' })
      return
    }
    let amtLabel = ''
    let dep = ''
    let kindV = ''
    if (isCash) {
      let a = amt
      if (a === 'etc') {
        a = amtEtc.replace(/[^\d]/g, '')
        if (!a) {
          setMsg({ type: 'err', text: '후원 금액을 입력해 주세요.' })
          return
        }
      }
      if (!a) {
        setMsg({ type: 'err', text: '후원 금액을 선택해 주세요.' })
        return
      }
      dep = depositor.trim()
      if (!dep) {
        setMsg({ type: 'err', text: '입금자명을 입력해 주세요.' })
        return
      }
      amtLabel = Number(a).toLocaleString() + '원'
    } else {
      kindV = kind.trim()
      if (!kindV) {
        setMsg({ type: 'err', text: '후원 내용을 입력해 주세요.' })
        return
      }
    }

    /* contact 에는 이메일·입금자명·수신동의 전용 컬럼이 없어
       contactMethod / message 에 담아 보낸다 */
    const message = [
      isCash ? `입금자명: ${dep}` : `후원 내용: ${kindV}`,
      `기부금 영수증 발급 안내 수신: ${agree2 ? '동의' : '미동의'}`,
    ].join('\n')

    setSubmitting(true)
    setMsg(null)
    /* 로그인 상태면 토큰을 함께 보내 신청을 회원에 연결한다 → 마이페이지에서 조회 가능 */
    const token = getToken()
    try {
      await submitContact(
        {
          name: name.trim(),
          phone: tel.trim(),
          serviceType: donType,
          budget: isCash ? amtLabel : null,
          /* 서버가 길이를 검사하지 않아 초과 시 500 — slice 로 상한을 강제한다 */
          contactMethod: `email: ${email.trim()}`.slice(0, CONTACT_MAX.contactMethod),
          message,
        },
        token,
      )
    } catch (err) {
      setSubmitting(false)
      setMsg({
        type: 'err',
        text: errorMessage(err, '후원 신청을 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.'),
      })
      return
    }

    setSubmitting(false)
    setDone(true)
    /* 응답에 접수 id 가 없어 접수번호는 표시할 수 없다 */
    setMsg({
      type: 'ok',
      text: token
        ? '후원 신청이 접수되었습니다. 마이페이지의 후원 신청 내역에서 확인할 수 있습니다.'
        : '후원 신청이 접수되었습니다. 담당자 확인 후 연락드립니다.',
    })

    /* 폼 리셋 후 회원 정보 재적용 (데모 동일) */
    setDonType('')
    setAmt('30000')
    setAmtEtc('')
    setDepositor('')
    setKind('')
    setName('')
    setTel('')
    setEmail('')
    setAgree1(false)
    setAgree2(false)
    applyAutofill()
  }

  return (
    <>
      <div className={`autofill-banner${autofilled ? ' show' : ''}`} id="donAutofillBanner">
        회원 정보로 이름·이메일·연락처가 자동 입력되었습니다.
      </div>
      <form className="form" id="donForm" noValidate style={{ marginTop: 16 }} onSubmit={submit}>
        <div className="field">
          <label>후원 유형 <span className="req">*</span></label>
          <div className="chips">
            {TYPES.map((t, i) => (
              <span key={t} style={{ display: 'contents' }}>
                <input
                  type="radio"
                  name="donType"
                  id={`dnT${i + 1}`}
                  value={t}
                  checked={donType === t}
                  onChange={() => setDonType(t)}
                />
                <label htmlFor={`dnT${i + 1}`}>{t}</label>
              </span>
            ))}
          </div>
          <p className="hint">정기·일시 후원은 계좌 입금, 재능기부·물품·부동산은 담당자 상담 후 진행됩니다.</p>
        </div>

        {isCash && (
          <div id="donCashFields" style={{ display: 'grid', gap: 18 }}>
            <div className="field">
              <label>후원 금액 <span className="req">*</span></label>
              <div className="chips">
                {AMOUNTS.map(([v, label], i) => (
                  <span key={v} style={{ display: 'contents' }}>
                    <input
                      type="radio"
                      name="donAmt"
                      id={`dnA${i + 1}`}
                      value={v}
                      checked={amt === v}
                      onChange={() => setAmt(v)}
                    />
                    <label htmlFor={`dnA${i + 1}`}>{label}</label>
                  </span>
                ))}
              </div>
              {amt === 'etc' && (
                <input
                  id="donAmtEtc"
                  inputMode="numeric"
                  placeholder="금액을 입력해 주세요 (원)"
                  style={{ marginTop: 10 }}
                  value={amtEtc}
                  onChange={(e) => setAmtEtc(e.target.value)}
                />
              )}
            </div>
            <div className="field">
              <label htmlFor="dnDepositor">입금자명 <span className="req">*</span></label>
              <input id="dnDepositor" placeholder="입금 시 표시되는 이름" value={depositor} onChange={(e) => setDepositor(e.target.value)} />
              <p className="hint">입금자명이 다르면 확인이 지연될 수 있습니다.</p>
            </div>
          </div>
        )}

        {donType && !isCash && (
          <div className="field" id="donKindField">
            <label htmlFor="dnKind">후원 내용 <span className="req">*</span></label>
            <textarea
              id="dnKind"
              rows={4}
              placeholder={DON_KIND_HINT[donType] || '후원하실 내용을 알려 주세요.'}
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            />
            <p className="hint" id="dnKindHint">{DON_KIND_HINT[donType] || ''}</p>
          </div>
        )}

        <div className="form-grid2">
          <div className="field"><label htmlFor="dnName">이름(단체명) <span className="req">*</span></label>
            <input id="dnName" required autoComplete="name" maxLength={CONTACT_MAX.name} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label htmlFor="dnTel">연락처 <span className="req">*</span></label>
            <input id="dnTel" required placeholder="010-0000-0000" autoComplete="tel" maxLength={CONTACT_MAX.phone} value={tel} onChange={(e) => setTel(e.target.value)} /></div>
        </div>
        <div className="field"><label htmlFor="dnEmail">이메일 <span className="req">*</span></label>
          <input id="dnEmail" type="email" required autoComplete="email" maxLength={90} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div>
          {/* 체크 문장과 수집 내역을 분리한다 — 한 줄로 이어 붙이면 좁은 폭에서 줄바꿈이 어색하다 */}
          <div className="agree-line">
            <input type="checkbox" id="dnAgree1" checked={agree1} onChange={(e) => setAgree1(e.target.checked)} />
            <div className="agree-text">
              <label htmlFor="dnAgree1">개인정보 수집·이용에 동의합니다. <span className="req-tag">(필수)</span></label>
              <p className="agree-sub">수집 항목 이름·연락처·이메일(현금 후원 시 입금자명) · 목적 후원 접수·확인 및 영수증 안내 · 보유 관계 법령에 따른 기간</p>
            </div>
            <PolicyModal kind="privacy" className="agree-more" href="/privacy" label="전문 보기" title="개인정보처리방침" />
          </div>
          <div className="agree-line">
            <input type="checkbox" id="dnAgree2" checked={agree2} onChange={(e) => setAgree2(e.target.checked)} />
            <label htmlFor="dnAgree2">기부금 영수증 발급 안내 수신에 동의합니다. <span className="opt-tag">(선택)</span></label>
          </div>
        </div>
        <div className={`form-msg${msg ? ` show ${msg.type}` : ''}`} id="donFormMsg">{msg?.text}</div>
        <button type="submit" className="btn btn-accent" disabled={submitting || done}>후원 신청 제출</button>
      </form>
    </>
  )
}
