import type { Metadata } from 'next'
import { MypageClient } from '@/components/auth/MypageClient'

export const metadata: Metadata = {
  title: '마이페이지',
  description: '회원 정보와 후원 신청 내역을 관리하는 마이페이지.',
  robots: { index: false },
  alternates: { canonical: '/mypage' },
}

export default function MypagePage() {
  return <MypageClient />
}
