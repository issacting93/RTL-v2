import React from 'react';
import { ParallelSets, MosaicPlot, StabilityDoughnut, TimingHistogram } from '@research-tools/viz';
import { KPIGrid } from '@research-tools/ui';
import { Activity, Layers, BarChart3, GitBranch, ShieldAlert, PieChart } from 'lucide-react';
import { MOCK_CORPUS_TURNS, MOCK_STABILITY_DATA, MOCK_VIOLATION_TIMING } from './mockData';

export const CorpusAudit: React.FC = () => {
  // ... (keeping existing logic)
  const kpis = [
    { label: 'Total Turns', value: MOCK_CORPUS_TURNS.length, icon: <Activity className="w-5 h-5" />, detail: 'Across entire corpus' },
    { label: 'Orthogonality', value: '88%', icon: <Layers className="w-5 h-5" />, detail: 'Dimension independence score' },
    { label: 'Role Coverage', value: '6/6', icon: <BarChart3 className="w-5 h-5" />, detail: 'Active care roles' },
    { label: 'Avg Path Depth', value: '3.2', icon: <GitBranch className="w-5 h-5" />, detail: 'D1 → D2 → D3 transitions' },
  ];

  const psDimensions = [
    { key: 'd1', label: 'Functional Type (D1)' },
    { key: 'd2', label: 'Participation Role (D2)' },
    { key: 'd3', label: 'Tactical Strategy (D3)' }
  ];

  const d2ColorScale = (val: string) => {
    const map: Record<string, string> = {
      Listener: '#3b82f6',
      Advisor: '#ef4444',
      Advocate: '#fbbf24',
      Navigator: '#8b5cf6',
      Companion: '#10b981',
      Unknown: '#94a3b8'
    };
    return map[val] || '#cbd5e1';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-4xl font-black text-bloom-black mb-2 tracking-tight">Dataset Overview</h1>
        <p className="text-bloom-text-dim max-w-2xl font-medium leading-relaxed">
          High-level overview of interactional dimensions across the entire dataset. Analysis of role distribution and multi-dimensional dependency.
        </p>
      </header>

      <KPIGrid items={kpis} columns={4} />

      {/* New Row: Stability & Timing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-bloom-orange" />
            <h2 className="text-lg font-black uppercase tracking-widest text-bloom-black">Stability Class</h2>
          </div>
          <StabilityDoughnut data={MOCK_STABILITY_DATA} size={300} />
        </section>

        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-bloom-orange" />
            <h2 className="text-lg font-black uppercase tracking-widest text-bloom-black">Violation Timing Distribution</h2>
          </div>
          <TimingHistogram data={MOCK_VIOLATION_TIMING} width={600} height={300} />
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-widest text-bloom-black">Interaction Flow</h2>
          <span className="text-[10px] font-bold text-bloom-text-dim uppercase tracking-tighter bg-bloom-bg-subtle px-2 py-1 rounded border border-bloom-gray">
            D1 → D2 → D3
          </span>
        </div>
        <ParallelSets 
          data={MOCK_CORPUS_TURNS} 
          dimensions={psDimensions} 
          colorScale={d2ColorScale}
          height={400} 
        />
        <div className="p-4 bg-bloom-bg-subtle rounded-xl border border-bloom-gray">
          <p className="text-xs text-bloom-text-dim font-medium leading-relaxed">
            <strong className="text-bloom-black uppercase mr-2">Research Insight:</strong> 
            Thicker ribbons indicate frequent interactional "paths". If the ribbons are widely dispersed across all three dimensions, it suggests a high degree of orthogonality between support types and strategies.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-widest text-bloom-black">Independence: Role × Type</h2>
          <MosaicPlot 
            data={MOCK_CORPUS_TURNS} 
            rowKey="d2" 
            colKey="d1" 
            rowLabel="Participation Role" 
            colLabel="Functional Type" 
            height={400}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black uppercase tracking-widest text-bloom-black">Independence: Role × Strategy</h2>
          <MosaicPlot 
            data={MOCK_CORPUS_TURNS} 
            rowKey="d2" 
            colKey="d3" 
            rowLabel="Participation Role" 
            colLabel="Strategy" 
            height={400}
          />
        </section>
      </div>

       <div className="p-6 bg-bloom-black text-white rounded-2xl shadow-bloom-md flex items-center justify-between group cursor-help transition-all hover:scale-[1.01]">
        <div className="max-w-xl">
          <h3 className="font-black text-lg mb-1 tracking-tight">Statistical Independence Check</h3>
          <p className="text-sm opacity-60 font-medium">
            Blue tiles indicate strong positive association (O &gt; E), while red tiles show negative association. A mostly gray grid represents statistical independence between the selected dimensions.
          </p>
        </div>
        <div className="w-12 h-12 bg-bloom-yellow rounded-full flex items-center justify-center text-bloom-black transition-transform group-hover:rotate-12">
           <Layers className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
