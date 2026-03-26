import React, { useState, useMemo } from 'react';
import { 
  SequenceTimeline, 
  MultiTrackTimeline 
} from '@research-tools/viz';
import { 
  KPIGrid, 
  Badge, 
  TranscriptViewer,
  ControlPanel,
  BarDistribution,
  GlassCard,
  CompactSelector
} from '@research-tools/ui';
import { 
  Database, 
  Search, 
  Layout, 
  Activity, 
  Info, 
  Zap, 
  List,
  ChevronRight,
  Shield
} from 'lucide-react';
import { 
  MOCK_SEQUENCE_TURNS, 
  MOCK_SEQUENCE_ROLES,
  MOCK_CALIBRATION_ITEMS
} from './mockData';
import { 
  DEFAULT_TAXONOMY, 
  colorFor,
  type Message
} from '@research-tools/core';

export const InteractionCartography: React.FC = () => {
  const [selectedId, setSelectedId] = useState('CONV-A72');
  const [search, setSearch] = useState('');
  const [selectedTurn, setSelectedTurn] = useState<string | undefined>();
  const [toggles, setToggles] = useState({ d1: true, d2: true, d3: true });

  // ── Data Transformation ─────────────────────────────────────
  const transcriptMessages = useMemo(() => {
    return MOCK_SEQUENCE_TURNS.map(t => ({
      id: `t-${t.idx}`,
      speaker: t.d2 === 'Seeker' ? 'user' : 'assistant',
      role: t.d2 === 'Seeker' ? undefined : (t.d2 as any),
      content: t.text,
      metadata: { d1: t.d1, d2: t.d2, d3: t.d3 }
    })) as Message[];
  }, []);

  const filteredMessages = useMemo(() => {
    if (!search) return transcriptMessages;
    return transcriptMessages.filter(m => 
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [transcriptMessages, search]);

  const roleSegments = useMemo(() => {
    return MOCK_SEQUENCE_ROLES.map(r => ({
      value: r.role,
      count: r.end - r.start + 1,
      color: colorFor(DEFAULT_TAXONOMY, 'd2', r.role)
    }));
  }, []);

  const tracks = useMemo(() => {
    const dims = ['d1', 'd2', 'd3'] as const;
    return dims.filter(d => toggles[d]).map(dim => ({
      id: dim,
      label: dim.toUpperCase(),
      cells: MOCK_SEQUENCE_TURNS.map(t => ({
        value: t[dim] as string,
        color: colorFor(DEFAULT_TAXONOMY, dim, t[dim] as string),
        tooltip: `${dim.toUpperCase()}: ${t[dim]}`
      }))
    }));
  }, [toggles]);

  const supportDist = [
    { label: 'Emotional', count: 12, color: colorFor(DEFAULT_TAXONOMY, 'd1', 'Emotional') },
    { label: 'Informational', count: 8, color: colorFor(DEFAULT_TAXONOMY, 'd1', 'Informational') },
    { label: 'Esteem', count: 4, color: colorFor(DEFAULT_TAXONOMY, 'd1', 'Esteem') },
  ];

  const strategyDist = [
    { label: 'Validation', count: 10, color: colorFor(DEFAULT_TAXONOMY, 'd3', 'Validation') },
    { label: 'Question', count: 6, color: colorFor(DEFAULT_TAXONOMY, 'd3', 'Question') },
    { label: 'Affirmation', count: 5, color: colorFor(DEFAULT_TAXONOMY, 'd3', 'Affirmation') },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-bloom-black mb-2 tracking-tight">Interaction Cartography</h1>
          <p className="text-bloom-text-dim max-w-2xl font-medium leading-relaxed">
            Multi-dimensional sequence explorer for micro-analytical research. Ported from AROMA reference architecture.
          </p>
        </div>
        <div className="flex gap-4 items-center">
           <Badge variant="bloom">STABLE v2.5</Badge>
           <div className="w-10 h-10 rounded-full bg-bloom-bg-subtle border border-bloom-gray flex items-center justify-center">
              <Activity size={18} className="text-bloom-black" />
           </div>
        </div>
      </header>

      {/* ── Main Dashboard Layout ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-6 items-start">
        
        {/* LEFT PANEL: CONTROLS */}
        <aside className="space-y-6">
          <GlassCard className="p-5 space-y-6">
            <div className="flex items-center gap-2 text-bloom-black">
              <Database size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Sequence Controls</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <CompactSelector 
                  label="Select Case"
                  options={MOCK_CALIBRATION_ITEMS.map(i => i.external_id)}
                  selected={selectedId}
                  onSelect={id => setSelectedId(id)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bloom-text-dim">Turn Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bloom-gray-dark" />
                  <input 
                    type="text" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Keywords..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-bloom-gray rounded-xl text-xs focus:ring-2 focus:ring-bloom-yellow outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bloom-text-dim">Layer Visibility</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['d1', 'd2', 'd3'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setToggles({ ...toggles, [d]: !toggles[d] })}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${toggles[d] ? 'bg-bloom-black text-white border-bloom-black' : 'bg-white text-bloom-text-dim border-bloom-gray'}`}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-bloom-black">
              <Info size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Role Codebook</h3>
            </div>
            <div className="space-y-3">
               <div>
                  <Badge variant="bloom" label="Listener" />
                  <p className="text-[11px] text-bloom-text-dim mt-2 leading-relaxed">
                    Receptive, non-directive. Mirrors and validates the user's emotional state without introducing external reframes.
                  </p>
               </div>
               <div className="pt-2 border-t border-bloom-gray">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-bloom-orange">
                    <Shield size={12} />
                    LOW PARADOX
                  </div>
               </div>
            </div>
          </GlassCard>

          <div className="p-4 bg-bloom-bg-subtle rounded-2xl border border-bloom-gray">
             <h4 className="text-[10px] font-black text-bloom-text-dim uppercase tracking-[3px] mb-3">Legend</h4>
             <div className="flex flex-wrap gap-2">
                {DEFAULT_TAXONOMY.dimensions[1].categories.map(c => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[9px] font-bold text-bloom-black">{c.name}</span>
                  </div>
                ))}
             </div>
          </div>
        </aside>

        {/* CENTER PANEL: ANALYSIS STAGE */}
        <main className="space-y-6">
          <section className="bg-white border border-bloom-gray rounded-[40px] p-8 shadow-bloom-xl space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Layout size={20} className="text-bloom-purple" />
                 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-bloom-black">Role Trajectory</h2>
              </div>
              <div className="bg-bloom-bg-subtle p-8 rounded-3xl border border-bloom-gray/50">
                <SequenceTimeline segments={roleSegments} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Activity size={20} className="text-bloom-orange" />
                 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-bloom-black">Multi-Track Timeline</h2>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-bloom-gray shadow-inner overflow-x-auto">
                <MultiTrackTimeline 
                  tracks={tracks} 
                  cellSize={20}
                  onCellClick={(_, idx) => setSelectedTurn(`t-${idx}`)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <List size={20} className="text-bloom-green" />
                 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-bloom-black">Dialogue Flow</h2>
              </div>
              <div className="bg-bloom-bg-subtle rounded-3xl overflow-hidden border border-bloom-gray max-h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-2">
                  <TranscriptViewer 
                    messages={filteredMessages} 
                    highlightedId={selectedTurn}
                    onMessageClick={id => setSelectedTurn(id)}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* RIGHT PANEL: INSIGHTS & METRICS */}
        <aside className="space-y-6">
          <section className="grid grid-cols-1 gap-4">
            <h3 className="text-[10px] font-black text-bloom-text-dim uppercase tracking-[3px] px-2">Key Metrics</h3>
            <KPIGrid 
              columns={1}
              items={[
                { label: 'Dominant Role', value: 'Listener', color: colorFor(DEFAULT_TAXONOMY, 'd2', 'Listener') },
                { label: 'Paradox Tier', value: 'Low', color: '#22c55e' },
                { label: 'Role Shifts', value: '3', color: '#6366f1' },
                { label: 'Support Share', value: '85%', color: '#f59e0b' }
              ]} 
            />
          </section>

          <section className="bg-white border border-bloom-gray rounded-3xl p-5 shadow-bloom-lg space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-bloom-black uppercase tracking-widest">Support Mix (D1)</h4>
                <div className="w-1.5 h-1.5 rounded-full bg-bloom-purple animate-pulse" />
              </div>
              <BarDistribution data={supportDist} />
            </div>

            <div className="space-y-4 pt-6 border-t border-bloom-gray">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-bloom-black uppercase tracking-widest">Strategy Mix (D3)</h4>
                <div className="w-1.5 h-1.5 rounded-full bg-bloom-orange animate-pulse" />
              </div>
              <BarDistribution data={strategyDist} />
            </div>
          </section>

          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-bloom-black">
              <Zap size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Analytical Notes</h3>
            </div>
            <div className="p-4 bg-bloom-yellow/10 rounded-xl border border-bloom-yellow/20">
               <p className="text-[11px] text-bloom-text-dim leading-relaxed font-medium">
                 High-paradox turns are absent in this sequence. The interaction follows a stable **supportive alignment** pattern.
               </p>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-bloom-text-dim uppercase hover:text-bloom-black transition-colors">
               View Full Audit
               <ChevronRight size={14} />
            </button>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
};
