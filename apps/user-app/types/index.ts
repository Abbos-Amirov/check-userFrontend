export type MonthSummaryStatus = 'empty' | 'uploaded' | 'submitted' | 'approved'

export interface Check {
  id: string
  user_id: string
  image_url: string
  amount: number
  store_name: string | null
  check_date: string | null
  month: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note?: string | null
  created_at?: string
}

export interface MonthlyReport {
  id: string
  user_id: string
  month: string
  total_amount: number
  check_count: number
  submitted_at: string | null
  status: 'draft' | 'submitted' | 'paid'
}

export interface AICheckResult {
  amount: number | null
  date: string | null
  storeName: string | null
  confidence: number
}

export interface MonthSummary {
  totalAmount: number
  checkCount: number
  status: MonthSummaryStatus
}

/** Cheklarim galereyasi kartochkasi */
export type CheckFeedItem = {
  id: string
  avatar: string
  receipt: string
  /** YYYY-MM */
  month: string
  storeName: string
  amount: number
  currency: 'KRW' | 'CHF' | 'UNIT'
}

export interface UserProfile {
  id: string
  full_name: string
  employee_id: string
  phone: string | null
  avatar_url?: string | null
  role: string
  created_at?: string
}
