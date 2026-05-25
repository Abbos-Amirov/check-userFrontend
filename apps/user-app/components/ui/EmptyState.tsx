interface EmptyStateProps {
  title: string
  description?: string
  emoji?: string
}

export default function EmptyState({
  title,
  description,
  emoji = '📭',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="mb-3 text-4xl">{emoji}</span>
      <p className="font-display text-base font-semibold text-primary">{title}</p>
      {description && (
        <p className="mt-1 max-w-[240px] text-body-sm text-text-tertiary">{description}</p>
      )}
    </div>
  )
}
