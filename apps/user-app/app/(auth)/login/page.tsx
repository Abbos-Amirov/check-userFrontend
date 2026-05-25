import LoginForm from '@/components/auth/LoginForm'
import { getTranslator } from '@/lib/i18n/server'

export default async function LoginPage() {
  const t = getTranslator()
  return (
    <>
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-10">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <span className="font-display text-2xl font-bold text-white">Z</span>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-primary">
            {t('auth.loginTitle')}
          </h1>
          <p className="mt-2 text-body-sm text-text-secondary">{t('auth.loginSubtitle')}</p>
        </div>
        <LoginForm />
      </div>
    </>
  )
}
