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
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : new Date(date).toISOString().split('T')[0];
    const [hours, minutes] = time.split(':');
    
    const dateTimeStr = `${dateStr}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    const tempDate = new Date(dateTimeStr);
    
    const fromDateStr = tempDate.toLocaleString('en-US', {
      timeZone: fromTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const fromDate = new Date(fromDateStr.replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6'));

    const toTimeStr = fromDate.toLocaleString('en-US', {
      timeZone: toTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const timeMatch = toTimeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }
    
    return time;
  } catch (err) {
    console.error('Timezone conversion error:', err);
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

