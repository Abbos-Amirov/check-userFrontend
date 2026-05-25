import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  interactive?: boolean
}

export default function Card({
  children,
  interactive,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-border bg-surface p-4 shadow-card ${
        interactive ? 'cursor-pointer transition-transform active:scale-[0.98]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
