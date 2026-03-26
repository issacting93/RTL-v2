import React, { useState } from 'react';
import { SequenceBatchManager, ProtocolDraftingWorkspace, TranscriptViewer } from '@research-tools/ui';
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
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] bg-bloom-bg min-h-[calc(100vh-200px)] rounded-[40px] overflow-hidden border border-bloom-gray shadow-bloom-xl">
                <div className="p-8 space-y-8 overflow-y-auto">
                  <div className="bg-bloom-black text-white p-8 rounded-3xl flex items-center justify-between shadow-bloom-lg">
                     <div>
                        <h2 className="text-xl font-black tracking-tight mb-1">Coding Sequence: {selectedItem.external_id}</h2>
                        <p className="text-xs opacity-60 font-medium uppercase tracking-widest">Turns 1-{MOCK_SEQUENCE_TURNS.length} · Research Suite v2.2</p>
                     </div>
                     <div className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                        Live Session
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-bloom-text-dim px-2">Interactive Transcript</h3>
                    <div className="bg-white/50 rounded-3xl p-6 border border-bloom-gray/50 shadow-inner">
                      <TranscriptViewer 
                        messages={MOCK_SEQUENCE_TURNS.map(t => ({
                          id: `t-${t.idx}`,
                          speaker: t.d2 === 'Seeker' ? 'user' : 'assistant',
                          role: t.d2 === 'Seeker' ? undefined : (t.d2 === 'Advisor' || t.d2 === 'Listener' || t.d2 === 'Coach' || t.d2 === 'Navigator' || t.d2 === 'Companion' ? t.d2 : undefined),
                          content: t.text
                        }))} 
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-bloom-yellow/5 rounded-3xl border border-bloom-yellow/20 flex items-start gap-4">
                     <AlertCircle className="w-6 h-6 text-bloom-yellow shrink-0" />
                     <p className="text-sm text-bloom-text-dim font-medium leading-relaxed">
                       <strong className="text-bloom-black uppercase mr-2 tracking-wider">Protocol Note:</strong> 
                       Ensure you have reviewed the Coder Guide (§4.2) regarding "Paradox Risk" before submitting this sequence.
                     </p>
                  </div>
                </div>

                <div className="sticky top-0 bg-white shadow-bloom-md z-10">
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
