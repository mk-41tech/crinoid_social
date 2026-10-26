import React, { useState } from 'react';
import { Calendar, Clock, Globe, X, Check, AlertCircle } from 'lucide-react';
import { SocialPlatform } from '../../types';
import { PLATFORM_CONFIG } from '../../config/platformsConfig';

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
  // Initialize date from initialScheduledAt (e.g. from calendar date selection) or default to tomorrow
  const getInitialDate = () => {
    if (initialScheduledAt) {
      if (initialScheduledAt.includes('T')) {
        return initialScheduledAt.split('T')[0];
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(initialScheduledAt)) {
        return initialScheduledAt.substring(0, 10);
      }
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getInitialTime = () => {
    if (initialScheduledAt && initialScheduledAt.includes('T')) {
      const timePart = initialScheduledAt.split('T')[1];
      const match = timePart.match(/^\d{2}:\d{2}/);
      if (match) return match[0];
    }
    return '10:00';
  };

  const [date, setDate] = useState(getInitialDate);
  const [time, setTime] = useState(getInitialTime);
  const [timezone, setTimezone] = useState('UTC+05:30 (IST)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledDateTime = `${date}T${time}:00`;
    onConfirmSchedule(scheduledDateTime, timezone);
    onClose();
  };

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Schedule Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Schedule Time
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

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
              className="btn btn-primary btn-sm"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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
