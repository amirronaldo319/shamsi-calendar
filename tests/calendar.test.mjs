import test from 'node:test';
import assert from 'node:assert/strict';
import * as cal from '../calendar.js';
import { FIRST_YEAR as REF_FIRST, NOWRUZ_MARCH_DAY } from './nowruz-reference.mjs';

const P = (year, month, day) => ({ year, month, day });
const G = (year, month, day) => ({ year, month, day });

test('reference range matches supported range', () => {
  assert.equal(REF_FIRST, cal.FIRST_YEAR);
  assert.equal(NOWRUZ_MARCH_DAY.length, cal.LAST_YEAR - cal.FIRST_YEAR + 1);
});

test('published conversion dates', () => {
  const rows = [
    [P(1378, 10, 11), G(2000, 1, 1)], [P(1402, 12, 10), G(2024, 2, 29)], [P(1403, 1, 1), G(2024, 3, 20)],
    [P(1403, 10, 1), G(2024, 12, 21)], [P(1403, 9, 30), G(2024, 12, 20)], [P(1404, 1, 1), G(2025, 3, 21)],
    [P(1404, 11, 25), G(2026, 2, 14)], [P(1405, 1, 1), G(2026, 3, 21)], [P(1405, 7, 23), G(2026, 10, 15)],
  ];
  for (const [p, g] of rows) {
    assert.deepEqual(cal.persianToGregorian(p), g, JSON.stringify(p));
    assert.deepEqual(cal.gregorianToPersian(g), p, JSON.stringify(g));
  }
});

test('Nowruz matches astronomy for every supported year', () => {
  for (let year = cal.FIRST_YEAR; year <= cal.LAST_YEAR; year += 1) {
    const expected = G(year + 621, 3, NOWRUZ_MARCH_DAY[year - cal.FIRST_YEAR]);
    assert.deepEqual(cal.persianToGregorian(P(year, 1, 1)), expected, `Nowruz ${year}`);
  }
});

test('year lengths match astronomy for every supported year', () => {
  for (let year = cal.FIRST_YEAR; year < cal.LAST_YEAR; year += 1) {
    const a = cal.gregorianToDayNumber(G(year + 621, 3, NOWRUZ_MARCH_DAY[year - cal.FIRST_YEAR]));
    const b = cal.gregorianToDayNumber(G(year + 622, 3, NOWRUZ_MARCH_DAY[year + 1 - cal.FIRST_YEAR]));
    let total = 0;
    for (let m = 1; m <= 12; m += 1) total += cal.daysInMonth(year, m);
    assert.equal(total, b - a, `length of ${year}`);
    assert.equal(cal.isLeapYear(year), b - a === 366, `leap ${year}`);
  }
});

test('every day round-trips and advances by exactly one', () => {
  let previous = null;
  for (let year = cal.FIRST_YEAR; year <= cal.LAST_YEAR; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      for (let day = 1; day <= cal.daysInMonth(year, month); day += 1) {
        const date = P(year, month, day);
        const n = cal.persianToDayNumber(date);
        assert.deepEqual(cal.dayNumberToPersian(n), date);
        assert.deepEqual(cal.gregorianToPersian(cal.dayNumberToGregorian(n)), date);
        if (previous !== null) assert.equal(n, previous + 1);
        previous = n;
      }
    }
  }
});

test('month lengths and invalid dates', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((m) => cal.daysInMonth(1405, m)), [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30]);
  assert.equal(cal.daysInMonth(1403, 12), 30);
  assert.equal(cal.daysInMonth(1404, 12), 29);
  assert.equal(cal.isValidDate(P(1404, 12, 30)), false);
  assert.equal(cal.isValidDate(P(1403, 12, 30)), true);
  assert.equal(cal.daysInMonth(1299, 1), 0);
  assert.equal(cal.daysInMonth(1501, 1), 0);
  assert.equal(cal.daysInMonth(1405, 13), 0);
});

test('Saturday-first weekdays', () => {
  assert.equal(cal.weekdayIndex(P(1405, 1, 1)), 0);   // Sat 21 Mar 2026
  assert.equal(cal.weekdayIndex(P(1403, 1, 1)), 4);   // Wed 20 Mar 2024
  assert.equal(cal.weekdayIndex(P(1405, 7, 23)), 5);  // Thu 15 Oct 2026
  assert.equal(cal.weekdayIndex(P(1403, 9, 30)), 6);  // Fri 20 Dec 2024
  assert.equal(cal.isFriday(P(1403, 9, 30)), true);
  for (let m = 1; m <= 12; m += 1) {
    for (let d = 1; d <= cal.daysInMonth(1403, m); d += 1) {
      const g = cal.persianToGregorian(P(1403, m, d));
      const js = new Date(Date.UTC(g.year, g.month - 1, g.day)).getUTCDay(); // 0 = Sunday
      assert.equal(cal.weekdayIndex(P(1403, m, d)), (js + 1) % 7);
    }
  }
});

test('month grid placement', () => {
  const cells = cal.monthCells(1403, 1);
  assert.equal(cells.length, 4 + 31);
  assert.ok(cells.slice(0, 4).every((c) => c === null));
  assert.deepEqual(cells[4], P(1403, 1, 1));
  assert.deepEqual(cal.monthCells(1501, 1), []);
});

test('month navigation across year ends and bounds', () => {
  assert.deepEqual(cal.addMonths({ year: 1404, month: 12 }, 1), { year: 1405, month: 1 });
  assert.deepEqual(cal.addMonths({ year: 1405, month: 1 }, -1), { year: 1404, month: 12 });
  assert.deepEqual(cal.addMonths({ year: 1404, month: 12 }, 13), { year: 1406, month: 1 });
  assert.equal(cal.addMonths({ year: 1300, month: 1 }, -1), null);
  assert.equal(cal.addMonths({ year: 1500, month: 12 }, 1), null);
});

test('today follows the device local date', () => {
  assert.deepEqual(cal.todayFromDevice(new Date(2026, 9, 15, 0, 5)), P(1405, 7, 23));
  assert.deepEqual(cal.todayFromDevice(new Date(2026, 9, 15, 23, 59)), P(1405, 7, 23));
  assert.deepEqual(cal.todayFromDevice(new Date(2026, 2, 21, 0, 0)), P(1405, 1, 1));
  assert.deepEqual(cal.todayFromDevice(new Date(2026, 2, 20, 23, 59)), P(1404, 12, 29));
});

test('countdowns', () => {
  const today = P(1405, 7, 23);
  assert.equal(cal.daysBetween(today, P(1405, 9, 30)), 67);
  assert.equal(cal.daysBetween(today, P(1406, 1, 1)), 157);
  assert.equal(cal.daysBetween(today, today), 0);
  assert.equal(cal.daysBetween(P(1405, 7, 24), today), -1);
  assert.deepEqual(cal.nextOccurrence(1, 1, P(1405, 1, 1)), P(1405, 1, 1));
  assert.deepEqual(cal.nextOccurrence(1, 1, today), P(1406, 1, 1));
  assert.deepEqual(cal.nextOccurrence(12, 30, P(1404, 1, 1)), P(1408, 12, 30));
  assert.equal(cal.nextOccurrence(1, 1, P(1500, 12, 29)), null);
});
