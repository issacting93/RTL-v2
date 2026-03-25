import React, { useState, useMemo } from 'react';
import {
  theme,
  GlassCard,
  TranscriptViewer,
  AnnotationDesk,
  PremiumButton,
  Badge,
  KPIGrid,
  BarDistribution,
  DataTable,
  CompactSelector,
  TagSelector,
  ControlPanel,
  ItemInspector,
} from '@research-tools/ui';
import {
  RadialLayout,
  D2xD3Heatmap,
  RoleRibbon,
  MultiTrackTimeline,
  DocumentPortrait,
  TransitionFlow,
} from '@research-tools/viz';
import {
  generateMockDataset,
  generateMockHeatmap,
  DEFAULT_TAXONOMY,
  colorFor,
  calculateConversationMetrics,
  countsBy,
  sortCounts,
  makeSegments,
  computeTransitionMatrix,
  type Conversation,
  type Message,
} from '@research-tools/core';

// ── Generate dummy data ─────────────────────────────────────────
const CONVERSATIONS = generateMockDataset(5, 16);
const HEATMAP = generateMockHeatmap();

type TabId = 'overview' | 'annotate' | 'corpus' | 'findings';

export default function App() {
  const [tab, setTab] = useState<TabId>('overview');
  const [activeConv, setActiveConv] = useState<Conversation>(CONVERSATIONS[0]);
  const [activeMsg, setActiveMsg] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState('radial');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  const metrics = useMemo(() => calculateConversationMetrics(activeConv), [activeConv]);

  // ── Derived data for viz ────────────────────────────────────
  const roleCounts = useMemo(() => {
    const raw = countsBy(
      activeConv.messages.map(m => ({ id: m.id, role: m.role || 'Unknown' })),
      'role'
    );
    return sortCounts(raw).map(e => ({
      label: e.label,
      count: e.count,
      color: colorFor(DEFAULT_TAXONOMY, 'd2', e.label),
    }));
  }, [activeConv]);

  const ribbonSegments = useMemo(() => {
    const items = activeConv.messages.map(m => ({ id: m.id, role: m.role || 'Unknown' }));
    return makeSegments(items, 'role').map(seg => ({
      value: seg.value,
      count: seg.items.length,
      color: colorFor(DEFAULT_TAXONOMY, 'd2', seg.value),
    }));
  }, [activeConv]);

  const multiTracks = useMemo(() => {
    const dims = ['d1', 'd2', 'd3'] as const;
    return dims.map(dim => {
      const dimDef = DEFAULT_TAXONOMY.dimensions.find(d => d.id === dim)!;
      return {
        id: dim,
        label: dim.toUpperCase(),
        cells: activeConv.messages.map(m => {
          const val = m.metadata?.[dim] || 'Unknown';
          return {
            value: val,
            color: colorFor(DEFAULT_TAXONOMY, dim, val),
            tooltip: `${dimDef.label}: ${val}`,
          };
        }),
      };
    });
  }, [activeConv]);

  const transitionMatrix = useMemo(() => {
    const sequences = CONVERSATIONS.map(c =>
      c.messages.map(m => ({ id: m.id, role: m.role || 'Unknown' }))
    );
    return computeTransitionMatrix(sequences, 'role');
  }, []);

  const transitionColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of DEFAULT_TAXONOMY.dimensions.find(d => d.id === 'd2')!.categories) {
      map[cat.name] = cat.color;
    }
    return map;
  }, []);

  const portraitRows = useMemo(() => {
    return CONVERSATIONS.map(conv => ({
      id: conv.id,
      label: conv.title || conv.id,
      group: conv.messages[0]?.role || 'Unknown',
      cells: conv.messages.map(m => ({
        color: colorFor(DEFAULT_TAXONOMY, 'd2', m.role || 'Unknown'),
        tooltip: `${m.speaker}: ${m.role}`,
      })),
    }));
  }, []);

  const tableData = useMemo(() => {
    return CONVERSATIONS.map(conv => {
      const m = calculateConversationMetrics(conv);
      const roles = countsBy(conv.messages.map(msg => ({ id: msg.id, role: msg.role || 'Unknown' })), 'role');
      const dominant = sortCounts(roles)[0]?.label || 'Unknown';
      return {
        id: conv.id,
        title: conv.title,
        turns: m.turnCount,
        avgLength: Math.round(m.avgMsgLength),
        dominant,
        userTurns: m.userTurnCount,
      };
    });
  }, []);

  const inspectedMsg = useMemo(() => {
    if (!activeMsg) return null;
    return activeConv.messages.find(m => m.id === activeMsg) || null;
  }, [activeMsg, activeConv]);

  // ── Tab buttons ──────────────────────────────────────────────
  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'annotate', label: 'Annotate' },
    { id: 'corpus', label: 'Corpus' },
    { id: 'findings', label: 'Findings' },
  ];

  return (
    <div style={{
      background: theme.colors.background,
      minHeight: '100vh',
      padding: '32px 40px',
      color: theme.colors.text.primary,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            background: theme.gradients.premium,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '28px',
            marginBottom: '4px',
          }}>
            Research Tools
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
            Generalised toolkit for qualitative research, annotation, and corpus analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                background: tab === t.id ? theme.colors.text.primary : 'rgba(255,255,255,0.05)',
                color: tab === t.id ? theme.colors.background : theme.colors.text.primary,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
          <PremiumButton onClick={() => alert('Export triggered')}>Export</PremiumButton>
        </div>
      </header>

      {/* ── TAB: Overview ───────────────────────────────────────── */}
      {tab === 'overview' && (
        <>
          <KPIGrid items={[
            { label: 'Conversations', value: CONVERSATIONS.length, color: '#6366f1' },
            { label: 'Total Turns', value: CONVERSATIONS.reduce((s, c) => s + c.messages.length, 0), color: '#ec4899' },
            { label: 'Avg Turn Length', value: `${Math.round(metrics.avgMsgLength)} chars` },
            { label: 'Active Conversation', value: activeConv.id, color: '#10b981' },
          ]} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <GlassCard title="Transcript">
              <TranscriptViewer
                messages={activeConv.messages as Message[]}
                onMessageClick={setActiveMsg}
                highlightedId={activeMsg}
              />
            </GlassCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <GlassCard title="Radial Layout">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <RadialLayout
                    messages={activeConv.messages as Message[]}
                    width={380}
                    height={380}
                    onNodeClick={setActiveMsg}
                  />
                </div>
              </GlassCard>

              <ItemInspector
                title={inspectedMsg?.speaker?.toUpperCase()}
                subtitle={inspectedMsg?.content}
                accentColor={inspectedMsg?.metadata?.roleColor}
                visible={!!inspectedMsg}
                fields={inspectedMsg ? [
                  { label: 'Role', value: inspectedMsg.role || '—', color: inspectedMsg.metadata?.roleColor },
                  { label: 'D1', value: inspectedMsg.metadata?.d1 || '—' },
                  { label: 'D3', value: inspectedMsg.metadata?.d3 || '—' },
                  { label: 'Tension', value: `${Math.round((inspectedMsg.metadata?.tension || 0) * 100)}%` },
                ] : []}
              />
            </div>
          </div>
        </>
      )}

      {/* ── TAB: Annotate ───────────────────────────────────────── */}
      {tab === 'annotate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
          <GlassCard title={`Transcript — ${activeConv.id}`}>
            <TranscriptViewer
              messages={activeConv.messages as Message[]}
              onMessageClick={setActiveMsg}
              highlightedId={activeMsg}
            />
          </GlassCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <GlassCard title="Coding Form">
              <CompactSelector
                label="D2: Care Role"
                options={DEFAULT_TAXONOMY.dimensions[1].categories.map(c => c.name)}
                selected={selectedRole}
                onSelect={setSelectedRole}
                definitions={Object.fromEntries(
                  DEFAULT_TAXONOMY.dimensions[1].categories.map(c => [c.name, c.description || ''])
                )}
              />
              <TagSelector
                label="D3: Strategies"
                options={DEFAULT_TAXONOMY.dimensions[2].categories.map(c => c.name)}
                selected={selectedStrategies}
                onToggle={s => setSelectedStrategies(prev =>
                  prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                )}
                colorMap={Object.fromEntries(
                  DEFAULT_TAXONOMY.dimensions[2].categories.map(c => [c.name, c.color])
                )}
              />
            </GlassCard>

            <AnnotationDesk
              title="Additional Fields"
              fields={[
                { id: 'confidence', label: 'Confidence', type: 'select', options: ['Low', 'Medium', 'High'] },
                { id: 'paradox', label: 'Flag Paradox', type: 'boolean' },
                { id: 'notes', label: 'Notes', type: 'text' },
              ]}
              onSubmit={data => console.log('Annotation:', { role: selectedRole, strategies: selectedStrategies, ...data })}
            />

            <GlassCard title="Role Distribution">
              <BarDistribution data={roleCounts} />
            </GlassCard>
          </div>
        </div>
      )}

      {/* ── TAB: Corpus ─────────────────────────────────────────── */}
      {tab === 'corpus' && (
        <>
          <ControlPanel
            groups={[
              {
                label: 'View',
                options: [
                  { value: 'portrait', label: 'Document Portrait' },
                  { value: 'table', label: 'Table View' },
                ],
                value: viewMode === 'table' ? 'table' : 'portrait',
                onChange: v => setViewMode(v),
              },
            ]}
            actions={[{ label: 'Regenerate Data', onClick: () => location.reload(), variant: 'danger' }]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
            <GlassCard title={viewMode === 'table' ? 'Conversation Table' : 'Document Portrait'}>
              {viewMode === 'table' ? (
                <DataTable
                  searchable
                  columns={[
                    { key: 'id', label: 'ID' },
                    { key: 'turns', label: 'Turns' },
                    { key: 'dominant', label: 'Dominant Role', render: (v: string) => (
                      <Badge label={v} color={colorFor(DEFAULT_TAXONOMY, 'd2', v)} />
                    )},
                    { key: 'avgLength', label: 'Avg Length' },
                  ]}
                  data={tableData}
                  onRowClick={row => {
                    const conv = CONVERSATIONS.find(c => c.id === row.id);
                    if (conv) setActiveConv(conv);
                  }}
                  activeRowId={activeConv.id}
                />
              ) : (
                <DocumentPortrait
                  rows={portraitRows}
                  rowHeight={8}
                  onRowClick={id => {
                    const conv = CONVERSATIONS.find(c => c.id === id);
                    if (conv) setActiveConv(conv);
                  }}
                  activeId={activeConv.id}
                />
              )}
            </GlassCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <GlassCard title={`Selected: ${activeConv.id}`}>
                <BarDistribution data={roleCounts} title="Role Mix" />
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: theme.colors.text.primary }}>
                    Role Ribbon
                  </div>
                  <RoleRibbon segments={ribbonSegments} />
                </div>
              </GlassCard>

              <GlassCard title="Multi-Track Timeline">
                <MultiTrackTimeline tracks={multiTracks} cellSize={14} />
              </GlassCard>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: Findings ───────────────────────────────────────── */}
      {tab === 'findings' && (
        <>
          <KPIGrid columns={3} items={[
            { label: 'Total Turns Coded', value: CONVERSATIONS.reduce((s, c) => s + c.messages.length, 0) },
            { label: 'Unique Roles', value: DEFAULT_TAXONOMY.dimensions[1].categories.length, color: '#8b5cf6' },
            { label: 'Avg Role Shifts', value: (CONVERSATIONS.reduce((s, c) => {
              const items = c.messages.map(m => ({ id: m.id, role: m.role || 'Unknown' }));
              return s + Math.max(makeSegments(items, 'role').length - 1, 0);
            }, 0) / CONVERSATIONS.length).toFixed(1) },
          ]} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <GlassCard title="Role Transition Flow">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <TransitionFlow
                  matrix={transitionMatrix}
                  width={440}
                  height={380}
                  colorMap={transitionColorMap}
                />
              </div>
            </GlassCard>

            <GlassCard title="D2 x D3 Heatmap">
              <D2xD3Heatmap
                data={HEATMAP}
                rows={DEFAULT_TAXONOMY.dimensions[1].categories.map(c => c.name)}
                cols={DEFAULT_TAXONOMY.dimensions[2].categories.map(c => c.name)}
                width={440}
                height={320}
              />
            </GlassCard>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginTop: '24px' }}>
            {DEFAULT_TAXONOMY.dimensions.map(dim => {
              const allMsgs = CONVERSATIONS.flatMap(c => c.messages);
              const raw = countsBy(
                allMsgs.map(m => ({ id: m.id, [dim.id]: m.metadata?.[dim.id] || 'Unknown' })),
                dim.id
              );
              const data = sortCounts(raw).map(e => ({
                label: e.label,
                count: e.count,
                color: colorFor(DEFAULT_TAXONOMY, dim.id, e.label),
              }));
              return (
                <GlassCard key={dim.id} title={`${dim.label} Distribution`}>
                  <BarDistribution data={data} />
                </GlassCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
