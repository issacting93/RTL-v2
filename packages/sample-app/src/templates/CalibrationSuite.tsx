import React, { useState } from 'react';
import { SequenceBatchManager, ProtocolDraftingWorkspace } from '@research-tools/ui';
import { Database, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import { MOCK_CALIBRATION_ITEMS, MOCK_SEQUENCE_TURNS } from './mockData';

export const CalibrationSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'batch' | 'annotate'>('batch');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleSelect = (item: any) => {
    setSelectedItem(item);
    setActiveTab('annotate');
  };

  const mockCalibrationItems = MOCK_CALIBRATION_ITEMS.map(item => ({
    ...item,
    status: (['pending', 'coded', 'partially_coded'].includes(item.status) ? item.status : 'pending') as 'pending' | 'coded' | 'partially_coded'
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-bloom-black mb-2 tracking-tight">Annotation Workspace</h1>
          <p className="text-bloom-text-dim max-w-2xl font-medium leading-relaxed">
            Integrated protocol for human annotation and batch management. Perform high-fidelity coding and calibrate ground-truth tasks.
          </p>
        </div>
        <div className="flex bg-bloom-bg-subtle p-1 rounded-2xl border border-bloom-gray">
          <button 
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'batch' ? 'bg-white shadow-bloom-sm text-bloom-black' : 'text-bloom-text-dim'}`}
          >
            <div className="flex items-center gap-2">
              <Database size={14} /> Batch Manager
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('annotate')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'annotate' ? 'bg-white shadow-bloom-sm text-bloom-black' : 'text-bloom-text-dim'}`}
          >
            <div className="flex items-center gap-2">
              <Edit3 size={14} /> Protocol Form
            </div>
          </button>
        </div>
      </header>

      {activeTab === 'batch' ? (
        <section className="animate-in slide-in-from-left-4 duration-500">
          <SequenceBatchManager 
            items={mockCalibrationItems} 
            onSelect={handleSelect}
            currentId={selectedItem?.id}
          />
        </section>
      ) : (
        <section className="animate-in slide-in-from-right-4 duration-500">
          {selectedItem ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8">
              <div className="space-y-6">
                <div className="bg-bloom-black text-white p-6 rounded-3xl flex items-center justify-between">
                   <div>
                      <h2 className="text-lg font-black tracking-tight">Coding Sequence: {selectedItem.external_id}</h2>
                      <p className="text-xs opacity-60 font-medium">Turns 1-10 · Research Suite v2.2</p>
                   </div>
                   <div className="flex gap-2">
                      <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Live Session</div>
                   </div>
                </div>
                
                <div className="bg-white border border-bloom-gray rounded-[40px] p-8 shadow-bloom-xl space-y-6">
                  {MOCK_SEQUENCE_TURNS.map((turn, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-bloom-bg-subtle border border-bloom-gray flex items-center justify-center text-[10px] font-black text-bloom-text-dim">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${turn.d2 === 'Seeker' ? 'text-bloom-orange' : 'text-bloom-black'}`}>
                          {turn.d2 === 'Seeker' ? 'User (Seeker)' : `Supporter (${turn.d2})`}
                        </p>
                        <p className="text-sm font-medium text-bloom-black leading-relaxed">{turn.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-bloom-bg-subtle rounded-2xl border border-bloom-gray flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-bloom-yellow shrink-0" />
                   <p className="text-xs text-bloom-text-dim font-medium leading-relaxed">
                     <strong className="text-bloom-black uppercase mr-2">Protocol Note:</strong> 
                     Ensure you have reviewed the Coder Guide (§4.2) regarding "Paradox Risk" before submitting this sequence.
                   </p>
                </div>
              </div>

              <div className="sticky top-8">
                <ProtocolDraftingWorkspace 
                  conversationId={selectedItem.external_id}
                  sequence={{
                    id: selectedItem.id,
                    turns: MOCK_SEQUENCE_TURNS.map(t => ({
                      id: String(Math.random()),
                      speaker: t.d2 === 'Seeker' ? 'seeker' : 'supporter',
                      text: t.text
                    }))
                  }}
                  onSaveAnnotation={async (data: any) => {
                    console.log('Saved Annotation:', data);
                  }}
                  onSaveStance={async (stance: any, notes: string) => {
                    console.log('Saved Stance:', stance, notes);
                  }}
                  existingStance={selectedItem.stance}
                />
              </div>
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center bg-bloom-bg-subtle rounded-[40px] border-2 border-dashed border-bloom-gray text-center space-y-4">
               <Database size={48} className="text-bloom-gray-dark" />
               <div>
                  <h3 className="text-xl font-black text-bloom-black tracking-tight">No Sequence Selected</h3>
                  <p className="text-sm text-bloom-text-dim font-medium">Please select a sequence from the Batch Manager to begin coding.</p>
               </div>
               <button 
                 onClick={() => setActiveTab('batch')}
                 className="px-6 py-3 bg-bloom-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-bloom-md"
               >
                 Go to Batch Manager
               </button>
            </div>
          )}
        </section>
      )}

      {/* Footer Status */}
      <footer className="pt-8 border-t border-bloom-gray flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <CheckCircle size={14} className="text-bloom-green" />
               <span className="text-[10px] font-bold text-bloom-text-dim uppercase">Verified Bloom Core</span>
            </div>
            <div className="flex items-center gap-2">
               <CheckCircle size={14} className="text-bloom-green" />
               <span className="text-[10px] font-bold text-bloom-text-dim uppercase">Standard Research Taxonomy</span>
            </div>
         </div>
         <p className="text-[10px] font-black text-bloom-text-dim uppercase tracking-tighter">Laboratory Session · 2026</p>
      </footer>
    </div>
  );
};
