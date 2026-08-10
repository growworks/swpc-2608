import Link from 'next/link'
import { getSettings } from '@/lib/api/settings'
import { BIZ_INFO, NEWS_SITE_URL } from '@/lib/site'

const EXT_ARROW = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
)

export async function Footer() {
  const settings = await getSettings()

  /* 데모는 주소를 괄호 앞에서 줄바꿈한다(.fbr). settings.address 는 한 줄 문자열이라 괄호에서 나눈다 */
  const parenAt = settings.address.indexOf(' (')
  const addrHead = parenAt > 0 ? settings.address.slice(0, parenAt) : settings.address
  const addrTail = parenAt > 0 ? settings.address.slice(parenAt + 1) : ''

  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-info">
            <div className="foot-org">
              <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="19" fill="#fff" opacity=".12" />
                <path d="M20 9 L31 15 L20 21 L9 15 Z" fill="#fff" />
                <path d="M13 19.5 V25 C13 27.5 16 29.5 20 29.5 C24 29.5 27 27.5 27 25 V19.5" fill="none" stroke="#9CC4E8" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="31" y1="15" x2="31" y2="23" stroke="#DD8A1E" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <strong>{settings.companyName}</strong>
            </div>
            <dl className="foot-dl">
              <div><dt>이사장</dt><dd>{settings.ceoName}</dd></div>
              {/* 설립인가·발행 매체는 settings 에 대응 항목이 없어 상수를 유지한다 */}
              <div><dt>설립인가</dt><dd>{BIZ_INFO.approval}</dd></div>
              <div><dt>사업자등록번호</dt><dd>{settings.businessNumber}</dd></div>
              <div><dt>주소</dt><dd>{addrHead}{addrTail && (<><br className="fbr" />{addrTail}</>)}</dd></div>
              <div><dt>대표전화</dt><dd><a href={`tel:${settings.phone}`}>{settings.phone}</a></dd></div>
              <div><dt>이메일</dt><dd><a href={`mailto:${settings.email}`}>{settings.email}</a></dd></div>
              <div><dt>발행 매체</dt><dd><a href={NEWS_SITE_URL} target="_blank" rel="noopener">CWC교원투데이</a> (등록 대전 아00480)</dd></div>
            </dl>
          </div>
          <div className="foot-right">
            <h3>관계기관</h3>
            <div className="foot-links">
              <a href="https://www.nts.go.kr" target="_blank" rel="noopener">국세청{EXT_ARROW}</a>
              <a href="https://www.acrc.go.kr" target="_blank" rel="noopener">국민권익위원회{EXT_ARROW}</a>
              <a href="https://www.moe.go.kr" target="_blank" rel="noopener">교육부{EXT_ARROW}</a>
              <a href="https://www.coop.go.kr" target="_blank" rel="noopener">협동조합 포털{EXT_ARROW}</a>
              <a href="https://www.hometax.go.kr" target="_blank" rel="noopener">국세청 홈택스{EXT_ARROW}</a>
            </div>
          </div>
        </div>
        <div className="foot-policy">
          <Link className="privacy" href="/privacy">개인정보처리방침</Link>
          <Link href="/terms">이용약관</Link>
          <span>개인정보 최소 수집 원칙을 지킵니다.</span>
        </div>
        <p className="foot-copy">© 2026 School Welfare Promotion Social Cooperative. All rights reserved.</p>
      </div>
    </footer>
  )
}
