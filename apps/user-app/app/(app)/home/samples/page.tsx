import { redirect } from 'next/navigation'

/** Eski «Namuna» yo‘li — endi «Cheklarim» `/home/checks` da. */
export default function SamplesRedirectPage() {
  redirect('/home/checks')
}
