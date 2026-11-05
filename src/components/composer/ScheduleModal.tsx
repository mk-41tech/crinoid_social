import React, { useState, useMemo } from 'react';
import { Calendar, Globe, X, Check, AlertCircle } from 'lucide-react';
import { SocialPlatform } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';
import { 
  getZonedNow, 
  validateScheduleDateTime, 
  format12Hour,
  timeToMinutes
} from '../../utils/dateValidation';
import { CustomTimePicker } from '../common/CustomTimePicker';

interface ScheduleModalProps {
  selectedPlatforms: SocialPlatform[];
  onConfirmSchedule: (datetime: string, timezone: string) => void;
  onClose: () => void;
  initialScheduledAt?: string;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  selectedPlatforms,
  onConfirmSchedule,
  onClose,
  initialScheduledAt
}) => {
  // Fixed strictly to Indian Standard Time (IST)
  const timezone = 'UTC+05:30 (IST)';

  // Get current zoned time for IST
  const zonedNow = useMemo(() => getZonedNow(timezone), [timezone]);

  // Default date: strictly defaults to today's date or upcoming date
  const getInitialDate = () => {
    const today = getZonedNow(timezone).todayDateStr;
    if (initialScheduledAt) {
      const parsedDate = initialScheduledAt.includes('T')
        ? initialScheduledAt.split('T')[0]
        : (/^\d{4}-\d{2}-\d{2}/.test(initialScheduledAt) ? initialScheduledAt.substring(0, 10) : '');
      if (parsedDate && parsedDate >= today) {
        return parsedDate;
      }
    }
    return today;
  };

  // Default time: strictly at least 30 minutes in advance
  const getInitialTime = () => {
    const zoned = getZonedNow(timezone);
    if (initialScheduledAt && initialScheduledAt.includes('T')) {
      const timePart = initialScheduledAt.split('T')[1];
      const match = timePart.match(/^\d{2}:\d{2}/);
      if (match) {
        const parsedTime = match[0];
        const initialDate = initialScheduledAt.split('T')[0];
        if (initialDate === zoned.todayDateStr) {
          if (timeToMinutes(parsedTime) >= zoned.currentMinutes + 30) {
            return parsedTime;
          }
        } else if (initialDate > zoned.todayDateStr) {
          return parsedTime;
        }
      }
    }
    return zoned.nextSuggestedTime;
  };

  const [date, setDate] = useState<string>(getInitialDate);
  const [time, setTime] = useState<string>(getInitialTime);

  // Dynamic Validation
  const validation = useMemo(() => {
    return validateScheduleDateTime(date, time, timezone);
  }, [date, time, timezone]);

  // When date changes: if user switches to today and time is < 30 mins, update to nextSuggestedTime
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const zoned = getZonedNow(timezone);
    if (newDate === zoned.todayDateStr) {
      if (timeToMinutes(time) < zoned.currentMinutes + 30) {
        setTime(zoned.nextSuggestedTime);
      }
    }
  };

  // Handle scheduling submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentValidation = validateScheduleDateTime(date, time, timezone);
    if (!currentValidation.isValid) {
      return;
    }

    const scheduledDateTime = `${date}T${time}:00`;
    onConfirmSchedule(scheduledDateTime, timezone);
    onClose();
  };

  const isToday = date === zonedNow.todayDateStr;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--color-primary)" />
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Schedule Post
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target platforms summary */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Publishing Channels ({selectedPlatforms.length})
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selectedPlatforms.map(p => (
                <span
                  key={p}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: PLATFORM_CONFIG[p].bgColor,
                    color: PLATFORM_CONFIG[p].brandColor
                  }}
                >
                  {PLATFORM_CONFIG[p].name}
                </span>
              ))}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Schedule Date */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Schedule Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={date}
                  min={zonedNow.todayDateStr}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${validation.isDatePast ? '#ef4444' : 'var(--border-subtle)'}`,
                    backgroundColor: validation.isDatePast ? '#fff5f5' : '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                />
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {isToday ? "Today (Upcoming times only)" : "Future Date"}
              </div>
            </div>

            {/* Schedule Time (Custom time picker - previous timings not shown) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Schedule Time
              </label>
              <CustomTimePicker
                value={time}
                onChange={(newTime) => setTime(newTime)}
                isToday={isToday}
                minTimeStr={zonedNow.minTimeForToday}
                hasError={validation.isTimePast}
              />
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {isToday ? `Min. 30 min in advance (${format12Hour(zonedNow.minTimeForToday)})` : 'Upcoming timing'}
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          {!validation.isValid && validation.error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '12px',
                lineHeight: '1.4'
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{validation.error}</span>
            </div>
          )}

          {/* Timezone (Fixed to Indian Standard Time) */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Timezone
            </label>
            <div
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                backgroundColor: '#f8fafc',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Globe size={15} color="var(--color-primary)" />
              <span style={{ fontWeight: 500 }}>UTC+05:30 (India Standard Time)</span>
            </div>
          </div>

          {/* Actions Footer */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validation.isValid}
              className="btn btn-primary btn-sm"
              style={{
                cursor: validation.isValid ? 'pointer' : 'not-allowed',
                opacity: validation.isValid ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={14} />
              <span>Schedule Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
