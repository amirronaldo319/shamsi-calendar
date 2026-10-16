// Persian (Solar Hijri) calendar core. Pure functions, no DOM, no Intl.
//
// Arithmetic 33-year rule (leap year when (25y + 11) mod 33 < 8). It is verified in
// tests against an independent astronomical reference for every year in the supported
// range, so the app never depends on what a browser's Intl implementation does.

export const FIRST_YEAR = 1300;
export const LAST_YEAR = 1500;

const CUMULATIVE_DAYS = [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336];
// Day number of 1 Farvardin, year 1 (calibrated by tests against published dates).
const EPOCH = 1948320;

const floorDiv = (a, b) => Math.floor(a / b);

export const isSupportedYear = (year) => year >= FIRST_YEAR && year <= LAST_YEAR;

export function isLeapYear(year) {
  return (((25 * year + 11) % 33) + 33) % 33 < 8;
}

export function daysInMonth(year, month) {
  if (!isSupportedYear(year) || month < 1 || month > 12) return 0;
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isLeapYear(year) ? 30 : 29;
}

export function isValidDate({ year, month, day }) {
  return day >= 1 && day <= daysInMonth(year, month);
}

const yearStart = (year) => 365 * (year - 1) + floorDiv(8 * year + 21, 33);

/** Day number (a stable integer per civil day) of a Persian date. */
export function persianToDayNumber({ year, month, day }) {
  return EPOCH + yearStart(year) + CUMULATIVE_DAYS[month - 1] + day - 1;
}

export function dayNumberToPersian(dayNumber) {
  const sinceEpoch = dayNumber - EPOCH;
  const year = 1 + floorDiv(33 * sinceEpoch + 3, 12053);
  const dayOfYear = sinceEpoch - yearStart(year);
  const monthIndex = dayOfYear < 216 ? floorDiv(dayOfYear, 31) : floorDiv(dayOfYear - 6, 30);
  return { year, month: monthIndex + 1, day: dayOfYear - CUMULATIVE_DAYS[monthIndex] + 1 };
}

/** Day number of a Gregorian civil date (Julian day number at noon). */
export function gregorianToDayNumber({ year, month, day }) {
  const a = floorDiv(14 - month, 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + floorDiv(153 * m + 2, 5) + 365 * y + floorDiv(y, 4) - floorDiv(y, 100) + floorDiv(y, 400) - 32045;
}

export function dayNumberToGregorian(dayNumber) {
  const f = dayNumber + 1401 + floorDiv(floorDiv(4 * dayNumber + 274277, 146097) * 3, 4) - 38;
  const e = 4 * f + 3;
  const g = floorDiv(e % 1461, 4);
  const h = 5 * g + 2;
  const day = floorDiv(h % 153, 5) + 1;
  const month = ((floorDiv(h, 153) + 2) % 12) + 1;
  const year = floorDiv(e, 1461) - 4716 + floorDiv(12 + 2 - month, 12);
  return { year, month, day };
}

export const persianToGregorian = (date) => dayNumberToGregorian(persianToDayNumber(date));
export const gregorianToPersian = (date) => dayNumberToPersian(gregorianToDayNumber(date));

/** Saturday = 0 ... Friday = 6. */
export const weekdayIndex = (date) => (persianToDayNumber(date) + 2) % 7;
export const isFriday = (date) => weekdayIndex(date) === 6;

/** The Persian date "now", in the device's local time zone. */
export function todayFromDevice(now = new Date()) {
  return gregorianToPersian({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}

/** Leading nulls (blank cells, Saturday-first) then every day of the month. */
export function monthCells(year, month) {
  const length = daysInMonth(year, month);
  if (!length) return [];
  const lead = weekdayIndex({ year, month, day: 1 });
  return [...Array(lead).fill(null), ...Array.from({ length }, (_, i) => ({ year, month, day: i + 1 }))];
}

/** The month `delta` months away, or null outside the supported years. */
export function addMonths({ year, month }, delta) {
  const index = year * 12 + (month - 1) + delta;
  const result = { year: Math.floor(index / 12), month: (((index % 12) + 12) % 12) + 1 };
  return isSupportedYear(result.year) ? result : null;
}

export const compareDates = (a, b) => persianToDayNumber(a) - persianToDayNumber(b);
export const isSameDate = (a, b) => a.year === b.year && a.month === b.month && a.day === b.day;

/** Whole days from `start` to `end` (negative if end is earlier). */
export const daysBetween = (start, end) => persianToDayNumber(end) - persianToDayNumber(start);

/** First date on or after `from` falling on month/day (skips years lacking that day). */
export function nextOccurrence(month, day, from) {
  for (let year = from.year; year <= from.year + 8; year += 1) {
    const candidate = { year, month, day };
    if (isSupportedYear(year) && isValidDate(candidate) && compareDates(candidate, from) >= 0) return candidate;
  }
  return null;
}
