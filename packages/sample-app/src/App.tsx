import React, { useState, useMemo } from 'react';
import {
  theme,
  GlassCard,
  TranscriptViewer,
  CodingForm,
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
  TopologyNetwork,
  CooccurrenceMatrix,
  SequenceTimeline,
  MultiTrackTimeline,
  DocumentPortrait,
  StateTransitionFlow,
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
import { Book, Layout, BarChart, Component, MousePointer, FlaskConical, Type } from 'lucide-react';
import { CorpusAudit } from './templates/CorpusAudit';
import { SequenceExplorer } from './templates/SequenceExplorer';
import { StructuralDiagnostic } from './templates/StructuralDiagnostic';
import { AffectivePortrait } from './templates/AffectivePortrait';
import { RoleTransitionLab } from './templates/RoleTransitionLab';
import { CalibrationSuite } from './templates/CalibrationSuite';
import { InteractionCartography } from './templates/InteractionCartography';
import { MOCK_GRAPH_DATA } from './templates/mockData';

// ── Generate dummy data ─────────────────────────────────────────
const CONVERSATIONS = generateMockDataset(5, 16);
const HEATMAP = generateMockHeatmap();

type ComponentId = 
  | 'welcome' 
  | 'radial-layout' 
  | 'transition-flow' 
  | 'heatmap' 
  | 'transcript' 
  | 'annotation' 
  | 'datatable' 
  | 'kpi-grid'
  | 'document-portrait'
  | 'multi-track'
  | 'tpl-corpus'
  | 'tpl-sequence'
  | 'tpl-structural'
  | 'tpl-affective'
  | 'tpl-transition'
  | 'tpl-calibration'
  | 'tpl-cartography';

interface Story {
  id: ComponentId;
  label: string;
  category: 'Viz' | 'UI' | 'Overview' | 'Templates';
  description: string;
  useCase: string;
}

const STORIES: Story[] = [
  {
    id: 'welcome',
    label: 'Introduction',
    category: 'Overview',
    description: 'Welcome to the Research Tool Library (RTL).',
    useCase: 'Explore the component suite for conversation analysis and Human-AI interaction research.'
  },
  {
    id: 'tpl-corpus',
    label: 'Dataset Overview',
    category: 'Templates',
    description: 'Corpus-level statistical overview combining alluvial flow diagrams, mosaic plots for chi-squared independence testing, and stability classification.',
    useCase: 'Auditing dimensional independence (D1/D2/D3) across a full dataset to verify taxonomy orthogonality before downstream analysis.'
  },
  {
    id: 'tpl-sequence',
    label: 'Conversation Explorer',
    category: 'Templates',
    description: 'Single-conversation deep dive combining a force-directed topology graph, role-segment timeline, multi-track dimensional view, and inline transcript.',
    useCase: 'Case-study analysis of one conversation: inspecting turn-level role shifts, strategy co-occurrence, and structural topology.'
  },
  {
    id: 'tpl-structural',
    label: 'Interaction Stability',
    category: 'Templates',
    description: 'Constraint violation and repair analysis pairing a structural topology view with a temporal event lifecycle timeline.',
    useCase: 'Identifying where conversational norms (e.g., accountability, politeness) are violated and how participants repair them.'
  },
  {
    id: 'tpl-affective',
    label: 'Emotional Dynamics',
    category: 'Templates',
    description: 'Affect tracking using the PAD (Pleasure-Arousal-Dominance) dimensional model with synchronized sparklines, a participation balance gauge, and document portrait.',
    useCase: 'Studying emotional trajectories and power balance across a session using Mehrabian and Russell\'s PAD framework.'
  },
  {
    id: 'tpl-transition',
    label: 'Participant Dynamics',
    category: 'Templates',
    description: 'Role transition analysis combining participation distribution, state-transition flow diagrams, role-strategy co-occurrence matrices, and distribution heatmaps.',
    useCase: 'Tracking how participant roles evolve over time and identifying cross-dimensional behavioral patterns (e.g., which strategies accompany which roles).'
  },
  {
    id: 'tpl-calibration',
    label: 'Annotation Workspace',
    category: 'Templates',
    description: 'Human annotation workflow with a batch sequence manager, multi-dimensional coding form (D1/D2/D3 with confidence), stance capture, and linked transcript viewer.',
    useCase: 'Managing ground-truth annotation tasks for inter-rater reliability studies and codebook calibration.'
  },
  {
    id: 'tpl-cartography',
    label: 'Interaction Cartography',
    category: 'Templates',
    description: 'Configurable multi-panel analytical dashboard with layer toggles, sequence navigation, search filtering, and synchronized timeline-transcript views.',
    useCase: 'Flexible micro-analysis workbench for exploring sequential data with user-controlled dimensional visibility and linked selection.'
  },
  {
    id: 'radial-layout',
    label: 'Topology Network',
    category: 'Viz',
    description: 'Force-directed graph showing conversation structure: turns as nodes, sequential and semantic links as edges, with node types for moves, constraints, and violations.',
    useCase: 'Visualizing the structural topology of a conversation — how turns, moves, and constraints relate to each other.'
  },
  {
    id: 'transition-flow',
    label: 'State Transition Flow',
    category: 'Viz',
    description: 'Sankey-style diagram rendering an N\u00d7N transition matrix as weighted flows between categorical states.',
    useCase: 'Analyzing sequential dependencies — e.g., how often a Listener role transitions to Advisor, including self-loops.'
  },
  {
    id: 'heatmap',
    label: 'Co-occurrence Matrix',
    category: 'Viz',
    description: 'Color-scaled matrix showing frequency counts at the intersection of two categorical dimensions.',
    useCase: 'Identifying cross-dimensional associations — e.g., which D3 strategies co-occur most with each D2 role.'
  },
  {
    id: 'transcript',
    label: 'Transcript Viewer',
    category: 'UI',
    description: 'Speaker-aware chat transcript with alternating alignment, click-to-select turns, and optional highlight state for linked views.',
    useCase: 'Reading and navigating conversation data with visual speaker differentiation and selection-based linking to other panels.'
  },
  {
    id: 'annotation',
    label: 'Coding Form',
    category: 'UI',
    description: 'Schema-driven form supporting select, tag, text, and range field types for structured data entry.',
    useCase: 'Standardizing qualitative coding workflows — applying categorical labels and free-text notes to selected turns.'
  },
  {
    id: 'datatable',
    label: 'Research Table',
    category: 'UI',
    description: 'Sortable, searchable data table with custom cell renderers and row-click selection.',
    useCase: 'Browsing and filtering corpus-level metadata to select specific conversations for deeper analysis.'
  },
  {
    id: 'kpi-grid',
    label: 'KPI Grid',
    category: 'UI',
    description: 'Responsive metric card grid displaying key performance indicators with optional icons, colors, and detail text.',
    useCase: 'Summarizing aggregate statistics at the top of a dashboard — turn counts, coverage ratios, stability scores.'
  },
  {
    id: 'document-portrait',
    label: 'Document Portrait',
    category: 'Viz',
    description: 'Compact "barcode" visualization where each row represents a document and each cell a turn, colored by a categorical variable.',
    useCase: 'Comparing role distribution patterns across many conversations at a glance — spotting structural outliers in a corpus.'
  },
  {
    id: 'multi-track',
    label: 'Multi-Track Timeline',
    category: 'Viz',
    description: 'Parallel horizontal tracks displaying categorical values per turn across multiple dimensions simultaneously.',
    useCase: 'Aligning D1 (Support Type), D2 (Care Role), and D3 (Strategy) on a shared turn axis to spot co-occurrence patterns.'
  },
];

export default function App() {
  const [activeStoryId, setActiveStoryId] = useState<ComponentId>('welcome');
  const [activeConv, setActiveConv] = useState<Conversation>(CONVERSATIONS[0]);
  const [activeMsg, setActiveMsg] = useState<string | undefined>();
  
  // ── Derived data for viz ────────────────────────────────────
  const metrics = useMemo(() => calculateConversationMetrics(activeConv), [activeConv]);
  
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
              value: String(val),
              color: colorFor(DEFAULT_TAXONOMY, dim, val as string),
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

  const activeStory = STORIES.find(s => s.id === activeStoryId)!;

  return (
    <div className="flex bg-bloom-bg">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="storybook-sidebar">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-bloom-yellow rounded-lg flex items-center justify-center text-bloom-black font-bold">R</div>
          <h1 className="text-xl font-bold tracking-tight">RTL Guide</h1>
        </div>

        <nav className="space-y-8">
          {(['Overview', 'UI', 'Viz', 'Templates'] as const).map(category => (
            <div key={category}>
              <h2 className="bloom-section-label mb-4 opacity-50">{category}</h2>
              <div className="space-y-1">
                {STORIES.filter(s => s.category === category).map(story => (
                  <button
                    key={story.id}
                    onClick={() => setActiveStoryId(story.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                      activeStoryId === story.id 
                        ? 'bg-bloom-yellow text-bloom-black font-semibold' 
                        : 'text-bloom-gray-dark hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {story.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main Stage ─────────────────────────────────────────── */}
      <main className="storybook-stage flex-1">
        <header className="storybook-header">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-bloom-bg-subtle rounded-lg border border-bloom-gray">
              {activeStory.category === 'Viz' ? <BarChart size={20} /> : <Component size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-bloom-black">{activeStory.label}</h2>
              <p className="text-xs text-bloom-text-dim">{activeStory.category} Component • Research Tool Library</p>
            </div>
          </div>
          <div className="flex gap-3">
             <PremiumButton onClick={() => alert('Exporting component code...')} variant="secondary">
                Get Code
             </PremiumButton>
             <PremiumButton onClick={() => window.open('https://github.com/issacting93/RTL-v2')}>
                GitHub
             </PremiumButton>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto">
          {/* ── Component Info ───────────────────────────────────── */}
          <section className="mb-12">
             <div className="grid grid-cols-3 gap-12">
                <div className="col-span-2">
                   <h3 className="bloom-section-label mb-3">Description</h3>
                   <p className="text-lg text-bloom-black leading-relaxed">
                      {activeStory.description}
                   </p>
                </div>
                <div>
                   <h3 className="bloom-section-label mb-3">Use Case</h3>
                   <p className="text-sm text-bloom-text-dim italic leading-relaxed">
                      "{activeStory.useCase}"
                   </p>
                </div>
             </div>
          </section>

          {/* ── Live Playground ──────────────────────────────────── */}
          <section className="bg-white rounded-2xl shadow-bloom-md border border-bloom-gray overflow-hidden">
             <div className="bg-bloom-bg-subtle border-b border-bloom-gray p-4 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-bloom-text-dim">Live Demo</span>
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-bloom-gray"></div>
                   <div className="w-3 h-3 rounded-full bg-bloom-gray"></div>
                   <div className="w-3 h-3 rounded-full bg-bloom-gray"></div>
                </div>
             </div>
             
             <div className="p-10 flex justify-center min-h-[400px]">
                {activeStoryId === 'welcome' && (
                  <div className="text-center max-w-2xl mt-10">
                     <h1 className="text-5xl font-black text-bloom-black mb-6">Built for Research.</h1>
                     <p className="text-xl text-bloom-text-dim mb-10 leading-relaxed">
                        The Research Tool Library is a collection of high-fidelity, high-orthogonality components 
                        designed for the future of conversation analysis and Human-AI interaction.
                     </p>
                     <div className="flex justify-center gap-4">
                        <div className="bloom-pill bloom-pill-yellow">Explore Viz</div>
                        <div className="bloom-pill bloom-pill-orange">UI Components</div>
                        <div className="bloom-pill bloom-pill-black">Annotation Tools</div>
                     </div>
                     
                     <div className="mt-20 grid grid-cols-3 gap-6">
                        {[
                           { icon: <FlaskConical className="text-bloom-purple" />, label: 'Empirical' },
                           { icon: <MousePointer className="text-bloom-orange" />, label: 'Interactive' },
                           { icon: <Type className="text-bloom-green" />, label: 'Qualitative' }
                        ].map((item, i) => (
                           <div key={i} className="flex flex-col items-center gap-3 p-6 bg-bloom-bg-subtle rounded-2xl border border-bloom-gray">
                              {item.icon}
                              <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeStoryId === 'radial-layout' && (
                  <TopologyNetwork 
                    data={MOCK_GRAPH_DATA} 
                    width={400} 
                    height={400} 
                    onNodeClick={node => setActiveMsg(node.id)}
                  />
                )}

                {activeStoryId === 'transition-flow' && (
                  <StateTransitionFlow
                    matrix={transitionMatrix}
                    width={500}
                    height={400}
                    colorMap={Object.fromEntries(
                      DEFAULT_TAXONOMY.dimensions[1].categories.map(c => [c.name, c.color])
                    )}
                  />
                )}

                {activeStoryId === 'heatmap' && (
                  <CooccurrenceMatrix
                    data={HEATMAP}
                    rows={DEFAULT_TAXONOMY.dimensions[1].categories.map(c => c.name)}
                    cols={DEFAULT_TAXONOMY.dimensions[2].categories.map(c => c.name)}
                    width={500}
                    height={380}
                  />
                )}

                {activeStoryId === 'transcript' && (
                   <div className="w-full max-w-3xl border border-bloom-gray rounded-xl overflow-hidden shadow-sm">
                      <TranscriptViewer 
                        messages={activeConv.messages as Message[]} 
                        onMessageClick={id => setActiveMsg(id)}
                        highlightedId={activeMsg}
                      />
                   </div>
                )}

                {activeStoryId === 'annotation' && (
                   <div className="w-full max-w-lg space-y-6">
                      <CodingForm
                         title="Categorical Field Entry"
                         fields={[
                           { id: 'cat', label: 'Primary Category', type: 'select', options: DEFAULT_TAXONOMY.dimensions[1].categories.map(c => c.name) },
                           { id: 'confidence', label: 'Confidence Score', type: 'select', options: ['Low', 'Medium', 'High'] },
                           { id: 'notes', label: 'Qualitative Synthesis', type: 'text' }
                         ]}
                         onSubmit={d => console.log('Saved Story:', d)}
                      />
                   </div>
                )}

                {activeStoryId === 'datatable' && (
                   <div className="w-full bg-white border border-bloom-gray rounded-xl">
                      <DataTable
                        searchable
                        columns={[
                          { key: 'id', label: 'ID' },
                          { key: 'turns', label: 'Turns' },
                          { key: 'dominant', label: 'Dominant Role', render: (v: string) => (
                            <Badge label={v} color={colorFor(DEFAULT_TAXONOMY, 'd2', v)} />
                          )},
                        ]}
                        data={CONVERSATIONS.map(c => ({
                          id: c.id,
                          turns: c.messages.length,
                          dominant: DEFAULT_TAXONOMY.dimensions[1].categories[Math.floor(Math.random() * 6)].name
                        }))}
                        onRowClick={r => alert(`Selected ${r.id}`)}
                      />
                   </div>
                )}

                {activeStoryId === 'kpi-grid' && (
                   <div className="w-full max-w-4xl">
                      <KPIGrid items={[
                        { label: 'Total Stories', value: STORIES.length, color: '#f5c542' },
                        { label: 'Lab Tokens', value: 12, color: '#e85a3c' },
                        { icon: <Component />, label: 'Components', value: STORIES.filter(s => s.category !== 'Overview').length },
                        { label: 'Uptime', value: '100%', color: '#22c55e' }
                      ]} />
                   </div>
                )}

                {activeStoryId === 'document-portrait' && (
                   <div className="w-full bg-white p-6 border border-bloom-gray rounded-xl">
                      <DocumentPortrait
                        rows={portraitRows}
                        rowHeight={10}
                        onRowClick={id => alert(`Focusing on Doc: ${id}`)}
                      />
                   </div>
                )}

                {activeStoryId === 'multi-track' && (
                   <div className="w-full bg-white p-8 border border-bloom-gray rounded-xl shadow-inner overflow-x-auto">
                      <MultiTrackTimeline tracks={multiTracks} cellSize={18} />
                   </div>
                )}

                {activeStoryId === 'tpl-corpus' && <div className="w-full"><CorpusAudit /></div>}
                {activeStoryId === 'tpl-sequence' && <div className="w-full"><SequenceExplorer /></div>}
                {activeStoryId === 'tpl-structural' && <div className="w-full"><StructuralDiagnostic /></div>}
                {activeStoryId === 'tpl-affective' && <div className="w-full"><AffectivePortrait /></div>}
                {activeStoryId === 'tpl-transition' && <div className="w-full"><RoleTransitionLab /></div>}
                {activeStoryId === 'tpl-calibration' && <div className="w-full"><CalibrationSuite /></div>}
                {activeStoryId === 'tpl-cartography' && <div className="w-full"><InteractionCartography /></div>}
             </div>
          </section>
          
          {/* ── Footer ───────────────────────────────────────────── */}
          <footer className="mt-20 pt-10 border-t border-bloom-gray text-center">
             <p className="text-xs text-bloom-text-dim uppercase tracking-[3px]">
                COPHEE Research Lab • Interactional Cartography Suite • 2026
             </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
