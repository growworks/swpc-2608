import type { Metadata } from 'next'
import { SignupClient } from '@/components/auth/SignupClient'

export const metadata: Metadata = {
  title: '회원가입',
  description: '학교복지진흥사회적협동조합 이메일 회원가입.',
  robots: { index: false },
  alternates: { canonical: '/signup' },
}

export default function SignupPage() {
  return <SignupClient />
}
