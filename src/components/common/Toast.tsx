import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => {
        let icon = <Info size={18} color="#3b82f6" />;
        let borderColor = '#93c5fd';
        let bgColor = '#eff6ff';
        let textColor = '#1e3a8a';

        if (toast.type === 'success') {
          icon = <CheckCircle2 size={18} color="#10b981" />;
          borderColor = '#a7f3d0';
          bgColor = '#ecfdf5';
          textColor = '#065f46';
        } else if (toast.type === 'warning') {
          icon = <AlertCircle size={18} color="#f59e0b" />;
          borderColor = '#fde68a';
          bgColor = '#fffbeb';
          textColor = '#92400e';
        } else if (toast.type === 'error') {
          icon = <XCircle size={18} color="#ef4444" />;
          borderColor = '#fecaca';
          bgColor = '#fef2f2';
          textColor = '#991b1b';
        }

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
              animation: 'slideIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {icon}
              <span style={{ fontSize: '13px', fontWeight: 500, color: textColor }}>
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: textColor,
                opacity: 0.7,
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
