import React, { useMemo } from 'react';
import { theme } from '../theme';

interface CodeSpan {
  codeId: string;
  codeLabel: string;
  color: string;
  startChar: number;
  endChar: number;
}

interface CodeStripeDocumentProps {
  text: string;
  codeSpans: CodeSpan[];
  visibleCodes?: string[];
  onSpanClick?: (span: CodeSpan) => void;
  highlightCodeId?: string;
  lineHeight?: number;
}

export const CodeStripeDocument: React.FC<CodeStripeDocumentProps> = ({
  text,
  codeSpans,
  visibleCodes,
  onSpanClick,
  highlightCodeId,
  lineHeight = 24,
}) => {
  const lines = useMemo(() => text.split('\n'), [text]);

  const filteredSpans = useMemo(() => {
    if (!visibleCodes) return codeSpans;
    const visibleSet = new Set(visibleCodes);
    return codeSpans.filter((s) => visibleSet.has(s.codeId));
  }, [codeSpans, visibleCodes]);

  // Build a char offset map: for each line index, the starting char offset
  const lineOffsets = useMemo(() => {
    const offsets: number[] = [];
    let offset = 0;
    for (const line of lines) {
      offsets.push(offset);
      offset += line.length + 1; // +1 for the newline character
    }
    return offsets;
  }, [lines]);

  // For each line, find overlapping spans
  const lineSpans = useMemo(() => {
    return lines.map((line, i) => {
      const lineStart = lineOffsets[i];
      const lineEnd = lineStart + line.length;
      return filteredSpans.filter(
        (span) => span.startChar < lineEnd && span.endChar > lineStart
      );
    });
  }, [lines, lineOffsets, filteredSpans]);

  // Collect all unique code IDs that appear, to assign consistent stripe positions
  const codeIdOrder = useMemo(() => {
    const ids: string[] = [];
    const seen = new Set<string>();
    for (const span of filteredSpans) {
      if (!seen.has(span.codeId)) {
        seen.add(span.codeId);
        ids.push(span.codeId);
      }
    }
    return ids;
  }, [filteredSpans]);

  const stripeWidth = 4;
  const stripeGap = 2;
  const marginWidth = codeIdOrder.length * (stripeWidth + stripeGap) + 8;

  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: `${lineHeight}px`,
        color: theme.colors.text.primary,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        overflow: 'auto',
      }}
    >
      {lines.map((line, lineIndex) => {
        const spans = lineSpans[lineIndex];
        const isHighlighted =
          highlightCodeId && spans.some((s) => s.codeId === highlightCodeId);

        return (
          <div
            key={lineIndex}
            style={{
              display: 'flex',
              minHeight: `${lineHeight}px`,
              background: isHighlighted
                ? `${filteredSpans.find((s) => s.codeId === highlightCodeId)?.color || theme.colors.primary}14`
                : 'transparent',
            }}
          >
            {/* Margin stripes */}
            <div
              style={{
                width: `${marginWidth}px`,
                minWidth: `${marginWidth}px`,
                position: 'relative',
                flexShrink: 0,
                borderRight: `1px solid ${theme.colors.border}`,
              }}
            >
              {codeIdOrder.map((codeId, stripeIndex) => {
                const span = spans.find((s) => s.codeId === codeId);
                if (!span) return null;
                return (
                  <div
                    key={codeId}
                    title={span.codeLabel}
                    onClick={() => onSpanClick?.(span)}
                    style={{
                      position: 'absolute',
                      left: `${stripeIndex * (stripeWidth + stripeGap) + 4}px`,
                      top: 0,
                      bottom: 0,
                      width: `${stripeWidth}px`,
                      backgroundColor: span.color,
                      borderRadius: '2px',
                      cursor: onSpanClick ? 'pointer' : 'default',
                      opacity: highlightCodeId
                        ? span.codeId === highlightCodeId
                          ? 1
                          : 0.3
                        : 0.85,
                      transition: 'opacity 150ms ease',
                    }}
                  />
                );
              })}
            </div>

            {/* Text content */}
            <div
              style={{
                flex: 1,
                padding: '0 12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {line || '\u00A0'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
