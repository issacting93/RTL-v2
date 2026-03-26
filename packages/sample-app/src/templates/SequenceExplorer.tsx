import React, { useState } from 'react';
import { SequenceTimeline, MultiTrackTimeline, TopologyNetwork } from '@research-tools/viz';
import { KPIGrid, Badge } from '@research-tools/ui';
import { MessageSquare, RefreshCcw, User, Zap, Share2 } from 'lucide-react';
import { DEFAULT_TAXONOMY, colorFor } from '@research-tools/core';
import { MOCK_SEQUENCE_TURNS, MOCK_SEQUENCE_ROLES, MOCK_GRAPH_DATA } from './mockData';

export const SequenceExplorer: React.FC = () => {
  const [selectedTurn, setSelectedTurn] = useState<number | null>(null);

  const kpis = [
    { label: 'Seq Length', value: MOCK_SEQUENCE_TURNS.length, icon: <MessageSquare className="w-5 h-5" />, detail: 'Total turns in sequence' },
    { label: 'Role Shifts', value: '3', icon: <RefreshCcw className="w-5 h-5" />, detail: 'Dominant role transitions' },
    { label: 'Human Ratio', value: '50%', icon: <User className="w-5 h-5" />, detail: 'Participation balance' },
    { label: 'Advocacy Burst', value: 'High', icon: <Zap className="w-5 h-5" />, detail: 'At turns 6-8' },
  ];

  const getColor = (role: string) => colorFor(DEFAULT_TAXONOMY, 'd2', role);

  const roleSegments = MOCK_SEQUENCE_ROLES.map(r => ({
    value: r.role,
    count: r.end - r.start + 1,
    color: getColor(r.role)
  }));

  const tracks = ['d1', 'd2', 'd3'].map(dim => ({
    id: dim,
    label: dim.toUpperCase(),
    cells: MOCK_SEQUENCE_TURNS.map(t => ({
      value: t[dim as keyof typeof t] as string,
      color: getColor(t.d2), // simplified for mock
      tooltip: `${dim.toUpperCase()}: ${t[dim as keyof typeof t]}`
    }))
  }));

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-bloom-black mb-2 tracking-tight">Conversation Explorer</h1>
          <p className="text-bloom-text-dim max-w-2xl font-medium">
            Deep-dive into a single conversation sequence. Synchronized views of participant dynamics and raw transcript.
          </p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1.5 bg-bloom-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">SEQ_ID: EX_042</span>
        </div>
      </header>

      <KPIGrid items={kpis} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Advanced Radial Component */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-bloom-purple" />
            <h2 className="text-lg font-black uppercase tracking-widest text-bloom-black">Interaction Topology</h2>
          </div>
          <div className="bg-white border border-bloom-gray rounded-3xl p-4 shadow-bloom-lg overflow-hidden flex justify-center">
            <TopologyNetwork 
              data={MOCK_GRAPH_DATA} 
              width={500} 
              height={500} 
              onNodeClick={(n) => console.log('Node:', n)}
            />
          </div>
          <div className="p-4 bg-bloom-bg-subtle rounded-xl border border-bloom-gray">
            <p className="text-xs text-bloom-text-dim font-medium leading-relaxed">
              <strong className="text-bloom-black uppercase mr-2">Structural Logic:</strong> 
              Concentric rings represent interactional modes. Links show sequential flow and structural violations.
            </p>
          </div>
        </section>

        {/* Trajectory Header moved here or kept? I'll keep it simple */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Participant Dynamics</h2>
          </div>
          <div className="bg-bloom-bg-subtle border border-bloom-gray rounded-3xl p-8">
            <SequenceTimeline segments={roleSegments} />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        {/* ... (rest of the file) */}
        {/* Dimensions Timeline */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Dimensional Tracks (D1, D2, D3)</h2>
          <MultiTrackTimeline 
            tracks={tracks} 
            onCellClick={(_, idx) => setSelectedTurn(idx)}
          />
          <div className="p-4 bg-white border border-bloom-gray rounded-2xl shadow-bloom-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-bloom-yellow/20 flex items-center justify-center text-bloom-yellow shrink-0">
               <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-bloom-black uppercase mb-1">Interactional Tip</p>
              <p className="text-xs text-bloom-text-dim font-medium leading-relaxed">
                Click any cell in the timeline to highlight the corresponding turn in the transcript. Observe how Participation Roles (D2) often precede specific Strategy shifts (D3).
              </p>
            </div>
          </div>
        </section>

        {/* Transcript View */}
        <section className="space-y-4 flex flex-col h-full">
           <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Transcript</h2>
           <div className="flex-1 bg-white border border-bloom-gray rounded-3xl overflow-hidden flex flex-col max-h-[600px] shadow-bloom-lg">
              <div className="p-4 border-bottom border-bloom-gray bg-bloom-bg-subtle flex justify-between items-center">
                 <span className="text-[10px] font-black text-bloom-text-dim uppercase tracking-widest">Dialogue Flow</span>
                 <Badge variant="bloom">LIVE</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {MOCK_SEQUENCE_TURNS.map((turn) => (
                  <div 
                    key={turn.idx} 
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      selectedTurn === turn.idx 
                        ? 'bg-bloom-bg-subtle border-bloom-black scale-[1.02] shadow-bloom-md ring-1 ring-bloom-black/10' 
                        : 'bg-white border-bloom-gray/40 hover:border-bloom-gray hover:bg-bloom-bg-subtle/50'
                    }`}
                    onClick={() => setSelectedTurn(turn.idx)}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <span className={`text-[9px] font-black uppercase tracking-widest ${turn.d2 === 'Seeker' ? 'text-bloom-orange' : 'text-bloom-black'}`}>
                        {turn.d2 === 'Seeker' ? 'User (Subject)' : `Participant (${turn.d2})`}
                       </span>
                       <span className="text-[9px] font-bold text-bloom-text-dim">#{turn.idx}</span>
                    </div>
                    <p className="text-sm font-medium text-bloom-black leading-relaxed">{turn.text}</p>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                       <Badge variant="outline" label={turn.d1} />
                       <Badge variant="bloom" label={turn.d3} />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};
