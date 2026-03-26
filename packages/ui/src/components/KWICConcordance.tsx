import React, { useMemo, useState } from 'react';
import { theme } from '../theme';

interface KWICLine {
  left: string;
  keyword: string;
  right: string;
  docId: string;
  position: number;
}

interface KWICConcordanceProps {
  lines: KWICLine[];
  onLineClick?: (line: KWICLine) => void;
  maxLines?: number;
  sortBy?: 'left' | 'right' | 'docId';
}

const SortArrow: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    style={{
      marginLeft: '4px',
      opacity: active ? 1 : 0.3,
      fontSize: '10px',
    }}
  >
    {'\u25BC'}
  </span>
);

export const KWICConcordance: React.FC<KWICConcordanceProps> = ({
  lines,
  onLineClick,
  maxLines = 100,
  sortBy = 'left',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sortedLines = useMemo(() => {
    const sorted = [...lines].sort((a, b) => {
      if (sortBy === 'left') return a.left.localeCompare(b.left);
      if (sortBy === 'right') return a.right.localeCompare(b.right);
      return a.docId.localeCompare(b.docId);
    });
    return sorted.slice(0, maxLines);
  }, [lines, sortBy, maxLines]);

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: theme.colors.text.secondary,
    borderBottom: `2px solid ${theme.colors.border}`,
    cursor: 'default',
    userSelect: 'none',
  };

  return (
    <div
      style={{
        fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
        fontSize: '13px',
        lineHeight: '1.6',
        color: theme.colors.text.primary,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr auto 1fr',
          background: theme.colors.surface,
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <div style={{ ...headerStyle }}>
          Doc
          <SortArrow active={sortBy === 'docId'} />
        </div>
        <div style={{ ...headerStyle, textAlign: 'right' }}>
          Left context
          <SortArrow active={sortBy === 'left'} />
        </div>
        <div
          style={{
            ...headerStyle,
            textAlign: 'center',
            padding: '8px 16px',
          }}
        >
          Keyword
        </div>
        <div style={{ ...headerStyle }}>
          Right context
          <SortArrow active={sortBy === 'right'} />
        </div>
      </div>

      {/* Rows */}
      {sortedLines.map((line, index) => (
        <div
          key={index}
          onClick={() => onLineClick?.(line)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr auto 1fr',
            cursor: onLineClick ? 'pointer' : 'default',
            background:
              hoveredIndex === index
                ? `${theme.colors.primary}08`
                : 'transparent',
            borderBottom: `1px solid ${theme.colors.border}`,
            transition: 'background 120ms ease',
          }}
        >
          {/* Doc ID */}
          <div
            style={{
              padding: '4px 12px',
              color: theme.colors.text.secondary,
              fontSize: '11px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={line.docId}
          >
            {line.docId}
          </div>

          {/* Left context */}
          <div
            style={{
              padding: '4px 8px',
              textAlign: 'right',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: theme.colors.text.secondary,
            }}
          >
            {line.left}
          </div>

          {/* Keyword */}
          <div
            style={{
              padding: '4px 16px',
              fontWeight: 700,
              color: theme.colors.primary,
              whiteSpace: 'nowrap',
            }}
          >
            {line.keyword}
          </div>

          {/* Right context */}
          <div
            style={{
              padding: '4px 8px',
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: theme.colors.text.secondary,
            }}
          >
            {line.right}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {sortedLines.length === 0 && (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            color: theme.colors.text.secondary,
            fontSize: '13px',
          }}
        >
          No concordance lines to display.
        </div>
      )}

      {/* Truncation notice */}
      {lines.length > maxLines && (
        <div
          style={{
            padding: '8px 12px',
            textAlign: 'center',
            color: theme.colors.text.secondary,
            fontSize: '11px',
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          Showing {maxLines} of {lines.length} results
        </div>
      )}
    </div>
  );
};
