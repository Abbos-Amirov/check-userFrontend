export type WorkType = 'inside' | 'outside'

export type SignupFormFields = {
  fullName: string
  employeeId: string
  phone: string
  password: string
  workType: WorkType
  avatar?: File | null
}

export const SIGNUP_AVATAR_MAX_BYTES = 5 * 1024 * 1024

export const SIGNUP_AVATAR_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,image/heic,.heic'
