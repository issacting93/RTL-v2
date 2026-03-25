import React from 'react';

interface DocumentRow {
  id: string;
  label?: string;
  cells: { color: string; tooltip?: string }[];
  group?: string;
}

interface DocumentPortraitProps {
  rows: DocumentRow[];
  rowHeight?: number;
  onRowClick?: (id: string) => void;
  activeId?: string;
}

export const DocumentPortrait: React.FC<DocumentPortraitProps> = ({
  rows,
  rowHeight = 4,
  onRowClick,
  activeId,
}) => {
  let lastGroup: string | undefined;

  return (
    <div>
      {rows.map(row => {
        const showGroupHeader = row.group && row.group !== lastGroup;
        lastGroup = row.group;
        const isActive = activeId === row.id;

        return (
          <React.Fragment key={row.id}>
            {showGroupHeader && (
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                padding: '6px 0 2px',
              }}>
                {row.group}
              </div>
            )}
            <div
              title={row.label || row.id}
              onClick={() => onRowClick?.(row.id)}
              style={{
                display: 'flex',
                height: rowHeight,
                marginBottom: '1px',
                cursor: onRowClick ? 'pointer' : 'default',
                borderRadius: '2px',
                overflow: 'hidden',
                outline: isActive ? '2px solid #6366f1' : 'none',
                outlineOffset: '1px',
              }}
            >
              {row.cells.map((cell, i) => (
                <div
                  key={i}
                  title={cell.tooltip}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: '100%',
                    background: cell.color,
                  }}
                />
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
