'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import {
  normalizeNotificationsResponse,
  type AppNotification,
} from '@/lib/notifications'

const POLL_MS = 45_000

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function formatWhen(iso: string, locale: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(locale === 'ko' ? 'ko-KR' : 'uz-UZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function badgeLabel(count: number): string {
  if (count > 99) return '99+'
  return String(count)
}

export default function NotificationBell() {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/my?page=1&limit=20', {
        cache: 'no-store',
      })
      if (res.status === 401) return
      if (!res.ok) return
      const data = await res.json()
      const parsed = normalizeNotificationsResponse(data)
      setNotifications(parsed.notifications)
      setUnreadCount(parsed.unreadCount)
    } catch {
      /* tarmoq xatosi — jim */
    }
  }, [])

  useEffect(() => {
    void fetchNotifications()
    const timer = setInterval(() => void fetchNotifications(), POLL_MS)
    return () => clearInterval(timer)
  }, [fetchNotifications])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    void fetchNotifications().finally(() => setLoading(false))
  }, [open, fetchNotifications])

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
        setExpandedId(null)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setExpandedId(null)
      }
    }
    document.addEventListener('click', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  async function markRead(notification: AppNotification) {
    if (notification.read) return

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))

    try {
      await fetch(`/api/notifications/${encodeURIComponent(notification.id)}/read`, {
        method: 'PATCH',
      })
    } catch {
      /* keyingi poll tiklaydi */
    }
  }

  async function handleItemClick(notification: AppNotification) {
    const nextExpanded = expandedId === notification.id ? null : notification.id
    setExpandedId(nextExpanded)
    if (nextExpanded) await markRead(notification)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm transition-colors hover:bg-surface-2 active:scale-95"
        aria-label={t('notifications.title')}
        aria-expanded={open}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white shadow-sm">
            {badgeLabel(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-[100] w-[min(340px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
          role="dialog"
          aria-label={t('notifications.title')}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">
              {t('notifications.title')}
            </p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="max-h-[min(420px,60vh)] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-body-sm text-text-tertiary">
                {t('notifications.loading')}
              </p>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-2/80 text-text-tertiary">
                  <BellIcon className="opacity-60" />
                </div>
                <p className="text-body-sm text-text-tertiary">{t('notifications.empty')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => {
                  const rejected = n.type === 'monthly_receipt_rejected'
                  const expanded = expandedId === n.id
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => void handleItemClick(n)}
                        className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 ${
                          !n.read ? 'bg-accent/[0.04]' : ''
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                            rejected
                              ? 'border-danger/30 bg-danger/10 text-danger'
                              : 'border-success/30 bg-success/10 text-success'
                          }`}
                        >
                          {rejected ? <AlertCircleIcon /> : <CheckCircleIcon />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span
                              className={`text-body-sm leading-snug ${
                                n.read ? 'text-primary' : 'font-semibold text-primary'
                              }`}
                            >
                              {n.title ||
                                (rejected
                                  ? t('notifications.rejected')
                                  : t('notifications.approved'))}
                            </span>
                            {!n.read && (
                              <span
                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                                aria-hidden
                              />
                            )}
                          </span>
                          <span className="mt-0.5 block line-clamp-2 text-body-sm text-text-secondary">
                            {n.message}
                          </span>
                          <span className="mt-1 block text-[11px] text-text-tertiary">
                            {formatWhen(n.createdAt, locale)}
                          </span>
                        </span>
                      </button>

                      {expanded && (
                        <div className="border-t border-border bg-surface-2/50 px-4 py-3">
                          <p className="text-body-sm leading-relaxed text-primary">{n.message}</p>
                          {rejected && n.rejectReason && (
                            <p className="mt-2 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2 text-body-sm text-danger">
                              <span className="font-semibold">{t('notifications.reason')}: </span>
                              {n.rejectReason}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
