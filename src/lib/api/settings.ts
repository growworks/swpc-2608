import { apiFetch } from '@/lib/api/client'
import { LIST_REVALIDATE } from '@/lib/constants'
import { ACCOUNT, BIZ_INFO, CONTACT, ORG_NAME } from '@/lib/site'

/**
 * 공개 사이트 설정 (푸터 연락처·사업자 표기·후원 계좌).
 *
 * **설정된 키만 응답에 포함된다.** 값을 넣지 않은 키는 아예 없으므로 폴백이 필수다.
 * 2026-08 기준 cwc 는 어드민에 값이 입력되지 않아 `{}` 가 내려온다 →
 * 아래 폴백(데모에서 확정된 값)이 그대로 화면에 쓰인다.
 * 어드민에 값이 채워지면 자동으로 API 값이 우선한다.
 */
export interface SiteSettings {
  companyName: string
  ceoName: string
  businessNumber: string
  address: string
  phone: string
  email: string
  supportHours: string
  bankName: string
  accountNumber: string
  accountHolder: string
}

const FALLBACK: SiteSettings = {
  companyName: ORG_NAME,
  ceoName: BIZ_INFO.chairman,
  businessNumber: BIZ_INFO.bizNo,
  address: CONTACT.address,
  phone: CONTACT.tel,
  email: CONTACT.email,
  supportHours: CONTACT.hours,
  bankName: ACCOUNT.bank,
  accountNumber: ACCOUNT.number,
  accountHolder: ACCOUNT.holder,
}

/**
 * 설정 조회. 네트워크·서버 오류로 푸터가 깨지면 안 되므로
 * 실패 시에도 예외를 던지지 않고 폴백을 반환한다.
 */
export async function getSettings(): Promise<SiteSettings> {
  let raw: Record<string, string> = {}
  try {
    raw = await apiFetch<Record<string, string>>('/settings', {
      next: { revalidate: LIST_REVALIDATE, tags: ['settings'] },
    })
  } catch {
    return FALLBACK
  }

  const pick = (key: keyof SiteSettings): string => {
    const v = raw?.[key]
    return typeof v === 'string' && v.trim() ? v.trim() : FALLBACK[key]
  }

  return {
    companyName: pick('companyName'),
    ceoName: pick('ceoName'),
    businessNumber: pick('businessNumber'),
    address: pick('address'),
    phone: pick('phone'),
    email: pick('email'),
    supportHours: pick('supportHours'),
    bankName: pick('bankName'),
    accountNumber: pick('accountNumber'),
    accountHolder: pick('accountHolder'),
  }
}
