import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = folderName.trim();
    if (!trimmed) {
      setError('Please provide a valid folder name.');
      return;
    }
    setError(null);
    onCreateFolder(trimmed);
    setFolderName('');
    onClose();
  };

  return (
    <div className="cl-modal-overlay" onClick={onClose}>
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
            <FolderPlus size={18} color="var(--color-primary)" /> Create New Folder
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-light)',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Folder Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Q4 Campaigns, Product Creatives..."
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                if (error) setError(null);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: error ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            {error && (
              <span style={{ display: 'block', fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                {error}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              className="cl-btn cl-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="cl-btn cl-btn-primary"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

