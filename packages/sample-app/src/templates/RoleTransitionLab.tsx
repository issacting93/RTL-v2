import { StateTransitionFlow, ParadoxHeatmap, CooccurrenceMatrix } from '@research-tools/viz';
import { KPIGrid, ParticipationSummary } from '@research-tools/ui';
import { RefreshCcw, TrendingUp, Zap, Target, Users } from 'lucide-react';
import { MOCK_PARADOX_STATS, MOCK_ROLE_DISTRIBUTION } from './mockData';

export const RoleTransitionLab: React.FC = () => {
  const kpis = [
    { label: 'Transition Rate', value: '4.2', icon: <RefreshCcw className="w-5 h-5" />, detail: 'Shifts per minute' },
    { label: 'Peak Index', value: 'High', icon: <Zap className="w-5 h-5" />, detail: 'At mid-conversation' },
    { label: 'Shift Entropy', value: 'Low', icon: <Target className="w-5 h-5" />, detail: 'Predictability score' },
    { label: 'Escalation Index', value: '1.2x', icon: <TrendingUp className="w-5 h-5" />, detail: 'Growth rate' },
  ];

  // Transition flow mock data
  const tfNodes = [
    { id: 'Role 01', group: 'passive' },
    { id: 'Role 04', group: 'active' },
    { id: 'Role 03', group: 'supportive' },
    { id: 'Role 06', group: 'active' },
    { id: 'Role 05', group: 'passive' },
  ];

  // D2xD3 mock data
  const d2xd3Data = [
    { row: 'Role 04', col: 'Strategy E', value: 15 },
    { row: 'Role 04', col: 'Strategy F', value: 10 },
    { row: 'Role 01', col: 'Strategy D', value: 20 },
    { row: 'Role 01', col: 'Strategy A', value: 18 },
    { row: 'Role 03', col: 'Strategy B', value: 12 },
    { row: 'Role 03', col: 'Strategy A', value: 8 },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-1000">
      <header>
        <h1 className="text-4xl font-black text-bloom-black mb-2 tracking-tight">Participant Dynamics Lab</h1>
        <p className="text-bloom-text-dim max-w-2xl font-medium leading-relaxed">
          Tracking the evolution of participant behavior and alignment patterns across an interaction.
        </p>
      </header>

      <KPIGrid items={kpis} columns={4} />

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-bloom-purple" />
          <h2 className="text-lg font-black uppercase tracking-widest text-bloom-black">Role Distribution</h2>
        </div>
        <ParticipationSummary
          humanRoleDist={MOCK_ROLE_DISTRIBUTION.human}
          aiRoleDist={MOCK_ROLE_DISTRIBUTION.ai}
        />
        <div className="p-4 bg-bloom-bg-subtle rounded-xl border border-bloom-gray">
          <p className="text-xs text-bloom-text-dim font-medium leading-relaxed">
            <strong className="text-bloom-black uppercase mr-2">Insight:</strong>
            This view compares the distribution profile across participant groups. Note the higher frequency of Role 04 in the second group.
          </p>
        </div>
      </section>

      <section className="space-y-4">
         <div className="flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Relationship Mapping</h2>
            <span className="text-[10px] font-black text-bloom-black border border-bloom-gray px-2 py-0.5 rounded-full bg-bloom-bg-subtle">Participant Sequence</span>
         </div>
         <div className="bg-white rounded-[40px] p-8 border border-bloom-gray shadow-bloom-md aspect-video flex items-center justify-center overflow-hidden">
            <StateTransitionFlow
              matrix={{
                labels: tfNodes.map(n => n.id),
                matrix: [[0, 10, 0, 0, 4], [0, 15, 0, 8, 0], [12, 0, 0, 0, 0], [0, 0, 5, 0, 0], [0, 0, 0, 0, 0]]
              }}
              width={800}
              height={500}
            />
         </div>
      </section>

      {/* Role x Strategy Density */}
      <section className="space-y-4">
         <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Label 02 × Label 03 Density</h2>
         <div className="bg-white rounded-[40px] p-8 border border-bloom-gray shadow-bloom-md">
           <CooccurrenceMatrix
             data={d2xd3Data}
             rows={['Role 04', 'Role 01', 'Role 03']}
             cols={['Strategy E', 'Strategy F', 'Strategy D', 'Strategy A', 'Strategy B']}
             height={500}
           />
         </div>
         <div className="p-4 bg-bloom-bg-subtle border border-bloom-gray rounded-3xl">
            <p className="text-[10px] text-bloom-text-dim font-bold uppercase mb-1">Observation</p>
            <p className="text-xs text-bloom-text-dim leading-relaxed">
              Strong co-occurrence between <strong className="text-bloom-black">Role 04</strong> and <strong className="text-bloom-black">Strategy E</strong> confirms consistent patterns in the dataset.
            </p>
         </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Visualise Distribution</h2>
        <ParadoxHeatmap
           data={MOCK_PARADOX_STATS}
           bins={10}
           title="Visualise Distribution"
        />
        <div className="bg-bloom-black text-white p-8 rounded-3xl flex items-center gap-8 shadow-bloom-xl overflow-hidden relative">
           <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-bloom-yellow/10 rounded-full blur-[60px]"></div>
           <div className="shrink-0 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-bloom-yellow">
              <TrendingUp className="w-8 h-8" />
           </div>
           <div>
              <h3 className="font-black text-lg mb-1 tracking-tight">Insight: The Mid-Sequence Peak</h3>
              <p className="text-xs opacity-60 font-medium leading-relaxed">
                Cross-category moves typically peak between 30%–60% of the sequence span, reflecting a transitional phase where patterns shift.
              </p>
           </div>
        </div>
      </section>
    </div>
  );
};
