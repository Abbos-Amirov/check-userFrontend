'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { CurrentUser } from '@/lib/current-user'

const CurrentUserContext = createContext<CurrentUser | null>(null)

type Props = {
  user: CurrentUser | null
  children: ReactNode
}

export function CurrentUserProvider({ user, children }: Props) {
  return (
    <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>
  )
}

export function useCurrentUser(): CurrentUser | null {
  return useContext(CurrentUserContext)
}
