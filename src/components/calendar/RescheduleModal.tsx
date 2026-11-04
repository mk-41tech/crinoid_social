import React, { useState, useMemo } from 'react';
import { CalendarPost } from './types';
import { Calendar as CalendarIcon, Clock, X, AlertCircle, Check } from 'lucide-react';
import { 
  getZonedNow, 
  validateScheduleDateTime, 
  generateTimeSlotOptions,
  format12Hour,
  timeToMinutes
} from '../../utils/dateValidation';

interface RescheduleModalProps {
  post: CalendarPost | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (postId: string, newDateTime: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  post,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !post) return null;

  const timezone = 'UTC+05:30 (IST)';
  const zonedNow = getZonedNow(timezone);

  const getInitialDate = () => {
    if (post.scheduledAt && post.scheduledAt.includes('T')) {
      const parsedDate = post.scheduledAt.split('T')[0];
      if (parsedDate >= zonedNow.todayDateStr) {
        return parsedDate;
      }
    }
    return zonedNow.todayDateStr;
  };

  const getInitialTime = () => {
    if (post.scheduledAt && post.scheduledAt.includes('T')) {
      const parsedDate = post.scheduledAt.split('T')[0];
      const parsedTime = post.scheduledAt.split('T')[1].substring(0, 5);
      if (parsedDate > zonedNow.todayDateStr) {
        return parsedTime;
      }
      if (parsedDate === zonedNow.todayDateStr && timeToMinutes(parsedTime) > zonedNow.currentMinutes) {
        return parsedTime;
      }
    }
    return zonedNow.nextSuggestedTime;
  };

  const [date, setDate] = useState(getInitialDate);
  const [time, setTime] = useState(getInitialTime);

  // Dynamic Validation
  const validation = useMemo(() => {
    return validateScheduleDateTime(date, time, timezone);
  }, [date, time, timezone]);

  const isToday = date === zonedNow.todayDateStr;
  const timeSlots = useMemo(() => {
    return generateTimeSlotOptions(date, timezone);
  }, [date, timezone]);

  const handleSave = () => {
    const currentValidation = validateScheduleDateTime(date, time, timezone);
    if (!currentValidation.isValid) {
      return;
    }
    const newDateTime = `${date}T${time}:00`;
    onConfirm(post.id, newDateTime);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Reschedule Post
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Post preview */}
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>Post Preview</p>
            <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.caption || 'No caption text'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                New Date (Upcoming Only)
              </label>
              <input
                type="date"
                value={date}
                min={zonedNow.todayDateStr}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${validation.isDatePast ? '#dc2626' : 'var(--border-subtle)'}`,
                  fontSize: '13px',
                  backgroundColor: validation.isDatePast ? '#fef2f2' : '#ffffff'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                New Time {isToday && '(Upcoming Only)'}
              </label>
              <input
                type="time"
                value={time}
                min={isToday ? zonedNow.minTimeForToday : undefined}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${validation.isTimePast ? '#dc2626' : 'var(--border-subtle)'}`,
                  fontSize: '13px',
                  backgroundColor: validation.isTimePast ? '#fef2f2' : '#ffffff'
                }}
              />
            </div>
          </div>

          {/* Validation Error Banner */}
          {!validation.isValid && validation.error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '6px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              fontSize: '12px',
              lineHeight: '1.4',
              marginBottom: '12px',
              border: '1px solid #fecaca'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Invalid Schedule Time:</strong> {validation.error}
              </div>
            </div>
          )}

          {/* Quick Hourly Time Slots */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {isToday ? "Available Time Slots (Past slots disabled)" : "Time Slots (All available)"}
            </span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              maxHeight: '96px',
              overflowY: 'auto',
              padding: '2px'
            }}>
              {timeSlots.map(slot => {
                const isSelected = time === slot.timeStr;
                return (
                  <button
                    key={slot.timeStr}
                    type="button"
                    disabled={slot.isPast}
                    onClick={() => setTime(slot.timeStr)}
                    title={slot.isPast ? `${slot.label} (Past time)` : `Select ${slot.label}`}
                    style={{
                      padding: '5px 4px',
                      fontSize: '11px',
                      borderRadius: '6px',
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
                      fontWeight: isSelected ? 600 : 500
                    }}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>Rescheduling updates the scheduled queue and will publish automatically at the new time ({timezone}).</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 14px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!validation.isValid}
            style={{
              padding: '7px 16px',
              fontSize: '13px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: validation.isValid ? 'pointer' : 'not-allowed',
              opacity: validation.isValid ? 1 : 0.6
            }}
          >
            Update Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
