/** Server-only: backend bazaviy URL (proxy route lar uchun) */
export function getBackendBaseUrl(): string {
  const raw =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000'
  return raw.replace(/\/$/, '')
}
