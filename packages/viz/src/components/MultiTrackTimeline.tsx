import React from 'react';

interface Track {
  id: string;
  label: string;
  cells: { value: string; color: string; tooltip?: string }[];
}

interface MultiTrackTimelineProps {
  tracks: Track[];
  cellSize?: number;
  onCellClick?: (trackId: string, index: number) => void;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  tracks,
  cellSize = 16,
  onCellClick,
}) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      {tracks.map(track => (
        <div key={track.id} style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2px',
        }}>
          <div style={{
            minWidth: '40px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
          }}>
            {track.label}
          </div>
          <div style={{ display: 'flex', gap: '1px' }}>
            {track.cells.map((cell, i) => (
              <div
                key={i}
                title={cell.tooltip || `${track.label}: ${cell.value}`}
                onClick={() => onCellClick?.(track.id, i)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: cell.color,
                  borderRadius: '2px',
                  cursor: onCellClick ? 'pointer' : 'default',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
