import React, { useMemo, useState } from 'react';

interface WordEntry {
  text: string;
  count: number;
  color?: string;
}

interface WordCloudProps {
  words: WordEntry[];
  width?: number;
  height?: number;
  maxFontSize?: number;
  minFontSize?: number;
  onWordClick?: (word: string) => void;
  highlightWord?: string;
}

interface PlacedWord {
  text: string;
  count: number;
  color: string;
  fontSize: number;
  x: number;
  y: number;
  rotate: boolean;
  width: number;
  height: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function boxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return !(
    a.x + a.width / 2 < b.x - b.width / 2 ||
    a.x - a.width / 2 > b.x + b.width / 2 ||
    a.y + a.height / 2 < b.y - b.height / 2 ||
    a.y - a.height / 2 > b.y + b.height / 2
  );
}

const defaultColors = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6',
  '#ef4444', '#3b82f6', '#10b981', '#f97316', '#06b6d4',
];

export const WordCloud: React.FC<WordCloudProps> = ({
  words,
  width = 600,
  height = 400,
  maxFontSize = 48,
  minFontSize = 12,
  onWordClick,
  highlightWord,
}) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const placedWords = useMemo<PlacedWord[]>(() => {
    if (words.length === 0) return [];

    const sorted = [...words].sort((a, b) => b.count - a.count);
    const maxCount = sorted[0].count;
    const minCount = sorted[sorted.length - 1].count;
    const countRange = maxCount - minCount || 1;

    const rng = seededRandom(42);
    const placed: PlacedWord[] = [];
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < sorted.length; i++) {
      const word = sorted[i];
      const t = (word.count - minCount) / countRange;
      const fontSize = minFontSize + t * (maxFontSize - minFontSize);
      const rotate = rng() < 0.3;

      // Approximate bounding box
      const charWidth = fontSize * 0.6;
      const textWidth = word.text.length * charWidth;
      const textHeight = fontSize * 1.2;
      const bw = rotate ? textHeight : textWidth;
      const bh = rotate ? textWidth : textHeight;

      let bestX = cx;
      let bestY = cy;
      let found = false;

      // Spiral placement
      const spiralStep = 2;
      const maxRadius = Math.max(width, height);

      for (let r = 0; r < maxRadius && !found; r += spiralStep) {
        const angleSteps = Math.max(6, Math.floor((2 * Math.PI * r) / 8));
        for (let a = 0; a < angleSteps && !found; a++) {
          const angle = (2 * Math.PI * a) / angleSteps;
          const tx = cx + r * Math.cos(angle);
          const ty = cy + r * Math.sin(angle);

          const candidate = { x: tx, y: ty, width: bw, height: bh };

          // Check bounds
          if (
            tx - bw / 2 < 0 ||
            tx + bw / 2 > width ||
            ty - bh / 2 < 0 ||
            ty + bh / 2 > height
          ) {
            continue;
          }

          let overlaps = false;
          for (const p of placed) {
            if (boxesOverlap(candidate, p)) {
              overlaps = true;
              break;
            }
          }

          if (!overlaps) {
            bestX = tx;
            bestY = ty;
            found = true;
          }
        }
      }

      if (!found) {
        // Place it anyway at a spiral position that's closest to fitting
        bestX = cx + (rng() - 0.5) * width * 0.8;
        bestY = cy + (rng() - 0.5) * height * 0.8;
      }

      const color = word.color || defaultColors[i % defaultColors.length];

      placed.push({
        text: word.text,
        count: word.count,
        color,
        fontSize,
        x: bestX,
        y: bestY,
        rotate,
        width: bw,
        height: bh,
      });
    }

    return placed;
  }, [words, width, height, maxFontSize, minFontSize]);

  return (
    <svg
      width={width}
      height={height}
      style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
    >
      {placedWords.map((w) => {
        const isHighlighted = highlightWord === w.text;
        const isHovered = hoveredWord === w.text;

        return (
          <text
            key={w.text}
            x={w.x}
            y={w.y}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: w.fontSize,
              fill: w.color,
              cursor: onWordClick ? 'pointer' : 'default',
              opacity: isHovered ? 0.7 : 1,
              fontWeight: isHighlighted ? 'bold' : 'normal',
              stroke: isHighlighted ? w.color : 'none',
              strokeWidth: isHighlighted ? 1.5 : 0,
              filter: isHighlighted
                ? `drop-shadow(0 0 4px ${w.color})`
                : 'none',
              transition: 'opacity 0.15s, filter 0.15s',
            }}
            transform={
              w.rotate ? `rotate(-90, ${w.x}, ${w.y})` : undefined
            }
            onClick={() => onWordClick?.(w.text)}
            onMouseEnter={() => setHoveredWord(w.text)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            <title>
              {w.text}: {w.count}
            </title>
            {w.text}
          </text>
        );
      })}
    </svg>
  );
};

export default WordCloud;
