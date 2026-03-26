import { TopologyNetwork, EventLifecycle } from '@research-tools/viz';
import { KPIGrid } from '@research-tools/ui';
import { ShieldAlert, ShieldCheck, Zap, Activity } from 'lucide-react';
import { MOCK_LIFECYCLE_EVENTS, MOCK_GRAPH_DATA } from './mockData';

export const StructuralDiagnostic: React.FC = () => {
  const kpis = [
    { label: 'Violations', value: '2', icon: <ShieldAlert className="w-5 h-5" />, detail: 'Total structural breaks' },
    { label: 'Repairs', value: '1', icon: <ShieldCheck className="w-5 h-5" />, detail: 'Successful re-alignments' },
    { label: 'Constraint Density', value: '3.5', icon: <Zap className="w-5 h-5" />, detail: 'Active rules per turn' },
    { label: 'Stability Index', value: '0.92', icon: <Activity className="w-5 h-5" />, detail: 'Interactional robustness' },
  ];

  // Radial mock data
  const messages: any[] = [
    { id: '1', speaker: 'user', content: 'hello', metadata: { tension: 0.2 } },
    { id: '2', speaker: 'agent', content: 'hi', metadata: { tension: 0.5 } },
  ];

  const lifecycleEvents: any[] = MOCK_LIFECYCLE_EVENTS;

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-700">
      <header>
        <h1 className="text-4xl font-black text-bloom-black mb-2 tracking-tight">Interaction Stability Suite</h1>
        <p className="text-bloom-text-dim max-w-2xl font-medium leading-relaxed">
          Identifying and analyzing interactional rule violations. This suite synchronizes structural topology (Radial) with temporal event lifecycles.
        </p>
      </header>

      <KPIGrid items={kpis} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        {/* Structural Topology */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Interaction Topology</h2>
            <span className="text-[10px] font-bold text-bloom-orange bg-bloom-orange/10 px-2 py-0.5 rounded-full border border-bloom-orange/20">Active Violations</span>
          </div>
          <div className="bg-white rounded-3xl p-4 border border-bloom-gray shadow-bloom-md aspect-square flex items-center justify-center overflow-hidden">
            <TopologyNetwork 
              data={MOCK_GRAPH_DATA} 
              width={360} 
              height={360} 
            />
          </div>
          <div className="p-4 bg-bloom-bg-subtle rounded-2xl border border-bloom-gray">
             <h4 className="text-[10px] font-black text-bloom-black uppercase mb-1">Stability Alert</h4>
             <p className="text-xs text-bloom-text-dim font-medium">
               The red link indicates a persistent stability violation at Turn 12.
             </p>
          </div>
        </section>

        {/* Temporal Lifecycle */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-bloom-black">Event Lifecycle Timeline</h2>
          <EventLifecycle 
            events={lifecycleEvents} 
            maxTurns={30} 
            height={400} 
          />
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white border border-bloom-gray rounded-3xl shadow-bloom-sm space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-bloom-orange/10 flex items-center justify-center text-bloom-orange">
                      <ShieldAlert className="w-4 h-4" />
                   </div>
                   <h3 className="text-sm font-black text-bloom-black uppercase">Critical Violation</h3>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-bloom-text-dim">CONSTRAINT</span>
                      <span className="text-bloom-black">C1: Accountability</span>
                   </div>
                   <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-bloom-text-dim">TURN</span>
                      <span className="text-bloom-black">#12</span>
                   </div>
                   <p className="text-[11px] text-bloom-text-dim leading-relaxed pt-2">
                      Agent provided unsolicited advice without explicit user request, violating the 'Accountability' constraint.
                   </p>
                </div>
             </div>

             <div className="p-6 bg-white border border-bloom-gray rounded-3xl shadow-bloom-sm space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-bloom-green/10 flex items-center justify-center text-bloom-green">
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                   <h3 className="text-sm font-black text-bloom-black uppercase">Successful Repair</h3>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-bloom-text-dim">CONSTRAINT</span>
                      <span className="text-bloom-black">C1: Accountability</span>
                   </div>
                   <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-bloom-text-dim">TURN</span>
                      <span className="text-bloom-black">#15</span>
                   </div>
                   <p className="text-[11px] text-bloom-text-dim leading-relaxed pt-2">
                      Agent successfully repaired the previous violation by explicitly acknowledging the user's agency.
                   </p>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};
