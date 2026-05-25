export function formatSum(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm"
}

export function getMonthName(month: number): string {
  const months = [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentyabr',
    'Oktyabr',
    'Noyabr',
    'Dekabr',
  ]
  return months[month - 1] ?? ''
}

export function getMonthShort(month: number): string {
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  return months[month - 1] ?? ''
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  return `${getMonthName(Number(month))} ${year}`
}

export function employeeIdToEmail(employeeId: string): string {
  return `${employeeId.trim().toLowerCase()}@zavod.uz`
}
