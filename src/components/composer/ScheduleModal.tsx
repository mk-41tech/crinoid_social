import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, Globe, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { SocialPlatform } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';
import { 
  getZonedNow, 
  validateScheduleDateTime, 
  generateTimeSlotOptions,
  format12Hour,
  timeToMinutes
} from '../../utils/dateValidation';

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
  const [timezone, setTimezone] = useState('UTC+05:30 (IST)');

  // Get current zoned time for the active timezone
  const zonedNow = useMemo(() => getZonedNow(timezone), [timezone]);

  // Default date: must strictly default to today's date in the selected timezone
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

  // Default time: next upcoming slot in the selected timezone
  const getInitialTime = () => {
    const zoned = getZonedNow(timezone);
    if (initialScheduledAt && initialScheduledAt.includes('T')) {
      const timePart = initialScheduledAt.split('T')[1];
      const match = timePart.match(/^\d{2}:\d{2}/);
      if (match) {
        const parsedTime = match[0];
        // If initial date is today, check if time is strictly future
        const initialDate = initialScheduledAt.split('T')[0];
        if (initialDate === zoned.todayDateStr) {
          if (timeToMinutes(parsedTime) > zoned.currentMinutes) {
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

  // Available hourly time slot options
  const timeSlots = useMemo(() => {
    return generateTimeSlotOptions(date, timezone);
  }, [date, timezone]);

  // When date changes: if user switches back to today and currently selected time is past,
  // show error and keep user informed
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  // Quick helper to offset time by minutes
  const handleQuickOffset = (minutesToAdd: number) => {
    const now = getZonedNow(timezone);
    const targetZoned = new Date(now.nowZoned.getTime() + minutesToAdd * 60000);
    const yyyy = targetZoned.getFullYear();
    const mm = String(targetZoned.getMonth() + 1).padStart(2, '0');
    const dd = String(targetZoned.getDate()).padStart(2, '0');
    const hh = String(targetZoned.getHours()).padStart(2, '0');
    const min = String(targetZoned.getMinutes()).padStart(2, '0');

    setDate(`${yyyy}-${mm}-${dd}`);
    setTime(`${hh}:${min}`);
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
          maxWidth: '500px',
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

            {/* Schedule Time */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Schedule Time
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="time"
                  value={time}
                  min={isToday ? zonedNow.minTimeForToday : undefined}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${validation.isTimePast ? '#ef4444' : 'var(--border-subtle)'}`,
                    backgroundColor: validation.isTimePast ? '#fff5f5' : '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                />
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                {time ? format12Hour(time) : '--:--'}
              </div>
            </div>
          </div>

          {/* Validation Error Banner (When user picks or enters a past date or time) */}
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

          {/* Quick Preset Buttons */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Quick Upcoming Slots
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Current: {format12Hour(zonedNow.currentTimeStr)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickOffset(15)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                +15 mins
              </button>
              <button
                type="button"
                onClick={() => handleQuickOffset(30)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                +30 mins
              </button>
              <button
                type="button"
                onClick={() => handleQuickOffset(60)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                +1 hour
              </button>
              <button
                type="button"
                onClick={() => handleQuickOffset(120)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                +2 hours
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date(zonedNow.nowZoned.getTime() + 24 * 3600000);
                  const y = tomorrow.getFullYear();
                  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
                  const d = String(tomorrow.getDate()).padStart(2, '0');
                  setDate(`${y}-${m}-${d}`);
                  setTime('10:00');
                }}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                Tomorrow 10 AM
              </button>
            </div>
          </div>

          {/* Time Slots Selector (Hourly Slots showing Disabled vs Available) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isToday ? "Today's Time Slots (Past slots disabled)" : "Time Slots (All available)"}
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px',
                maxHeight: '112px',
                overflowY: 'auto',
                padding: '4px 2px'
              }}
            >
              {timeSlots.map(slot => {
                const isSelected = time === slot.timeStr;
                return (
                  <button
                    key={slot.timeStr}
                    type="button"
                    disabled={slot.isPast}
                    onClick={() => setTime(slot.timeStr)}
                    title={slot.isPast ? `${slot.label} — Disabled (Past time)` : `Select ${slot.label}`}
                    style={{
                      padding: '6px 4px',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected
                        ? 'var(--color-primary)'
                        : slot.isPast
                        ? '#f1f5f9'
                        : '#ffffff',
                      color: isSelected
                        ? '#ffffff'
                        : slot.isPast
                        ? '#94a3b8'
                        : 'var(--text-primary)',
                      cursor: slot.isPast ? 'not-allowed' : 'pointer',
                      textDecoration: slot.isPast ? 'line-through' : 'none',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timezone Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="UTC+05:30 (IST)">UTC+05:30 (India Standard Time)</option>
              <option value="UTC+00:00 (GMT)">UTC+00:00 (Greenwich Mean Time)</option>
              <option value="UTC-05:00 (EST)">UTC-05:00 (Eastern Standard Time)</option>
              <option value="UTC-08:00 (PST)">UTC-08:00 (Pacific Standard Time)</option>
              <option value="UTC+01:00 (CET)">UTC+01:00 (Central European Time)</option>
            </select>
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
