'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { errorMessage, isAccountRestricted, isAuthExpired } from '@/lib/api/client'
import { CONTACT_STATUS_LABEL, getMyContacts, type MyContact } from '@/lib/api/contact'
import {
  changePassword,
  formatPhone,
  getMe,
  recordConsent,
  updateMe,
  type PublicMember,
} from '@/lib/api/members'
import { formatPostDate } from '@/lib/api/posts'
import { clearSession, getCachedMember, getToken, pwOk, setLoginDest, updateCachedMember } from '@/lib/auth'
import { showToast } from '@/lib/toast'

type Msg = { type: 'ok' | 'err'; text: string } | null

/** 기부금 영수증은 여전히 v1 범위 밖(서버에 리소스 없음) — 조회 API 신설 시 교체 */
const RECEIPT_COUNT: number = 0

/** 목록의 금액·내용 열 — budget(현금) 우선, 없으면 message 첫 줄(재능기부 등) 요약 */
function contactSummary(c: MyContact): string {
  if (c.budget) return c.budget
  const first = (c.message || '').split('\n')[0].replace(/^후원 내용:\s*/, '').replace(/^입금자명:\s*/, '')
  if (!first) return '-'
  return first.length > 24 ? first.slice(0, 24) + '…' : first
}

export function MypageClient() {
  const router = useRouter()
  const [member, setMember] = useState<PublicMember | null>(null)
  const [ready, setReady] = useState(false)
  const [fatal, setFatal] = useState<string | null>(null)
  const [meName, setMeName] = useState('')
  const [meTel, setMeTel] = useState('')
  const [meCurPw, setMeCurPw] = useState('')
  const [meNewPw, setMeNewPw] = useState('')
  const [editMsg, setEditMsg] = useState<Msg>(null)
  const [busy, setBusy] = useState(false)
  /* 어드민 수동 등록 계정(consentRequired=true)의 동의 보완용 */
  const [cTerms, setCTerms] = useState(false)
  const [cPrivacy, setCPrivacy] = useState(false)
  const [cMarketing, setCMarketing] = useState(false)
  const [consentMsg, setConsentMsg] = useState<Msg>(null)
  const [consentBusy, setConsentBusy] = useState(false)
  /* 후원 신청 내역 (GET /my/contacts — 로그인 상태로 낸 신청만 연결됨) */
  const [contacts, setContacts] = useState<MyContact[]>([])
  const [contactsTotal, setContactsTotal] = useState(0)
  const [contactsErr, setContactsErr] = useState<string | null>(null)

  /* 로그인 가드 + 최신 회원 정보 로드 — 토큰은 localStorage 라 마운트 후에만 접근 가능 */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoginDest('/mypage')
      showToast('마이페이지는 로그인 후 이용할 수 있습니다.')
      router.replace('/login')
      return
    }

    /* 초기 깜빡임을 줄이기 위해 캐시를 먼저 그린다 (진실 소스는 GET /members/me) */
    const cached = getCachedMember()
    if (cached) {
      setMember(cached)
      setMeName(cached.name)
      setMeTel(formatPhone(cached.phone))
      setReady(true)
    }

    let alive = true

    /* 후원 신청 내역 — 실패해도 회원 정보 화면은 유지한다 (섹션 안에 오류만 표시) */
    getMyContacts(token)
      .then((list) => {
        if (!alive) return
        setContacts(list.items)
        setContactsTotal(list.total)
      })
      .catch((err) => {
        if (!alive) return
        if (isAuthExpired(err) || isAccountRestricted(err)) return /* getMe 쪽에서 일괄 처리 */
        setContactsErr(errorMessage(err, '후원 신청 내역을 불러오지 못했습니다.'))
      })

    getMe(token)
      .then((m) => {
        if (!alive) return
        setMember(m)
        setMeName(m.name)
        setMeTel(formatPhone(m.phone))
        updateCachedMember(m)
        setReady(true)
      })
      .catch((err) => {
        if (!alive) return
        /* 이용 제한 계정은 재로그인을 유도하면 안 되므로 안내만 남기고 세션을 비운다 */
        if (isAccountRestricted(err)) {
          clearSession()
          setMember(null)
          setFatal(errorMessage(err))
          setReady(true)
          return
        }
        if (isAuthExpired(err)) {
          clearSession()
          setLoginDest('/mypage')
          showToast('로그인이 만료되었습니다. 다시 로그인해 주세요.')
          router.replace('/login')
          return
        }
        if (!cached) {
          setFatal(errorMessage(err))
          setReady(true)
          return
        }
        setEditMsg({ type: 'err', text: errorMessage(err) })
      })

    return () => {
      alive = false
    }
  }, [router])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!ready) return null

  if (fatal || !member) {
    return (
      <div className="page active" id="pg-mypage">
        <section className="sub-section">
          <div className="container">
            <div className="sec-head"><h2>마이페이지</h2></div>
            <div className="my-sec">
              <div className="form-msg show err">{fatal ?? '회원 정보를 불러오지 못했습니다.'}</div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const logout = () => {
    clearSession()
    showToast('로그아웃되었습니다.')
    router.push('/')
  }

  const handleAuthError = (err: unknown): boolean => {
    if (isAccountRestricted(err)) {
      clearSession()
      setFatal(errorMessage(err))
      return true
    }
    if (isAuthExpired(err)) {
      clearSession()
      setLoginDest('/mypage')
      showToast('로그인이 만료되었습니다. 다시 로그인해 주세요.')
      router.replace('/login')
      return true
    }
    return false
  }

  /**
   * 동의 보완 — 공개 가입 계정은 가입 시 동의가 기록되지만,
   * 운영자가 어드민에서 수동 등록한 계정은 동의 없이 생성돼 여기서만 서버에 남길 수 있다.
   */
  const submitConsent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (consentBusy) return
    const token = getToken()
    if (!token) {
      clearSession()
      setLoginDest('/mypage')
      router.replace('/login')
      return
    }
    if (!cTerms || !cPrivacy) {
      setConsentMsg({ type: 'err', text: '필수 약관에 모두 동의해 주세요.' })
      return
    }
    setConsentBusy(true)
    setConsentMsg(null)
    try {
      const updated = await recordConsent(token, {
        termsAgreed: true,
        privacyAgreed: true,
        marketingAgreed: cMarketing,
      })
      setMember(updated)
      updateCachedMember(updated)
      showToast('약관 동의가 기록되었습니다.')
    } catch (err) {
      if (handleAuthError(err)) return
      setConsentMsg({ type: 'err', text: errorMessage(err) })
    } finally {
      setConsentBusy(false)
    }
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    const token = getToken()
    if (!token) {
      clearSession()
      setLoginDest('/mypage')
      router.replace('/login')
      return
    }
    if (!meName.trim()) {
      setEditMsg({ type: 'err', text: '이름을 입력해 주세요.' })
      return
    }
    /* 비밀번호 변경은 서버가 현재 비밀번호를 요구한다 (POST /members/password) */
    if (meNewPw && !meCurPw) {
      setEditMsg({ type: 'err', text: '현재 비밀번호를 입력해 주세요.' })
      return
    }
    if (meNewPw && !pwOk(meNewPw)) {
      setEditMsg({ type: 'err', text: '새 비밀번호 규칙(8자+영문/숫자/특수문자)을 확인해 주세요.' })
      return
    }

    setBusy(true)
    setEditMsg(null)
    let profileSaved = false
    try {
      const updated = await updateMe(token, { name: meName.trim(), phone: meTel.trim() || null })
      profileSaved = true
      setMember(updated)
      setMeName(updated.name)
      setMeTel(formatPhone(updated.phone))
      updateCachedMember(updated)
      if (meNewPw) {
        await changePassword(token, meCurPw, meNewPw)
        /* 비밀번호 변경 시 기존 토큰이 전부 무효화된다(다른 기기 포함) —
           본인 세션도 다음 요청부터 401 이므로 곧바로 재로그인시킨다(명세 지시) */
        clearSession()
        setLoginDest('/mypage')
        showToast('비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.')
        router.replace('/login')
        return
      }
      setEditMsg({ type: 'ok', text: '회원 정보가 저장되었습니다.' })
    } catch (err) {
      if (handleAuthError(err)) return
      setEditMsg({
        type: 'err',
        text: profileSaved
          ? `회원 정보는 저장되었습니다. 비밀번호 변경에 실패했습니다: ${errorMessage(err)}`
          : errorMessage(err),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page active" id="pg-mypage">
      <section className="sub-section">
        <div className="container">
          <div className="sec-head"><h2>마이페이지</h2></div>
          <div className="my-grid">
            <aside className="profile-card">
              <div className="avatar" id="myAvatar">{member.name.charAt(0)}</div>
              <div className="p-name" id="myName">{member.name}</div>
              <div className="p-mail" id="myEmail">{member.email}</div>
              <div className="p-grade"><span className="pill pill-line" id="myGrade">{contactsTotal ? '후원 회원' : '일반 회원'}</span></div>
              <div className="p-stats">
                <div><b id="myDonCnt">{contactsTotal}</b><span>후원 신청</span></div>
                <div><b id="myRcpCnt">{RECEIPT_COUNT}</b><span>영수증 신청</span></div>
              </div>
              <button className="btn btn-outline btn-sm" id="btnLogoutMy" style={{ marginTop: 20, width: '100%' }} onClick={logout}>로그아웃</button>
            </aside>
            <div>
              {member.consentRequired && (
                <div className="my-sec">
                  <h2>약관 동의 확인</h2>
                  <div className="notice-box" style={{ marginBottom: 16 }}>
                    <strong>안내</strong> · 회원 정보에 약관 동의 기록이 없습니다. 서비스 이용을 위해 아래 항목에 동의해 주세요.
                  </div>
                  <form className="form" id="myConsentForm" noValidate onSubmit={submitConsent}>
                    <div>
                      <div className="agree-line">
                        <input type="checkbox" id="cnTerms" checked={cTerms} onChange={(e) => setCTerms(e.target.checked)} />
                        <label htmlFor="cnTerms">이용약관 동의 <span className="req-tag">(필수)</span></label>
                      </div>
                      <div className="agree-line">
                        <input type="checkbox" id="cnPrivacy" checked={cPrivacy} onChange={(e) => setCPrivacy(e.target.checked)} />
                        <label htmlFor="cnPrivacy">개인정보 수집·이용 동의 <span className="req-tag">(필수)</span> · 수집 항목: 이름·이메일·연락처</label>
                      </div>
                      <div className="agree-line">
                        <input type="checkbox" id="cnMarketing" checked={cMarketing} onChange={(e) => setCMarketing(e.target.checked)} />
                        <label htmlFor="cnMarketing">소식·프로그램 안내 수신 동의 <span className="opt-tag">(선택)</span></label>
                      </div>
                    </div>
                    <div className={`form-msg${consentMsg ? ` show ${consentMsg.type}` : ''}`}>{consentMsg?.text}</div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={consentBusy}>동의 저장</button>
                  </form>
                </div>
              )}
              <div className="my-sec">
                <h2>후원 신청 내역</h2>
                <div id="myDons">
                  {contactsErr ? (
                    <div className="form-msg show err">{contactsErr}</div>
                  ) : contacts.length ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="board-table">
                        <thead><tr><th>번호</th><th>유형</th><th>금액·내용</th><th>신청일</th><th>상태</th></tr></thead>
                        <tbody>
                          {contacts.map((c) => {
                            const st = CONTACT_STATUS_LABEL[c.status] ?? { label: c.status, pill: 'pill-line' }
                            return (
                              <tr key={c.id} style={{ cursor: 'default' }}>
                                <td>{c.id}</td>
                                <td>{c.serviceType || '-'}</td>
                                <td>{contactSummary(c)}</td>
                                <td>{formatPostDate(c.createdAt)}</td>
                                <td><span className={`pill ${st.pill}`}>{st.label}</span></td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-note">후원 신청 내역이 없습니다. <Link href="/donate#donate-apply" style={{ color: 'var(--c-700)', fontWeight: 700 }}>후원 신청하기 →</Link></div>
                  )}
                  {/* 로그인 상태로 낸 신청만 회원에 연결된다 (비로그인 신청은 미포함) */}
                  <p className="hint" style={{ marginTop: 10 }}>로그인 상태에서 제출한 신청만 표시됩니다. 비로그인 신청 내역은 042-931-1479로 문의해 주세요.</p>
                </div>
              </div>
              <div className="my-sec">
                <h2>기부금 영수증 발급 내역</h2>
                <div id="myRcps">
                  <div className="empty-note">기부금 영수증 발급 내역 조회 기능은 준비 중입니다. 영수증 발급은 042-931-1479로 문의해 주세요.</div>
                </div>
                <div className="notice-box" style={{ marginTop: 16 }}>
                  <strong>안내</strong> · 영수증은 국세청 홈택스 전자기부금영수증으로 발급되며, 기부자가 홈택스에서 직접 신청합니다. 신청 절차는 후원안내 페이지에서 확인하실 수 있습니다. 문의 042-931-1479
                </div>
              </div>
              <div className="my-sec">
                <h2>회원 정보 수정</h2>
                <form className="form" id="myEditForm" noValidate onSubmit={saveEdit}>
                  <div className="form-grid2">
                    <div className="field"><label htmlFor="meName">이름</label>
                      <input id="meName" value={meName} onChange={(e) => setMeName(e.target.value)} /></div>
                    <div className="field"><label htmlFor="meTel">연락처</label>
                      <input id="meTel" value={meTel} onChange={(e) => setMeTel(e.target.value)} /></div>
                  </div>
                  <div className="field"><label htmlFor="meCurPw">현재 비밀번호 (비밀번호 변경 시에만 입력)</label>
                    <input id="meCurPw" type="password" autoComplete="current-password" value={meCurPw} onChange={(e) => setMeCurPw(e.target.value)} /></div>
                  <div className="field"><label htmlFor="mePw">새 비밀번호 (변경 시에만 입력)</label>
                    <input id="mePw" type="password" autoComplete="new-password" value={meNewPw} onChange={(e) => setMeNewPw(e.target.value)} />
                    <p className="hint">8자 이상, 영문/숫자/특수문자 포함</p></div>
                  <div className={`form-msg${editMsg ? ` show ${editMsg.type}` : ''}`} id="myEditMsg">{editMsg?.text}</div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>저장</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
