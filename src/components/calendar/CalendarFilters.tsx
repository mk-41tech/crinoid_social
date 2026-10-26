import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarFilterState, PostCalendarStatus } from './types';
import { SocialPlatform } from '../../types';
import { 
  Filter, 
  X, 
  Search, 
  RotateCcw,
  ChevronDown,
  Building2,
  Share2,
  Layers,
  Activity,
  Tag,
  User,
  UserCheck
} from 'lucide-react';

interface CalendarFiltersProps {
  filters: CalendarFilterState;
  onFilterChange: (updates: Partial<CalendarFilterState>) => void;
  onClearFilters: () => void;
  campaigns?: string[];
  authors?: { id: string; name: string }[];
  approvers?: { id: string; name: string }[];
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  campaigns = ['Product Launch 2026', 'Brand Awareness', 'Spring Sale', 'Tech Highlights', 'Community Spotlight'],
  authors = [
    { id: 'u-1', name: 'Muthukumar (Social Lead)' },
    { id: 'u-2', name: 'Priya (Content Creator)' },
    { id: 'u-3', name: 'Karthik (Approver)' }
  ],
  approvers = [
    { id: 'u-3', name: 'Karthik (Approver)' },
    { id: 'u-1', name: 'Muthukumar (Social Lead)' }
  ]
}) => {
  const { brands, currentBrandAccounts, switchBrand } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute active filters count
  const activeCount = [
    filters.searchQuery !== '',
    filters.brandId !== 'all',
    filters.socialAccountId !== 'all',
    filters.platform !== 'all',
    filters.status !== 'all',
    filters.campaign !== 'all',
    filters.authorId !== 'all',
    filters.approverId !== 'all'
  ].filter(Boolean).length;

  const platforms: { value: SocialPlatform | 'all'; label: string }[] = [
    { value: 'all', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'youtube', label: 'YouTube' }
  ];

  const statuses: { value: PostCalendarStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'published', label: 'Published' },
    { value: 'failed', label: 'Failed' }
  ];

  return (
    <div className="cal-filters-bar" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '12px 16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search scheduled posts..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              fontSize: '13px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              outline: 'none',
              backgroundColor: 'var(--bg-subtle)'
            }}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-light)',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Primary Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Platform Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={filters.platform}
              onChange={(e) => onFilterChange({ platform: e.target.value as SocialPlatform | 'all' })}
              style={{
                padding: '6px 28px 6px 10px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: filters.platform !== 'all' ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: filters.platform !== 'all' ? 'var(--color-primary-light)' : '#ffffff',
                color: filters.platform !== 'all' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: filters.platform !== 'all' ? 600 : 500,
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              {platforms.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)' }} />
          </div>

          {/* Status Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value as PostCalendarStatus | 'all' })}
              style={{
                padding: '6px 28px 6px 10px',
                fontSize: '12.5px',
                borderRadius: '6px',
                border: filters.status !== 'all' ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: filters.status !== 'all' ? 'var(--color-primary-light)' : '#ffffff',
                color: filters.status !== 'all' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: filters.status !== 'all' ? 600 : 500,
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)' }} />
          </div>

          {/* More Filters Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: activeCount > 0 ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              backgroundColor: isExpanded ? 'var(--bg-muted)' : '#ffffff',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Filter size={14} />
            <span>More Filters</span>
            {activeCount > 0 && (
              <span style={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '10.5px',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '1px 6px'
              }}>
                {activeCount}
              </span>
            )}
            <ChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Reset Filters */}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              title="Clear all filters"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Row for all 7 required filters */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Workspace / Brand */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              <Building2 size={12} /> Workspace / Brand
            </label>
            <select
              value={filters.brandId}
              onChange={(e) => {
                const val = e.target.value;
                onFilterChange({ brandId: val });
                if (val !== 'all') switchBrand(val);
              }}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
            >
              <option value="all">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Social Account */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              <Share2 size={12} /> Social Account
            </label>
            <select
              value={filters.socialAccountId}
              onChange={(e) => onFilterChange({ socialAccountId: e.target.value })}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
            >
              <option value="all">All Accounts</option>
              {currentBrandAccounts.map(a => (
                <option key={a.id} value={a.id}>@{a.username} ({a.platform})</option>
              ))}
            </select>
          </div>

          {/* Campaign */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              <Tag size={12} /> Campaign
            </label>
            <select
              value={filters.campaign}
              onChange={(e) => onFilterChange({ campaign: e.target.value })}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              <User size={12} /> Author
            </label>
            <select
              value={filters.authorId}
              onChange={(e) => onFilterChange({ authorId: e.target.value })}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
            >
              <option value="all">All Authors</option>
              {authors.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Approver */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              <UserCheck size={12} /> Approver
            </label>
            <select
              value={filters.approverId}
              onChange={(e) => onFilterChange({ approverId: e.target.value })}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
            >
              <option value="all">All Approvers</option>
              {approvers.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>Active filters:</span>
          {filters.platform !== 'all' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', fontSize: '11.5px' }}>
              Platform: {filters.platform}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => onFilterChange({ platform: 'all' })} />
            </span>
          )}
          {filters.status !== 'all' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', fontSize: '11.5px' }}>
              Status: {filters.status}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => onFilterChange({ status: 'all' })} />
            </span>
          )}
          {filters.campaign !== 'all' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', fontSize: '11.5px' }}>
              Campaign: {filters.campaign}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => onFilterChange({ campaign: 'all' })} />
            </span>
          )}
          {filters.authorId !== 'all' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', fontSize: '11.5px' }}>
              Author filtered
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => onFilterChange({ authorId: 'all' })} />
            </span>
          )}
          {filters.approverId !== 'all' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', fontSize: '11.5px' }}>
              Approver filtered
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => onFilterChange({ approverId: 'all' })} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
