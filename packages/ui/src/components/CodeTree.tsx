import React from 'react';
import { theme } from '../theme';

interface CodeNode {
  id: string;
  label: string;
  color: string;
  count?: number;
  children?: CodeNode[];
}

interface CodeTreeProps {
  nodes: CodeNode[];
  onSelect?: (id: string) => void;
  selectedId?: string;
  collapsedIds?: string[];
  onToggle?: (id: string) => void;
}

const Chevron: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <span
    style={{
      display: 'inline-block',
      width: '16px',
      height: '16px',
      lineHeight: '16px',
      textAlign: 'center',
      fontSize: '10px',
      color: theme.colors.text.secondary,
      transition: 'transform 150ms ease',
      transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
      userSelect: 'none',
    }}
  >
    {'\u25BC'}
  </span>
);

const CountBadge: React.FC<{ count: number; color: string }> = ({
  count,
  color,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '20px',
      height: '18px',
      padding: '0 6px',
      borderRadius: '100px',
      fontSize: '10px',
      fontWeight: 700,
      background: `${color}18`,
      color: color,
      lineHeight: 1,
    }}
  >
    {count}
  </span>
);

const ColorSwatch: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: color,
      flexShrink: 0,
    }}
  />
);

interface TreeNodeRowProps {
  node: CodeNode;
  depth: number;
  selectedId?: string;
  collapsedIds?: string[];
  onSelect?: (id: string) => void;
  onToggle?: (id: string) => void;
}

const TreeNodeRow: React.FC<TreeNodeRowProps> = ({
  node,
  depth,
  selectedId,
  collapsedIds,
  onSelect,
  onToggle,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isCollapsed = collapsedIds?.includes(node.id) ?? false;
  const isSelected = selectedId === node.id;
  const indent = depth * 20;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          paddingLeft: `${indent + 8}px`,
          background: isSelected ? `${theme.colors.primary}12` : 'transparent',
          borderRadius: '6px',
          cursor: 'default',
          transition: 'background 120ms ease',
        }}
      >
        {/* Chevron or spacer */}
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(node.id);
            }}
            style={{ cursor: 'pointer', flexShrink: 0 }}
          >
            <Chevron collapsed={isCollapsed} />
          </span>
        ) : (
          <span style={{ width: '16px', flexShrink: 0 }} />
        )}

        {/* Color swatch */}
        <ColorSwatch color={node.color} />

        {/* Label */}
        <span
          onClick={() => onSelect?.(node.id)}
          style={{
            flex: 1,
            fontSize: '13px',
            fontWeight: isSelected ? 600 : 400,
            color: isSelected
              ? theme.colors.primary
              : theme.colors.text.primary,
            cursor: onSelect ? 'pointer' : 'default',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.label}
        </span>

        {/* Count badge */}
        {node.count != null && node.count > 0 && (
          <CountBadge count={node.count} color={node.color} />
        )}
      </div>

      {/* Children */}
      {hasChildren && !isCollapsed &&
        node.children!.map((child) => (
          <TreeNodeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            collapsedIds={collapsedIds}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
    </>
  );
};

export const CodeTree: React.FC<CodeTreeProps> = ({
  nodes,
  onSelect,
  selectedId,
  collapsedIds,
  onToggle,
}) => {
  return (
    <div
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: '8px 0',
        overflow: 'auto',
      }}
    >
      {nodes.length === 0 && (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: theme.colors.text.secondary,
            fontSize: '13px',
          }}
        >
          No codes defined.
        </div>
      )}
      {nodes.map((node) => (
        <TreeNodeRow
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          collapsedIds={collapsedIds}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};
