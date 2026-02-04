import { DateTime } from "luxon";

/**
 * Timezone Helper Utilities
 * Converts times between different timezones
 */

/**
 * Convert a time from one timezone to another
 * @param {Date} date - The date object
 * @param {String} time - Time string in HH:mm format
 * @param {String} fromTimezone - Source timezone (e.g., 'Asia/Calcutta')
 * @param {String} toTimezone - Target timezone (e.g., 'America/New_York')
 * @returns {String} - Time string in HH:mm format in target timezone
 */
export const convertTimeBetweenTimezones = (date, time, fromTimezone, toTimezone) => {
  if (!fromTimezone || !toTimezone || fromTimezone === toTimezone) {
    return time;
  }

  try {
    const baseDate = date instanceof Date ? date : new Date(date);
    const [hours, minutes] = time.split(":").map((v) => parseInt(v, 10) || 0);

    // Treat year/month/day as wall-clock date in fromTimezone
    const fromDateTime = DateTime.fromObject(
      {
        year: baseDate.getFullYear(),
        month: baseDate.getMonth() + 1,
        day: baseDate.getDate(),
        hour: hours,
        minute: minutes,
        second: 0,
        millisecond: 0,
      },
      { zone: fromTimezone }
    );

    const toDateTime = fromDateTime.setZone(toTimezone);
    return toDateTime.toFormat("HH:mm");
  } catch (err) {
    console.error("Timezone conversion error:", err);
    return time;
  }
};

/**
 * Get timezone offset string (e.g., "GMT +5:30")
 */
export const getTimezoneOffset = (timezone) => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset',
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart ? offsetPart.value : 'UTC';
  } catch (err) {
    return 'UTC';
  }
};

/**
 * Combine a calendar date + local time + source timezone into a UTC Date.
 * This is the single source of truth for how we derive absolute instants.
 */
export const toUTCDate = (date, time, timezone) => {
  const baseDate = date instanceof Date ? date : new Date(date);
  const [hours, minutes] = (time || "00:00").split(":").map((v) => parseInt(v, 10) || 0);

  const dt = DateTime.fromObject(
    {
      year: baseDate.getFullYear(),
      month: baseDate.getMonth() + 1,
      day: baseDate.getDate(),
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0,
    },
    { zone: timezone || "UTC" }
  ).toUTC();

  return dt.toJSDate();
};

/**
 * Convert a UTC Date into a local time string ("HH:mm") in the target timezone.
 */
export const utcDateToLocalTime = (utcDate, timezone) => {
  if (!utcDate) return "";
  const dt = DateTime.fromJSDate(utcDate, { zone: "utc" }).setZone(timezone || "UTC");
  return dt.toFormat("HH:mm");
};

