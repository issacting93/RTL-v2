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
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
      <header className="flex justify-between items-end border-b border-bloom-gray pb-6">
        <div>
          <h1 className="text-4xl font-black text-bloom-black mb-2 tracking-tight">Interaction Cartography</h1>
          <p className="text-bloom-text-dim max-w-2xl font-medium leading-relaxed">
            Configurable multi-panel analytical dashboard with layer toggles, search filtering, and synchronized timeline-transcript views.
          </p>
        </div>
        <div className="flex gap-4 items-center">
           <Badge variant="bloom">v1.0.0</Badge>
           <div className="w-10 h-10 rounded-full bg-bloom-bg-subtle border border-bloom-gray flex items-center justify-center">
              <Activity size={18} className="text-bloom-black" />
           </div>
        </div>
      </header>

      {/* ── Main Dashboard Layout (1-Column) ──────────────────── */}
      <div className="flex flex-col gap-10">
        
        {/* SECTION 1: CONTROLS & CONFIGURATION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-bloom-black">
              <Database size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Navigation & Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <CompactSelector 
                  label="Select Sequence"
                  options={MOCK_CALIBRATION_ITEMS.map(i => i.external_id)}
                  selected={selectedId}
                  onSelect={id => setSelectedId(id)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bloom-text-dim">Search Content</label>
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
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-bloom-text-dim">Layer Visibility</label>
              <div className="flex gap-2">
                {(['d1', 'd2', 'd3'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setToggles({ ...toggles, [d]: !toggles[d] })}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${toggles[d] ? 'bg-bloom-black text-white border-bloom-black' : 'bg-white text-bloom-text-dim border-bloom-gray'}`}
                  >
                    LAYER {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-bloom-black">
              <Info size={16} />
              <h3 className="text-sm font-black uppercase tracking-widest">Category Reference</h3>
            </div>
            <div className="space-y-4">
               <div className="flex flex-wrap gap-3">
                  {DEFAULT_TAXONOMY.dimensions[1].categories.map(c => (
                    <div key={c.name} className="flex items-center gap-2 px-3 py-1.5 bg-bloom-bg-subtle rounded-full border border-bloom-gray">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[10px] font-bold text-bloom-black uppercase">{c.name}</span>
                    </div>
                  ))}
               </div>
               <p className="text-[11px] text-bloom-text-dim leading-relaxed font-medium bg-white/50 p-3 rounded-xl border border-dashed border-bloom-gray">
                 Select a turn in the timeline or transcript to view specific metadata and category definitions.
               </p>
            </div>
          </GlassCard>
        </section>

        {/* SECTION 2: VISUAL ANALYSIS STAGE */}
        <section className="bg-white border border-bloom-gray rounded-[32px] p-8 shadow-bloom-xl space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-bloom-gray pb-4">
              <div className="flex items-center gap-3">
                 <Layout size={20} className="text-bloom-purple" />
                 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-bloom-black">Primary Sequence</h2>
              </div>
              <Badge variant="bloom">MAIN FLOW</Badge>
            </div>
            <div className="bg-bloom-bg-subtle p-8 rounded-3xl border border-bloom-gray/50">
              <SequenceTimeline segments={roleSegments} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-bloom-gray pb-4">
              <div className="flex items-center gap-3">
                 <Activity size={20} className="text-bloom-orange" />
                 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-bloom-black">Attribute Layers</h2>
              </div>
              <div className="text-[10px] font-bold text-bloom-text-dim uppercase">Sync: Turn idx</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-bloom-gray shadow-inner overflow-x-auto">
              <MultiTrackTimeline 
                tracks={tracks} 
                cellSize={24}
                onCellClick={(_, idx) => setSelectedTurn(`t-${idx}`)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-bloom-gray pb-4">
               <List size={20} className="text-bloom-green" />
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-bloom-black">Transcript Viewer</h2>
            </div>
            <div className="bg-bloom-bg-subtle rounded-3xl overflow-hidden border border-bloom-gray max-h-[600px] flex flex-col shadow-inner">
              <div className="flex-1 overflow-y-auto p-4">
                <TranscriptViewer 
                  messages={filteredMessages} 
                  highlightedId={selectedTurn}
                  onMessageClick={id => setSelectedTurn(id)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: ANALYTICAL METRICS & OBSERVATIONS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-bloom-text-dim uppercase tracking-[3px] px-2">Analytical Metrics</h3>
            <KPIGrid 
              columns={2}
              items={[
                { label: 'Primary Feature', value: 'Listener', color: colorFor(DEFAULT_TAXONOMY, 'd2', 'Listener') },
                { label: 'Complexity Score', value: 'Low', color: '#22c55e' },
                { label: 'Sequence Shifts', value: '3', color: '#6366f1' },
                { label: 'Focus Share', value: '85%', color: '#f59e0b' }
              ]} 
            />
            
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-bloom-black">
                <Zap size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Observations</h3>
              </div>
              <div className="p-4 bg-bloom-yellow/10 rounded-2xl border border-bloom-yellow/20">
                 <p className="text-[11px] text-bloom-text-dim leading-relaxed font-medium">
                   Preliminary analysis indicates a stable sequence with low variability. The dataset follows the expected alignment patterns for this category.
                 </p>
              </div>
              <button className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-bloom-text-dim uppercase hover:text-bloom-black transition-colors border-t border-bloom-gray pt-4 mt-2">
                 View Detailed Report
                 <ChevronRight size={14} />
              </button>
            </GlassCard>
          </div>

          <section className="bg-white border border-bloom-gray rounded-[32px] p-8 shadow-bloom-lg space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black text-bloom-black uppercase tracking-widest">Dimension A Distribution</h4>
                <div className="w-1.5 h-1.5 rounded-full bg-bloom-purple" />
              </div>
              <BarDistribution data={supportDist} />
            </div>

            <div className="space-y-4 pt-8 border-t border-bloom-gray">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black text-bloom-black uppercase tracking-widest">Dimension B Distribution</h4>
                <div className="w-1.5 h-1.5 rounded-full bg-bloom-orange" />
              </div>
              <BarDistribution data={strategyDist} />
            </div>
          </section>
        </section>
      </div>
    </div>
  );
};
