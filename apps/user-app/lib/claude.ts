import Anthropic from '@anthropic-ai/sdk'
import type { AICheckResult } from '@/types'

const MODEL = 'claude-sonnet-4-20250514'

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}

export async function readSingleCheck(imageUrl: string): Promise<AICheckResult> {
  const anthropic = getClient()
  if (!anthropic) {
    return {
      amount: null,
      date: null,
      storeName: null,
      confidence: 0,
    }
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'url', url: imageUrl },
          },
          {
            type: 'text',
            text: `Bu chek/kvitansiya rasmidan ma'lumot ol.
FAQAT JSON formatda qaytar, boshqa hech narsa yozma:
{
  "amount": <to'liq summa, faqat raqam, tiyinsiz>,
  "date": "<YYYY-MM-DD formatda, agar bo'lmasa null>",
  "storeName": "<do'kon yoki kafe nomi, agar bo'lmasa null>",
  "confidence": <0 dan 1 gacha, qanchalik aniq o'qinganing>
}`,
          },
        ],
      },
    ],
  })

  try {
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => ('text' in b ? b.text : ''))
      .join('')
      .replace(/```json|```/g, '')
      .trim()
    const parsed = JSON.parse(text) as AICheckResult
    return {
      amount: parsed.amount ?? null,
      date: parsed.date ?? null,
      storeName: parsed.storeName ?? null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
    }
  } catch {
    return { amount: null, date: null, storeName: null, confidence: 0 }
  }
}

export async function calculateMonthTotal(imageUrls: string[]) {
  const results = await Promise.all(imageUrls.map((url) => readSingleCheck(url)))
  const totalAmount = results.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  return { results, totalAmount }
}
