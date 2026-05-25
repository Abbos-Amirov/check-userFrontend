/** Bosh sahifada tanlash va yuklash oralig‘ining oxirgi yili (shu yilning 12-oyigacha). */
export const HOME_YEAR_RANGE_END = 2036

/** Joriy kalendardan HOME_YEAR_RANGE_END gacha yillar (o'sish tartibida). */
export function homeYearPickerYears(calendarYear: number): number[] {
  const end = HOME_YEAR_RANGE_END
  if (calendarYear > end) return [calendarYear]
  const years: number[] = []
  for (let y = calendarYear; y <= end; y++) years.push(y)
  return years
}
