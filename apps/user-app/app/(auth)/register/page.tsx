import RegisterForm from '@/components/auth/RegisterForm'
import { getTranslator } from '@/lib/i18n/server'

export default async function RegisterPage() {
  const t = getTranslator()
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-primary">
          {t('auth.registerTitle')}
        </h1>
        <p className="mt-2 text-body-sm text-text-secondary">{t('auth.registerSubtitle')}</p>
      </div>
      <RegisterForm />
    </div>
  )
}
