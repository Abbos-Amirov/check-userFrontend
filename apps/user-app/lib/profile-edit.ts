import type { WorkType } from '@/lib/auth-signup'

export type ProfileEditInitial = {
  fullName: string
  employeeId: string
  phone: string
  workType: WorkType | null
  avatarSrc: string
}
