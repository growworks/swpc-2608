import type { Metadata } from 'next'
import { LoginClient } from '@/components/auth/LoginClient'

export const metadata: Metadata = {
  title: '로그인',
  description: '학교복지진흥사회적협동조합 회원 로그인.',
  robots: { index: false },
  alternates: { canonical: '/login' },
}

export default function LoginPage() {
  return <LoginClient />
}
