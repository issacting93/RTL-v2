import React, { useState } from 'react';
import { Play, CheckCircle, Clock, Search, RefreshCw } from 'lucide-react';
import { theme } from '../theme';

export interface SequenceBatchItem {
  id: string;
  external_id: string;
  turn_range: string | [number, number];
  stance: string | null;
  status: 'pending' | 'coded' | 'partially_coded';
  coder_count?: number;
}

interface SequenceBatchManagerProps {
  items: SequenceBatchItem[];
  loading?: boolean;
  currentId?: string;
  onSelect: (item: SequenceBatchItem) => void;
  onRefresh?: () => void;
}

export const SequenceBatchManager: React.FC<SequenceBatchManagerProps> = ({
  items,
  loading = false,
  currentId,
  onSelect,
  onRefresh
}) => {
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(item => 
    item.external_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: theme.colors.text.primary }}>
          Sequence Batch Manager
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'white', 
            padding: '8px 16px', 
            borderRadius: theme.radius.md, 
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm
          }}>
            <Search size={14} color={theme.colors.text.secondary} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', marginLeft: '8px', width: '200px' }}
            />
          </div>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`,
                background: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          )}
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: theme.radius.lg, 
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden',
        boxShadow: theme.shadows.md
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: theme.colors.backgroundSubtle, textAlign: 'left', borderBottom: `1px solid ${theme.colors.border}` }}>
              <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: theme.colors.text.secondary, fontWeight: 700 }}>Sequence ID</th>
              <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: theme.colors.text.secondary, fontWeight: 700 }}>Turn Range</th>
              <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: theme.colors.text.secondary, fontWeight: 700 }}>Global Stance</th>
              <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: theme.colors.text.secondary, fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: theme.colors.text.secondary, fontWeight: 700, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: theme.colors.text.secondary }}>Loading sequences...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: theme.colors.text.secondary }}>No sequences found.</td></tr>
            ) : filteredItems.map((item) => {
              const isActive = currentId === item.id;
              return (
                <tr key={item.id} style={{ 
                  borderBottom: `1px solid ${theme.colors.border}`, 
                  background: isActive ? 'rgba(99, 102, 241, 0.03)' : 'white',
                  transition: 'background 0.2s ease'
                }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: theme.colors.text.primary }}>{item.external_id}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: theme.colors.text.secondary }}>
                    {Array.isArray(item.turn_range) ? `${item.turn_range[0]} - ${item.turn_range[1]}` : item.turn_range}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ 
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: item.stance ? 'rgba(34, 197, 94, 0.1)' : theme.colors.backgroundSubtle,
                      color: item.stance ? theme.colors.accent : theme.colors.text.secondary,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {item.stance || 'Pending'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {item.status === 'coded' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.accent, fontSize: '12px', fontWeight: 700 }}>
                        <CheckCircle size={14} /> {item.coder_count || 1} Coder(s)
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.text.secondary, fontSize: '12px' }}>
                        <Clock size={14} /> {item.status === 'partially_coded' ? 'InProgress' : 'Pending'}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => onSelect(item)}
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: theme.radius.md,
                        background: isActive ? theme.colors.primary : 'white',
                        color: isActive ? 'white' : theme.colors.text.primary,
                        border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isActive ? 'Current' : 'Code'} <Play size={12} fill={isActive ? 'white' : 'none'} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
