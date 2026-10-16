// Translations, names and number formatting. English always uses Latin digits.

export const MONTHS = {
  fa: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
  en: ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'],
};
// Saturday first.
export const WEEKDAYS = {
  fa: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
  en: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};
export const WEEKDAYS_SHORT = {
  fa: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
};
const GREGORIAN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const GREGORIAN_WEEKDAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

// Only occasions fixed on the Persian calendar and verified. Official holidays and
// lunar-calendar dates need a sourced dataset first, so they are left out.
export const OCCASIONS = [
  { id: 'nowruz', month: 1, day: 1,
    title: { fa: 'نوروز', en: 'Nowruz' },
    detail: { fa: 'مناسبت فرهنگی · آغاز سال شمسی', en: 'Cultural occasion · Start of the Persian year' } },
  { id: 'yalda', month: 9, day: 30,
    title: { fa: 'شب یلدا', en: 'Yalda Night' },
    detail: { fa: 'مناسبت فرهنگی · آخرین شب پاییز', en: 'Cultural occasion · Last night of autumn' } },
];
export const occasionsOn = ({ month, day }) => OCCASIONS.filter((o) => o.month === month && o.day === day);

export const seasonOfMonth = (month) => (month <= 3 ? 'spring' : month <= 6 ? 'summer' : month <= 9 ? 'autumn' : 'winter');

const TEXT = {
  appName: ['تقویم شمسی', 'Shamsi Calendar'],
  tabToday: ['امروز', 'Today'],
  tabCalendar: ['تقویم', 'Calendar'],
  tabSettings: ['تنظیمات', 'Settings'],
  today: ['امروز', 'Today'],
  showInCalendar: ['نمایش در تقویم', 'Show in calendar'],
  comingUp: ['در راه است', 'Coming up'],
  daysUnit: ['روز', 'days'],
  isToday: ['امروز است!', "It's today!"],
  countdownNote: ['شمارش معکوس تا روز تقویمی مناسبت است، نه لحظهٔ تحویل سال.',
    'Countdowns count calendar days to the occasion, not the exact moment of the new year.'],
  previousMonth: ['ماه قبل', 'Previous month'],
  nextMonth: ['ماه بعد', 'Next month'],
  legendToday: ['امروز', 'Today'],
  legendSelected: ['روز انتخاب‌شده', 'Selected day'],
  legendOccasion: ['مناسبت', 'Occasion'],
  noOccasions: ['برای این روز مناسبتی ثبت نشده است.', 'No occasions recorded for this day.'],
  pickMonth: ['انتخاب ماه و سال', 'Choose month and year'],
  month: ['ماه', 'Month'],
  year: ['سال', 'Year'],
  show: ['نمایش', 'Show'],
  cancel: ['انصراف', 'Cancel'],
  settingsTitle: ['تنظیمات', 'Settings'],
  sectionLanguage: ['زبان', 'Language'],
  sectionDisplay: ['نمایش', 'Display'],
  appearance: ['ظاهر', 'Appearance'],
  appearanceSystem: ['همراه دستگاه', 'Match device'],
  appearanceLight: ['روشن', 'Light'],
  appearanceDark: ['تاریک', 'Dark'],
  numerals: ['ارقام', 'Digits'],
  numeralsPersian: ['فارسی ۱۲۳', 'Persian ۱۲۳'],
  numeralsLatin: ['لاتین 123', 'Latin 123'],
  numeralsEnglishNote: ['', 'Digits are always Latin in English.'],
  showGregorian: ['نمایش تاریخ میلادی', 'Show Gregorian date'],
  seasonalColors: ['رنگ هماهنگ با فصل', 'Match colors to season'],
  sectionAbout: ['دربارهٔ داده‌ها', 'About the data'],
  timeZone: ['منطقهٔ زمانی', 'Time zone'],
  followsDevice: ['همراه دستگاه', 'Follows device'],
  dateCalculation: ['محاسبهٔ تاریخ', 'Date calculation'],
  calendarRule: ['قاعدهٔ ۳۳ ساله، تأییدشده با نجوم', '33-year rule, checked against astronomy'],
  range: ['سال‌های پشتیبانی‌شده', 'Supported years'],
  holidaysNote: ['نوروز و یلدا مناسبت فرهنگی‌اند. فهرست تعطیلات رسمی در این نسخه ارائه نمی‌شود.',
    'Nowruz and Yalda are cultural occasions. This version does not include an official holiday list.'],
  installTitle: ['نصب روی صفحهٔ اصلی', 'Add to your Home Screen'],
  installBody: ['در سافاری دکمهٔ اشتراک‌گذاری را بزنید و «افزودن به صفحهٔ اصلی» را انتخاب کنید.',
    'In Safari tap the Share button, then “Add to Home Screen”.'],
  dismiss: ['بستن', 'Dismiss'],
};

export function strings(lang) {
  const i = lang === 'en' ? 1 : 0;
  const out = {};
  for (const [key, pair] of Object.entries(TEXT)) out[key] = pair[i];
  out.season = (s) => ({ spring: ['بهار', 'Spring'], summer: ['تابستان', 'Summer'], autumn: ['پاییز', 'Autumn'], winter: ['زمستان', 'Winter'] }[s][i]);
  out.countdownLabel = (title, days) => (i ? `${title}, ${days} days left, show in calendar` : `${title}، ${days} روز مانده، نمایش در تقویم`);
  return out;
}

export function makeFormatter(lang, digits) {
  const english = lang === 'en';
  const persianDigits = !english && digits === 'persian';
  const number = (n) => (persianDigits ? String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[d]) : String(n));
  const names = MONTHS[english ? 'en' : 'fa'];
  const weekdays = WEEKDAYS[english ? 'en' : 'fa'];
  const monthName = (m) => names[m - 1];
  const dayMonth = (d) => `${number(d.day)} ${monthName(d.month)}`;
  return {
    number,
    monthName,
    monthTitle: ({ year, month }) => `${monthName(month)} ${number(year)}`,
    dayMonth,
    full: (d, weekday) => `${weekdays[weekday]}${english ? ',' : '،'} ${dayMonth(d)} ${number(d.year)}`,
    weekdayName: (i) => weekdays[i],
    weekdayShort: (i) => WEEKDAYS_SHORT[english ? 'en' : 'fa'][i],
    gregorian: (g) => `${g.day} ${GREGORIAN_MONTHS[g.month - 1]} ${g.year}`,
    gregorianFull: (g, weekday) => `${GREGORIAN_WEEKDAYS[weekday]}, ${g.day} ${GREGORIAN_MONTHS[g.month - 1]} ${g.year}`,
  };
}
