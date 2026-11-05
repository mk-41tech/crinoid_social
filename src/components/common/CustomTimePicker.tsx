import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { format12Hour, timeToMinutes } from '../../utils/dateValidation';

interface CustomTimePickerProps {
  value: string; // 24-hr "HH:MM"
  onChange: (time24: string) => void;
  isToday: boolean;
  minTimeStr?: string; // e.g. "19:36" (current time + 30 mins)
  hasError?: boolean;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  isToday,
  minTimeStr,
  hasError = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum allowable minutes from midnight for today (at least +30 min from now)
  const minAllowedMinutes = useMemo(() => {
    if (!isToday || !minTimeStr) return 0;
    return timeToMinutes(minTimeStr);
  }, [isToday, minTimeStr]);

  // Parse current 24-hr value into 12-hr parts
  const { hour12, minute, period } = useMemo(() => {
    const [hStr, mStr] = (value || '12:00').split(':');
    let h24 = parseInt(hStr, 10);
    if (isNaN(h24)) h24 = 12;
    const m = parseInt(mStr, 10) || 0;
    const p: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    let h = h24 % 12;
    if (h === 0) h = 12;
    return {
      hour12: h,
      minute: m,
      period: p
    };
  }, [value]);

  // Allowed periods (AM / PM)
  // If today and minAllowedMinutes >= 720 (12:00 PM), AM has passed completely, do not show AM!
  const availablePeriods: ('AM' | 'PM')[] = useMemo(() => {
    if (!isToday) return ['AM', 'PM'];
    if (minAllowedMinutes >= 720) {
      return ['PM'];
    }
    return ['AM', 'PM'];
  }, [isToday, minAllowedMinutes]);

  // Active period: ensure it is in availablePeriods
  const activePeriod = availablePeriods.includes(period) ? period : availablePeriods[0] || 'PM';

  // Available hours (1..12) for the active period
  // Filter out past hours if isToday
  const availableHours = useMemo(() => {
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Standard 12-hour clock order starting at 12
    if (!isToday) return hours;

    return hours.filter(h => {
      // Calculate max minute for this hour in 24-hour format
      const h24 = (h % 12) + (activePeriod === 'PM' ? 12 : 0);
      const maxMinuteOfHour = h24 * 60 + 59;
      return maxMinuteOfHour >= minAllowedMinutes;
    });
  }, [isToday, activePeriod, minAllowedMinutes]);

  // Active hour: ensure it is in availableHours
  const activeHour = availableHours.includes(hour12) ? hour12 : (availableHours[0] ?? 12);

  // Available minutes (00..59) for the active hour and period
  // Filter out past minutes if isToday and this hour matches minimum time threshold
  const availableMinutes = useMemo(() => {
    const allMinutes = Array.from({ length: 60 }, (_, i) => i);
    if (!isToday) return allMinutes;

    const h24 = (activeHour % 12) + (activePeriod === 'PM' ? 12 : 0);
    return allMinutes.filter(m => {
      const slotMinutes = h24 * 60 + m;
      return slotMinutes >= minAllowedMinutes;
    });
  }, [isToday, activeHour, activePeriod, minAllowedMinutes]);

  // Active minute: ensure it is in availableMinutes
  const activeMinute = availableMinutes.includes(minute) ? minute : (availableMinutes[0] ?? 0);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Helper to commit new time
  const updateTime = (newH12: number, newMin: number, newP: 'AM' | 'PM') => {
    let h24 = (newH12 % 12) + (newP === 'PM' ? 12 : 0);
    // Safety check for today
    if (isToday) {
      const totalMins = h24 * 60 + newMin;
      if (totalMins < minAllowedMinutes) {
        // Find first valid combination
        h24 = Math.floor(minAllowedMinutes / 60);
        newMin = minAllowedMinutes % 60;
      }
    }
    const time24 = `${String(h24).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
    onChange(time24);
  };

  const handleSelectHour = (h: number) => {
    // If the currently selected minute is not valid for this new hour, use the first valid minute
    const h24 = (h % 12) + (activePeriod === 'PM' ? 12 : 0);
    let validMin = activeMinute;
    if (isToday && (h24 * 60 + validMin < minAllowedMinutes)) {
      const minForHour = minAllowedMinutes - (h24 * 60);
      validMin = Math.max(0, Math.min(59, minForHour));
    }
    updateTime(h, validMin, activePeriod);
  };

  const handleSelectMinute = (m: number) => {
    updateTime(activeHour, m, activePeriod);
  };

  const handleSelectPeriod = (p: 'AM' | 'PM') => {
    // Check if current hour is valid in new period
    const newHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(h => {
      if (!isToday) return true;
      const h24 = (h % 12) + (p === 'PM' ? 12 : 0);
      return (h24 * 60 + 59) >= minAllowedMinutes;
    });
    const validHour = newHours.includes(activeHour) ? activeHour : (newHours[0] ?? 12);
    const h24 = (validHour % 12) + (p === 'PM' ? 12 : 0);
    let validMin = activeMinute;
    if (isToday && (h24 * 60 + validMin < minAllowedMinutes)) {
      const minForHour = minAllowedMinutes - (h24 * 60);
      validMin = Math.max(0, Math.min(59, minForHour));
    }
    updateTime(validHour, validMin, p);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input Display Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 'var(--radius-md, 6px)',
          border: `1px solid ${hasError ? '#ef4444' : isOpen ? 'var(--color-primary, #0066ff)' : 'var(--border-subtle, #e2e8f0)'}`,
          backgroundColor: hasError ? '#fff5f5' : '#ffffff',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary, #0f172a)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(0, 102, 255, 0.15)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <span>{value ? format12Hour(value) : '--:--'}</span>
        <Clock size={16} style={{ color: 'var(--text-muted, #64748b)', flexShrink: 0 }} />
      </button>

      {/* Custom Picker Dropdown (Columns: Hour, Minute, AM/PM) */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1100,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            width: '240px',
            overflow: 'hidden'
          }}
        >
          {isToday && minTimeStr && (
            <div
              style={{
                padding: '6px 10px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '11px',
                color: '#64748b',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Min schedule time:</span>
              <strong style={{ color: '#0284c7' }}>{format12Hour(minTimeStr)}</strong>
            </div>
          )}

          {/* 3 Columns: Hour | Minute | Period */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              height: '190px',
              padding: '6px 4px'
            }}
          >
            {/* Hours Column */}
            <div
              style={{
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                padding: '2px 4px',
                borderRight: '1px solid #f1f5f9'
              }}
            >
              {availableHours.map(h => {
                const isSelected = h === activeHour;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectHour(h)}
                    style={{
                      padding: '5px 0',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: isSelected ? '#0066ff' : 'transparent',
                      color: isSelected ? '#ffffff' : '#1e293b',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            {/* Minutes Column */}
            <div
              style={{
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                padding: '2px 4px',
                borderRight: '1px solid #f1f5f9'
              }}
            >
              {availableMinutes.map(m => {
                const isSelected = m === activeMinute;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMinute(m)}
                    style={{
                      padding: '5px 0',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: isSelected ? '#0066ff' : 'transparent',
                      color: isSelected ? '#ffffff' : '#1e293b',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            {/* Period Column (AM / PM) */}
            <div
              style={{
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '2px 4px'
              }}
            >
              {availablePeriods.map(p => {
                const isSelected = p === activePeriod;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectPeriod(p)}
                    style={{
                      padding: '6px 0',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: isSelected ? '#0066ff' : 'transparent',
                      color: isSelected ? '#ffffff' : '#1e293b',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'background-color 0.1s ease'
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick confirmation footer */}
          <div
            style={{
              padding: '6px 10px',
              borderTop: '1px solid #f1f5f9',
              backgroundColor: '#fafafa',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#0066ff',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Set Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

