import type { Metadata } from 'next'
import { ResetPasswordClient } from '@/components/auth/ResetPasswordClient'

export const metadata: Metadata = {
  title: '비밀번호 재설정',
  description: '학교복지진흥사회적협동조합 비밀번호 재설정.',
  robots: { index: false },
  alternates: { canonical: '/reset-password' },
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
