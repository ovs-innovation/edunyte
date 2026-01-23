// Common timezones list (fallback if Intl.supportedValuesOf is not available)
const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  'Pacific/Honolulu',
];

// Get timezone label with abbreviation
function getTimezoneLabel(tz: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const abbreviation = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    
    // Format: "Continent/City (Abbreviation)"
    return abbreviation ? `${tz} (${abbreviation})` : tz;
  } catch {
    return tz;
  }
}

// Get all available timezones using Intl API
export function getAllTimezones(): Array<{ value: string; label: string }> {
  try {
    // Check if Intl.supportedValuesOf is available (Chrome 99+, Firefox 101+, Safari 15.4+)
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      const timezones = Intl.supportedValuesOf('timeZone');
      
      return timezones
        .map((tz) => ({
          value: tz,
          label: getTimezoneLabel(tz),
        }))
        .sort((a, b) => a.value.localeCompare(b.value));
    } else {
      // Fallback for older browsers
      return COMMON_TIMEZONES.map((tz) => ({
        value: tz,
        label: getTimezoneLabel(tz),
      }));
    }
  } catch (error) {
    // Final fallback
    return COMMON_TIMEZONES.map((tz) => ({
      value: tz,
      label: tz,
    }));
  }
}

// Get user's local timezone
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

