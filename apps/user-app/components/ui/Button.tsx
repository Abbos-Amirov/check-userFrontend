'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useI18nOptional } from '@/components/i18n/I18nProvider'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:opacity-95 active:scale-[0.98] disabled:opacity-50 dark:text-zinc-950',
  secondary:
    'border-2 border-primary text-primary bg-transparent active:scale-[0.98] disabled:opacity-50',
  accent:
    'bg-accent text-white active:scale-[0.98] disabled:opacity-50',
  ghost:
    'border border-border text-text-secondary bg-transparent active:bg-surface-2',
  danger:
    'bg-danger text-white active:scale-[0.98] disabled:opacity-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm rounded-xl',
  md: 'h-14 px-6 text-[15px] rounded-2xl',
  lg: 'h-14 px-6 text-[15px] rounded-2xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  loading,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const i18n = useI18nOptional()
  const loadingLabel = i18n?.t('common.loading') ?? '...'

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex w-full items-center justify-center gap-2 font-body font-medium tracking-wide transition-all ${variants[variant]} ${sizes[size]} ${className}`}
      type={type}
    >
      {loading ? loadingLabel : children}
    </button>
  )
}
