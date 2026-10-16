import * as cal from './calendar.js';
import { strings, makeFormatter, occasionsOn, OCCASIONS, seasonOfMonth } from './i18n.js';

const STORAGE_KEY = 'shamsi.prefs.v1';
const DEFAULT_PREFS = { lang: 'fa', appearance: 'system', digits: 'persian', gregorian: true, seasonal: true, installDismissed: false };

const ICON = {
  attrs: 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"',
  get globe() { return `<svg ${this.attrs}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`; },
  get sun() { return `<svg ${this.attrs}><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>`; },
  get calendar() { return `<svg ${this.attrs}><rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14.5" r=".6" fill="currentColor"/><circle cx="12" cy="14.5" r=".6" fill="currentColor"/><circle cx="15.5" cy="14.5" r=".6" fill="currentColor"/></svg>`; },
  get settings() { return `<svg ${this.attrs}><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/></svg>`; },
  get prev() { return `<svg ${this.attrs}><path d="M15 5l-7 7 7 7"/></svg>`; },
  get next() { return `<svg ${this.attrs}><path d="M9 5l7 7-7 7"/></svg>`; },
  get down() { return `<svg ${this.attrs}><path d="M6 9l6 6 6-6"/></svg>`; },
};

// ---------- State ----------
function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      lang: saved.lang === 'en' ? 'en' : 'fa',
      appearance: ['system', 'light', 'dark'].includes(saved.appearance) ? saved.appearance : 'system',
      digits: saved.digits === 'latin' ? 'latin' : 'persian',
      gregorian: saved.gregorian !== false,
      seasonal: saved.seasonal !== false,
      installDismissed: saved.installDismissed === true,
    };
  } catch { return { ...DEFAULT_PREFS }; }
}
function savePrefs() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch { /* private mode: keep in memory */ } }

const clampMonth = ({ year, month }) =>
  year < cal.FIRST_YEAR ? { year: cal.FIRST_YEAR, month: 1 } : year > cal.LAST_YEAR ? { year: cal.LAST_YEAR, month: 12 } : { year, month };

let prefs = loadPrefs();
let today = cal.todayFromDevice();
let visible = clampMonth(today);
let selected = cal.isSupportedYear(today.year) ? today : { ...visible, day: 1 };
let tab = 'today';
let monthAnimation = 0; // +1 next, -1 previous, 0 none

const app = document.getElementById('app');
const dateKey = ({ year, month, day }) => `${year}-${month}-${day}`;
const parseKey = (key) => { const [year, month, day] = key.split('-').map(Number); return { year, month, day }; };
const isRtl = () => prefs.lang === 'fa';

// ---------- Views ----------
function todayView(t, fmt) {
  const weekday = cal.weekdayIndex(today);
  const greg = cal.persianToGregorian(today);
  const occasions = occasionsOn(today);
  const countdowns = OCCASIONS
    .map((o) => { const date = cal.nextOccurrence(o.month, o.day, today); return date && { o, date, days: cal.daysBetween(today, date) }; })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days);
  const showInstall = !prefs.installDismissed && /iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.standalone;

  return `<section class="view">
    <div class="toolbar"><button class="pill" data-action="toggle-lang">${ICON.globe}<span>${prefs.lang === 'fa' ? 'English' : 'فارسی'}</span></button></div>
    ${showInstall ? `<div class="install" role="note"><div><strong>${t.installTitle}</strong>${t.installBody}</div><button data-action="dismiss-install" aria-label="${t.dismiss}">✕</button></div>` : ''}
    <article class="card today-card">
      <p class="eyebrow">${t.today}</p>
      <div class="big-number" aria-hidden="true">${fmt.number(today.day)}</div>
      <h2 class="date-line">${fmt.full(today, weekday)}</h2>
      ${prefs.gregorian ? `<p class="greg ltr-text">${fmt.gregorianFull(greg, weekday)}</p>` : '<div style="height:14px"></div>'}
      <button class="primary" data-action="show-today">${t.showInCalendar}</button>
    </article>
    ${occasions.length ? `<article class="card list-card">${occasions.map((o) => occasionRow(o, t)).join('')}</article>` : ''}
    <article class="card list-card">
      <h3 class="section-title">${t.comingUp}</h3>
      ${countdowns.map(({ o, date, days }) => `
        <button class="row-btn" data-action="open-date" data-date="${dateKey(date)}" aria-label="${t.countdownLabel(o.title[prefs.lang], fmt.number(days))}">
          <span class="count">${fmt.number(days)}<small>${t.daysUnit}</small></span>
          <span><span class="row-title">${o.title[prefs.lang]}</span><br><span class="row-sub">${days === 0 ? t.isToday : `${fmt.dayMonth(date)} ${fmt.number(date.year)}`}</span></span>
        </button>`).join('')}
    </article>
    <p class="note">${t.countdownNote}</p>
  </section>`;
}

function occasionRow(o, t) {
  return `<div class="occasion"><div class="row-title">${o.title[prefs.lang]}</div><div class="row-sub">${o.detail[prefs.lang]}</div></div>`;
}

function calendarView(t, fmt) {
  const season = prefs.seasonal ? seasonOfMonth(visible.month) : 'autumn';
  const length = cal.daysInMonth(visible.year, visible.month);
  const first = cal.persianToGregorian({ ...visible, day: 1 });
  const last = cal.persianToGregorian({ ...visible, day: length });
  const canPrev = cal.addMonths(visible, -1) !== null;
  const canNext = cal.addMonths(visible, 1) !== null;
  const cells = cal.monthCells(visible.year, visible.month);
  const dir = monthAnimation * (isRtl() ? -1 : 1);

  const dayButtons = cells.map((d) => {
    if (!d) return '<span aria-hidden="true"></span>';
    const isToday = cal.isSameDate(d, today), isSelected = cal.isSameDate(d, selected);
    const occ = occasionsOn(d);
    const cls = ['day', cal.isFriday(d) && 'friday', isToday && 'today', isSelected && 'selected', occ.length && 'dot'].filter(Boolean).join(' ');
    const label = [fmt.full(d, cal.weekdayIndex(d)), isToday && t.today, ...occ.map((o) => o.title[prefs.lang])].filter(Boolean).join(prefs.lang === 'en' ? ', ' : '، ');
    return `<button class="${cls}" data-action="pick-day" data-date="${dateKey(d)}" aria-label="${label}" aria-pressed="${isSelected}"${isToday ? ' aria-current="date"' : ''}>${fmt.number(d.day)}</button>`;
  }).join('');

  const weekday = cal.weekdayIndex(selected);
  const occasions = occasionsOn(selected);
  const selGreg = cal.persianToGregorian(selected);

  return `<section class="view" data-season-view="${season}">
    <header class="hero">
      <div class="hero-top"><span>${t.season(season)}</span><button class="chip-btn" data-action="go-today">${t.today}</button></div>
      <div class="hero-main">
        <button class="nav-btn" data-action="prev" aria-label="${t.previousMonth}" ${canPrev ? '' : 'disabled'}>${ICON.prev}</button>
        <button class="title-btn" data-action="open-jump" aria-label="${t.pickMonth}"><span class="month-title">${fmt.monthTitle(visible)}${ICON.down}</span></button>
        <button class="nav-btn" data-action="next" aria-label="${t.nextMonth}" ${canNext ? '' : 'disabled'}>${ICON.next}</button>
      </div>
      ${prefs.gregorian ? `<p class="range">${fmt.gregorian(first)} – ${fmt.gregorian(last)}</p>` : ''}
    </header>
    <article class="card cal-card">
      <div class="dows">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<span aria-label="${fmt.weekdayName(i)}">${fmt.weekdayShort(i)}</span>`).join('')}</div>
      <div class="days${monthAnimation ? ' enter' : ''}" style="--dir:${dir}">${dayButtons}</div>
      <div class="legend"><span><i class="ring"></i>${t.legendToday}</span><span><i class="fill"></i>${t.legendSelected}</span><span><i class="dot-i"></i>${t.legendOccasion}</span></div>
    </article>
    <article class="card detail">
      <h2>${fmt.full(selected, weekday)}</h2>
      ${prefs.gregorian ? `<p class="muted ltr-text" style="font-size:14px">${fmt.gregorianFull(selGreg, weekday)}</p>` : ''}
      <hr>
      ${occasions.length ? occasions.map((o) => occasionRow(o, t)).join('') : `<p class="muted" style="font-size:14px;padding:8px 0">${t.noOccasions}</p>`}
    </article>
    <dialog id="jump" aria-label="${t.pickMonth}">
      <form method="dialog" id="jump-form">
        <h2>${t.pickMonth}</h2>
        <div class="fields">
          <label>${t.month}<select id="jump-month">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}"${i + 1 === visible.month ? ' selected' : ''}>${fmt.monthName(i + 1)}</option>`).join('')}</select></label>
          <label>${t.year}<select id="jump-year">${Array.from({ length: cal.LAST_YEAR - cal.FIRST_YEAR + 1 }, (_, i) => cal.FIRST_YEAR + i).map((y) => `<option value="${y}"${y === visible.year ? ' selected' : ''}>${fmt.number(y)}</option>`).join('')}</select></label>
        </div>
        <div class="actions"><button type="button" class="ghost" data-action="close-jump">${t.cancel}</button><button class="primary" value="ok">${t.show}</button></div>
      </form>
    </dialog>
  </section>`;
}

function seg(action, current, options, extra = '') {
  return `<div class="seg ${extra}" role="radiogroup">${options.map(([value, label]) => `<button role="radio" aria-checked="${current === value}" data-action="${action}" data-value="${value}">${label}</button>`).join('')}</div>`;
}
const toggle = (action, on, label) => `<button class="switch" role="switch" aria-checked="${on}" aria-label="${label}" data-action="${action}"></button>`;

function settingsView(t) {
  const english = prefs.lang === 'en';
  return `<section class="view settings">
    <h1>${t.settingsTitle}</h1>
    <div><p class="group-title">${t.sectionLanguage}</p>
      <div class="card group">${seg('set-lang', prefs.lang, [['fa', 'فارسی'], ['en', 'English']], 'full')}</div></div>
    <div><p class="group-title">${t.sectionDisplay}</p>
      <div class="card group">
        <div class="setting"><span class="label">${t.appearance}</span>${seg('set-appearance', prefs.appearance, [['system', t.appearanceSystem], ['light', t.appearanceLight], ['dark', t.appearanceDark]])}</div>
        <div class="setting"><span class="label">${t.numerals}</span><div class="seg" role="radiogroup" aria-disabled="${english}">${[['persian', t.numeralsPersian], ['latin', t.numeralsLatin]].map(([v, l]) => `<button role="radio" aria-checked="${(english ? 'latin' : prefs.digits) === v}" data-action="set-digits" data-value="${v}">${l}</button>`).join('')}</div></div>
        ${english ? `<p class="hint">${t.numeralsEnglishNote}</p>` : ''}
        <div class="setting"><span class="label">${t.showGregorian}</span>${toggle('toggle-gregorian', prefs.gregorian, t.showGregorian)}</div>
        <div class="setting"><span class="label">${t.seasonalColors}</span>${toggle('toggle-seasonal', prefs.seasonal, t.seasonalColors)}</div>
      </div></div>
    <div><p class="group-title">${t.sectionAbout}</p>
      <div class="card group">
        <div class="setting"><span class="label">${t.timeZone}</span><span class="value ltr-text">${t.followsDevice} · ${Intl.DateTimeFormat().resolvedOptions().timeZone}</span></div>
        <div class="setting"><span class="label">${t.dateCalculation}</span><span class="value">${t.calendarRule}</span></div>
        <div class="setting"><span class="label">${t.range}</span><span class="value">${makeFormatter(prefs.lang, prefs.digits).number(cal.FIRST_YEAR)}–${makeFormatter(prefs.lang, prefs.digits).number(cal.LAST_YEAR)}</span></div>
        <p class="hint" style="padding-top:10px">${t.holidaysNote}</p>
      </div></div>
  </section>`;
}

function tabBar(t) {
  const tabs = [['today', ICON.sun, t.tabToday], ['month', ICON.calendar, t.tabCalendar], ['settings', ICON.settings, t.tabSettings]];
  return `<nav class="tabbar"><div class="tabs" role="tablist">${tabs.map(([id, icon, label]) => `<button class="tab" role="tab" aria-selected="${tab === id}" data-action="tab" data-value="${id}">${icon}<span>${label}</span></button>`).join('')}</div></nav>`;
}

// ---------- Render ----------
function resolvedTheme() {
  return prefs.appearance === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : prefs.appearance;
}

function render() {
  const t = strings(prefs.lang);
  const fmt = makeFormatter(prefs.lang, prefs.digits);
  const root = document.documentElement;
  root.lang = prefs.lang;
  root.dir = isRtl() ? 'rtl' : 'ltr';
  root.dataset.theme = resolvedTheme();
  root.dataset.season = prefs.seasonal ? seasonOfMonth(tab === 'month' ? visible.month : today.month) : 'autumn';
  document.title = t.appName;
  const body = tab === 'today' ? todayView(t, fmt) : tab === 'month' ? calendarView(t, fmt) : settingsView(t);
  app.innerHTML = body + tabBar(t);
  monthAnimation = 0;
}

// ---------- Actions ----------
function setTab(next) { tab = next; render(); window.scrollTo({ top: 0 }); }
function move(delta) {
  const target = cal.addMonths(visible, delta);
  if (!target) return;
  visible = target; monthAnimation = delta > 0 ? 1 : -1; render();
}
function goToToday() { visible = clampMonth(today); selected = cal.isSupportedYear(today.year) ? today : { ...visible, day: 1 }; }

const actions = {
  tab: (el) => setTab(el.dataset.value),
  'toggle-lang': () => { prefs.lang = prefs.lang === 'fa' ? 'en' : 'fa'; savePrefs(); render(); },
  'set-lang': (el) => { prefs.lang = el.dataset.value; savePrefs(); render(); },
  'set-appearance': (el) => { prefs.appearance = el.dataset.value; savePrefs(); render(); },
  'set-digits': (el) => { prefs.digits = el.dataset.value; savePrefs(); render(); },
  'toggle-gregorian': () => { prefs.gregorian = !prefs.gregorian; savePrefs(); render(); },
  'toggle-seasonal': () => { prefs.seasonal = !prefs.seasonal; savePrefs(); render(); },
  'dismiss-install': () => { prefs.installDismissed = true; savePrefs(); render(); },
  'show-today': () => { goToToday(); setTab('month'); },
  'go-today': () => { goToToday(); render(); },
  'open-date': (el) => { selected = parseKey(el.dataset.date); visible = { year: selected.year, month: selected.month }; setTab('month'); },
  'pick-day': (el) => { selected = parseKey(el.dataset.date); render(); },
  prev: () => move(-1),
  next: () => move(1),
  'open-jump': () => document.getElementById('jump')?.showModal(),
  'close-jump': () => document.getElementById('jump')?.close(),
};

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  const handler = el && actions[el.dataset.action];
  if (handler) handler(el);
});

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'jump-form') return;
  const month = Number(document.getElementById('jump-month').value);
  const year = Number(document.getElementById('jump-year').value);
  if (cal.isSupportedYear(year)) { visible = { year, month }; selected = { year, month, day: 1 }; }
  render();
});

// Swipe the grid to change month. "Next" is toward the left in Persian, toward the right in English... as a drag:
// dragging finger leftwards goes to the next month in LTR, rightwards in RTL.
let touchStart = null;
document.addEventListener('touchstart', (e) => { touchStart = e.target.closest('.cal-card') ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
document.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 56 || Math.abs(dy) > 42) return;
  const wantsNext = isRtl() ? dx > 0 : dx < 0;
  move(wantsNext ? 1 : -1);
}, { passive: true });

// Keep "today" correct across midnight, time-zone changes, and returning to the app.
function refreshToday() {
  const now = cal.todayFromDevice();
  if (cal.isSameDate(now, today)) return;
  const followed = cal.isSameDate(selected, today);
  today = now;
  if (followed) goToToday();
  render();
}
setInterval(refreshToday, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshToday(); });
window.addEventListener('focus', refreshToday);
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (prefs.appearance === 'system') render(); });

render();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
}
