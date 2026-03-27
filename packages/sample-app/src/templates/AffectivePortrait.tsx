import { AffectiveSparklines, DominanceGauge, DocumentPortrait } from '@research-tools/viz';
import { KPIGrid } from '@research-tools/ui';
import { Heart, Zap, User, BarChart } from 'lucide-react';
import { DEFAULT_TAXONOMY, colorFor } from '@research-tools/core';
import { MOCK_PAD_DATA } from './mockData';

export const AffectivePortrait: React.FC = () => {
  const kpis = [
    { label: 'Avg Pleasure', value: '+0.42', icon: <Heart className="w-5 h-5" />, detail: 'Overall sentiment score' },
    { label: 'Peak Arousal', value: '0.85', icon: <Zap className="w-5 h-5" />, detail: 'Max emotional intensity' },
    { label: 'Dominance Delta', value: '15%', icon: <BarChart className="w-5 h-5" />, detail: 'Difference in participation' },
    { label: 'Stability', value: 'High', icon: <User className="w-5 h-5" />, detail: 'Consistency score' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header>
        <h1 className="text-4xl font-black text-bloom-black mb-2 tracking-tight">Emotional Dynamics Portrait</h1>
        <p className="text-bloom-text-dim max-w-2xl font-medium leading-relaxed">
          Multi-dimensional tracking of emotional state and participant balance. Analysis of Pleasure, Arousal, and Dominance (PAD).
        </p>
      </header>

      <KPIGrid items={kpis} columns={4} />

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Affective Sparklines (Synchronized)</h2>
        <AffectiveSparklines data={MOCK_PAD_DATA} height={300} />
        <div className="p-4 bg-bloom-bg-subtle rounded-3xl border border-bloom-gray">
           <p className="text-xs text-bloom-text-dim font-medium leading-relaxed">
             <strong className="text-bloom-black uppercase mr-2">Research Insight:</strong> 
             Notice how <span className="text-bloom-green font-bold">Pleasure</span> remains high while <span className="text-bloom-orange font-bold">Arousal</span> fluctuates during the mediation phase (Turns 10-20). This suggests a calm but intensive problem-solving session.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dominance Gauge */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Presence & Dominance</h2>
          <DominanceGauge 
            labelA="Human Seeker" 
            valueA={45} 
            labelB="AI Supporter" 
            valueB={55} 
            title="Participation Balance"
          />
          <div className="bg-white rounded-3xl p-8 border border-bloom-gray shadow-bloom-sm space-y-4">
             <h3 className="text-xs font-black text-bloom-black uppercase border-b border-bloom-gray pb-2">Dialogue Density</h3>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold">
                   <span className="text-bloom-text-dim">TOTAL TURNS</span>
                   <span className="text-bloom-black">100</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold">
                   <span className="text-bloom-text-dim">AVG WORDS/TURN</span>
                   <span className="text-bloom-black">24.5</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold">
                   <span className="text-bloom-text-dim">LONG-FORM RATIO</span>
                   <span className="text-bloom-black">12%</span>
                </div>
             </div>
          </div>
        </section>

        {/* Global Document View */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Document Portrait (Global)</h2>
          <div className="bg-bloom-black p-8 rounded-[40px] shadow-bloom-xl aspect-[4/3] flex items-center justify-center relative overflow-hidden">
             {/* Decorative element */}
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-bloom-yellow/10 blur-[80px] rounded-full"></div>
             
             <DocumentPortrait
               rows={[{
                 id: 'Portrait_1',
                 label: 'Sequence Overview',
                 cells: [
                   { color: colorFor(DEFAULT_TAXONOMY, 'd2', 'Role 05'), tooltip: 'Phase 1' },
                   { color: colorFor(DEFAULT_TAXONOMY, 'd2', 'Role 01'), tooltip: 'Phase 2' },
                   { color: colorFor(DEFAULT_TAXONOMY, 'd2', 'Role 03'), tooltip: 'Phase 3' },
                   { color: colorFor(DEFAULT_TAXONOMY, 'd2', 'Role 02'), tooltip: 'Phase 4' },
                   { color: colorFor(DEFAULT_TAXONOMY, 'd2', 'Role 06'), tooltip: 'Phase 5' },
                 ]
               }]}
               rowHeight={40}
             />
          </div>
        </section>
      </div>
    </div>
  );
};
