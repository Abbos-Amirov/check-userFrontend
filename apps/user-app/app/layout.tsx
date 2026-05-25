import type { Metadata } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/components/i18n/I18nProvider'
import AppTopActions from '@/components/ui/AppTopActions'
import { getDictionary, getLocale } from '@/lib/i18n/server'
import { THEME_INIT_SCRIPT } from '@/lib/theme'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale()
  const dict = getDictionary(locale)
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = getLocale()
  const dictionary = getDictionary(locale)

  return (
    <html lang={locale === 'ko' ? 'ko' : 'uz'} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${syne.variable} ${dmSans.variable} font-body min-h-screen bg-bg text-text-primary antialiased transition-colors duration-300`}
      >
        <I18nProvider locale={locale} dictionary={dictionary}>
          <div className="app-shell relative mx-auto min-h-screen w-full max-w-mobile">
            <div className="pointer-events-none fixed left-1/2 top-3 z-[90] flex w-full max-w-mobile -translate-x-1/2 justify-end px-5">
              <div className="pointer-events-auto">
                <AppTopActions />
              </div>
            </div>
            <div className="pt-12">{children}</div>
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
