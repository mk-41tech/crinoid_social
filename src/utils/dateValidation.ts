/**
 * Timezone and Date/Time Scheduling Validation Utility
 * Enforces strictly upcoming date and time selection across all timezones.
 * Restricts scheduling to at least 30 minutes in advance from current time.
 */

export interface ZonedTimeInfo {
  nowZoned: Date;
  todayDateStr: string;      // YYYY-MM-DD in selected timezone
  currentTimeStr: string;    // HH:MM (24-hour) in selected timezone
  currentMinutes: number;    // Minutes from midnight (0..1439)
  minTimeForToday: string;   // HH:MM strictly upcoming time for today (current + 30 min)
  nextSuggestedTime: string; // HH:MM rounded to next 15-min slot after +30 min
}

export interface TimeSlotOption {
  timeStr: string;      // "10:00"
  label: string;        // "10:00 AM"
  isPast: boolean;      // Whether it is earlier than minimum allowed time
  isAvailable: boolean; // Whether user can select it
}

export interface ScheduleValidationResult {
  isValid: boolean;
  error?: string;
  isDatePast: boolean;
  isTimePast: boolean;
  isToday: boolean;
}

/**
 * Extracts offset minutes from timezone label (e.g. "UTC+05:30 (IST)" -> +330, "UTC-05:00 (EST)" -> -300)
 */
export function getTimezoneOffsetMinutes(tzString: string): number {
  if (!tzString) return -new Date().getTimezoneOffset();
  const match = tzString.match(/UTC([+-])(\d{2}):(\d{2})/i);
  if (match) {
    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const mins = parseInt(match[3], 10);
    return sign * (hours * 60 + mins);
  }
  return -new Date().getTimezoneOffset();
}

/**
 * Returns current date, time, and minutes in the requested timezone.
 */
export function getZonedNow(tzString: string): ZonedTimeInfo {
  const offsetMins = getTimezoneOffsetMinutes(tzString);
  const now = new Date();
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const nowZoned = new Date(utcMs + (offsetMins * 60000));

  const yyyy = nowZoned.getFullYear();
  const mm = String(nowZoned.getMonth() + 1).padStart(2, '0');
  const dd = String(nowZoned.getDate()).padStart(2, '0');
  const curH = nowZoned.getHours();
  const curM = nowZoned.getMinutes();

  const todayDateStr = `${yyyy}-${mm}-${dd}`;
  const currentTimeStr = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`;
  const currentMinutes = curH * 60 + curM;

  // Strict minimum time for today: at least 30 minutes in advance
  const minRequiredMinutes = currentMinutes + 30;
  const minH = Math.floor(minRequiredMinutes / 60);
  const minM = minRequiredMinutes % 60;
  const minTimeForToday = minRequiredMinutes < 1440
    ? `${String(minH).padStart(2, '0')}:${String(minM).padStart(2, '0')}`
    : '23:59';

  // Suggested default time: rounded to next 15-minute slot at or after minimum 30 minutes
  const roundedMins = Math.min(1439, Math.ceil(minRequiredMinutes / 15) * 15);
  let sugH = Math.floor(roundedMins / 60);
  let sugM = roundedMins % 60;
  if (sugH >= 24) {
    sugH = 23;
    sugM = 59;
  }
  const nextSuggestedTime = `${String(sugH).padStart(2, '0')}:${String(sugM).padStart(2, '0')}`;

  return {
    nowZoned,
    todayDateStr,
    currentTimeStr,
    currentMinutes,
    minTimeForToday,
    nextSuggestedTime
  };
}

/**
 * Formats a 24-hour "HH:MM" string into "hh:mm AM/PM"
 */
export function format12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

/**
 * Parses minutes from midnight (0..1439) for a "HH:MM" string
 */
export function timeToMinutes(time24: string): number {
  if (!time24) return 0;
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return h * 60 + m;
}

/**
 * Validates selected date and time against the current zoned time.
 */
export function validateScheduleDateTime(
  dateStr: string,
  timeStr: string,
  tzString: string
): ScheduleValidationResult {
  if (!dateStr || !timeStr) {
    return {
      isValid: false,
      error: 'Please select both a date and a time.',
      isDatePast: false,
      isTimePast: false,
      isToday: false
    };
  }

  const zoned = getZonedNow(tzString);
  const isDatePast = dateStr < zoned.todayDateStr;
  const isToday = dateStr === zoned.todayDateStr;

  if (isDatePast) {
    return {
      isValid: false,
      error: 'Past dates cannot be selected. Please choose today or a future date.',
      isDatePast: true,
      isTimePast: false,
      isToday: false
    };
  }

  if (isToday) {
    const selMinutes = timeToMinutes(timeStr);
    const minAllowedMinutes = zoned.currentMinutes + 30;
    if (selMinutes < minAllowedMinutes) {
      return {
        isValid: false,
        error: `Schedule time must be at least 30 minutes in advance (minimum: ${format12Hour(zoned.minTimeForToday)}). Previous timings cannot be scheduled.`,
        isDatePast: false,
        isTimePast: true,
        isToday: true
      };
    }
  }

  return {
    isValid: true,
    isDatePast: false,
    isTimePast: false,
    isToday
  };
}

/**
 * Generates sample hourly time slots from 08:00 to 22:00
 * Previous timings are completely filtered out so they are not shown.
 */
export function generateTimeSlotOptions(dateStr: string, tzString: string): TimeSlotOption[] {
  const zoned = getZonedNow(tzString);
  const isToday = dateStr === zoned.todayDateStr;
  const isDatePast = dateStr < zoned.todayDateStr;

  if (isDatePast) {
    return [];
  }

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  const slots = hours.map(h => {
    const timeStr = `${String(h).padStart(2, '0')}:00`;
    const label = format12Hour(timeStr);
    const slotMinutes = h * 60;

    let isPast = false;
    let isAvailable = true;

    if (isToday) {
      // Slot must be at least 30 minutes after current time
      if (slotMinutes < zoned.currentMinutes + 30) {
        isPast = true;
        isAvailable = false;
      }
    }

    return {
      timeStr,
      label,
      isPast,
      isAvailable
    };
  });

  // When date is today, previous timings will not be shown
  if (isToday) {
    return slots.filter(slot => slot.isAvailable);
  }

  return slots;
}
