import { Shell } from '@/components/layout/Shell'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBar } from '@/components/layout/MobileBar'
import { ClientEffects } from '@/components/layout/ClientEffects'
import { Lightbox } from '@/components/layout/Lightbox'
import { Toast } from '@/components/layout/Toast'
import { JsonLd } from '@/components/seo/JsonLd'
import { getSettings } from '@/lib/api/settings'
import { organizationLd, websiteLd } from '@/lib/seo'

export default async function SchoolLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings()

  return (
    <Shell>
      <JsonLd data={[organizationLd(settings), websiteLd()]} />
      <Header />
      <main>{children}</main>
      <Footer />
      <MobileBar />
      <Lightbox />
      <Toast />
      <ClientEffects />
    </Shell>
  )
}
