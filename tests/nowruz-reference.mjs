// Independent reference: the Gregorian day in March on which 1 Farvardin falls,
// Persian years 1300..1500. Computed from astronomy (vernal equinox, Meeus ch. 27,
// converted to Tehran time UTC+3:30; the year starts that day if the equinox is
// before noon, else the next day). It does not come from any calendar library.
// Years within ~15 minutes of noon (1309, 1342, 1470, 1474) are at the method's limit.
export const FIRST_YEAR = 1300;
export const NOWRUZ_MARCH_DAY = [21, 22, 22, 21, 21, 22, 22, 21, 21, 21, 22, 21, 21, 21, 22, 21, 21, 21, 22, 21, 21, 21, 22, 21, 21, 21, 22, 21, 21, 21, 22, 21, 21, 21, 22, 21, 21, 21, 22, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 20, 21, 21, 21, 20, 21, 21, 21, 20, 21, 21, 21, 20, 21, 21, 21, 20, 21, 21, 21, 20, 21, 21, 21, 20, 21, 21, 21, 20, 21, 21, 21, 20, 20, 21, 21, 20, 20, 21, 21, 20, 20, 21, 21, 20, 20, 21, 21, 20, 20, 21, 21, 20, 20, 21, 21, 20, 20, 21, 21, 20, 20, 21, 21, 20, 20, 20, 21, 20, 20, 20, 21, 20, 20, 20, 21, 20, 20, 20, 21, 20, 20, 20, 21, 20, 20, 20, 21, 20, 20, 20, 21, 20, 20, 20, 21, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21];
