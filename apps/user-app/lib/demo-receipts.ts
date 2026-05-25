/**
 * Namuna cheklar (hardcoded) — har oy sahifasida ko‘rsatiladi.
 * Summalar kvitansiya tavsifiga mos; turli valyutalar alohida yig‘iladi.
 */
export type DemoReceiptCurrency = 'KRW' | 'CHF' | 'UNIT'

export type DemoReceipt = {
  id: string
  image: string
  storeName: string
  amount: number
  currency: DemoReceiptCurrency
}

export const DEMO_RECEIPTS: DemoReceipt[] = [
  {
    id: 'demo-1',
    image: '/demo-checks/01-seven-eleven.png',
    storeName: '7-Eleven (Seoul)',
    amount: 13820,
    currency: 'KRW',
  },
  {
    id: 'demo-2',
    image: '/demo-checks/02-berghotel.png',
    storeName: 'Berghotel Grosse Scheidegg',
    amount: 54.5,
    currency: 'CHF',
  },
  {
    id: 'demo-3',
    image: '/demo-checks/03-rice-thief.png',
    storeName: "김대준의 밥도둑",
    amount: 7500,
    currency: 'KRW',
  },
  {
    id: 'demo-4',
    image: '/demo-checks/04-template-receipt.png',
    storeName: 'CASH RECEIPT (template)',
    amount: 16.5,
    currency: 'UNIT',
  },
  {
    id: 'demo-5',
    image: '/demo-checks/05-korean-1300.png',
    storeName: 'Korean receipt',
    amount: 1300,
    currency: 'KRW',
  },
  {
    id: 'demo-6',
    image: '/demo-checks/06-maple-latte.png',
    storeName: '(H)Maple Latte',
    amount: 4500,
    currency: 'KRW',
  },
]

export function sumDemoReceiptsByCurrency(
  items: DemoReceipt[]
): Record<DemoReceiptCurrency, number> {
  const out: Record<DemoReceiptCurrency, number> = {
    KRW: 0,
    CHF: 0,
    UNIT: 0,
  }
  for (const r of items) {
    out[r.currency] += r.amount
  }
  return out
}
