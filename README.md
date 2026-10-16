# تقویم شمسی — Shamsi Calendar

An installable Persian (Solar Hijri) calendar for the phone. Works offline.

- **Today**, **Calendar** and **Settings** screens; Persian and English (one tap), light/dark, Persian or Latin digits, optional Gregorian dates, seasonal colors, countdowns to Nowruz and Yalda.
- "Today" follows the device's time zone.
- Years 1300–1500. The calendar rule is checked against an independent astronomical reference for **every** supported year (see `tests/`), so it does not depend on the browser's `Intl`.
- No accounts, no tracking, no network requests after the first load.

**Install on iPhone:** open the site in Safari → Share → **Add to Home Screen**.

Run the tests: `node --test tests/calendar.test.mjs tests/i18n.test.mjs tests/sw.test.mjs`
Run locally: `python3 -m http.server 8080`

Fonts: Baloo Bhaijaan 2 and Vazirmatn, both under the SIL Open Font License (`fonts/OFL-*.txt`).
`prototype.html` is the original single-file prototype.
