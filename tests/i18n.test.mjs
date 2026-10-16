import test from 'node:test';
import assert from 'node:assert/strict';
import { makeFormatter, strings, OCCASIONS, occasionsOn, seasonOfMonth, MONTHS, WEEKDAYS } from '../i18n.js';

test('digits: persian, latin, and english always latin', () => {
  assert.equal(makeFormatter('fa', 'persian').number(1405), '۱۴۰۵');
  assert.equal(makeFormatter('fa', 'latin').number(1405), '1405');
  assert.equal(makeFormatter('en', 'persian').number(1405), '1405');
  assert.equal(makeFormatter('fa', 'persian').number(0), '۰');
});

test('date strings', () => {
  const d = { year: 1405, month: 7, day: 23 };
  assert.equal(makeFormatter('fa', 'persian').full(d, 5), 'پنجشنبه، ۲۳ مهر ۱۴۰۵');
  assert.equal(makeFormatter('en', 'persian').full(d, 5), 'Thursday, 23 Mehr 1405');
  assert.equal(makeFormatter('en', 'latin').monthTitle(d), 'Mehr 1405');
  assert.equal(makeFormatter('fa', 'latin').gregorianFull({ year: 2026, month: 10, day: 15 }, 5), 'Thursday, 15 Oct 2026');
});

test('name tables are complete', () => {
  for (const lang of ['fa', 'en']) {
    assert.equal(MONTHS[lang].length, 12);
    assert.equal(new Set(MONTHS[lang]).size, 12);
    assert.equal(WEEKDAYS[lang].length, 7);
  }
});

test('every string exists in both languages and differs', () => {
  const fa = strings('fa'), en = strings('en');
  for (const key of Object.keys(fa)) {
    if (typeof fa[key] === 'function') continue;
    assert.ok(key in en);
    if (key !== 'numeralsEnglishNote') assert.ok(fa[key].length > 0 && en[key].length > 0, key);
  }
  assert.notEqual(fa.tabToday, en.tabToday);
  assert.equal(en.season('autumn'), 'Autumn');
  assert.equal(fa.season('autumn'), 'پاییز');
});

test('occasions are real, unique, bilingual days', () => {
  assert.equal(new Set(OCCASIONS.map((o) => o.id)).size, OCCASIONS.length);
  for (const o of OCCASIONS) {
    assert.ok(o.title.fa && o.title.en && o.detail.fa && o.detail.en);
    assert.notEqual(o.title.fa, o.title.en);
    assert.ok(o.month >= 1 && o.month <= 12 && o.day >= 1 && o.day <= (o.month <= 6 ? 31 : 30));
  }
  assert.deepEqual(occasionsOn({ month: 1, day: 1 }).map((o) => o.id), ['nowruz']);
  assert.deepEqual(occasionsOn({ month: 9, day: 30 }).map((o) => o.id), ['yalda']);
  assert.equal(occasionsOn({ month: 7, day: 23 }).length, 0);
});

test('seasons', () => {
  assert.deepEqual([1, 3, 4, 6, 7, 9, 10, 12].map(seasonOfMonth), ['spring', 'spring', 'summer', 'summer', 'autumn', 'autumn', 'winter', 'winter']);
});
