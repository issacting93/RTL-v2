import React, { useState } from 'react';
import { 
  theme, 
  GlassCard, 
  TranscriptViewer, 
  AnnotationDesk, 
  PremiumButton 
} from '@research-tools/ui';
import { 
  RadialLayout, 
  D2xD3Heatmap 
} from '@research-tools/viz';
import { 
  calculateConversationMetrics 
} from '@research-tools/core';

const MOCK_MESSAGES = [
  { id: '1', speaker: 'user', content: 'What is the impact of AI on clinical empathy?', role: 'Seeker', metadata: { tension: 0.4 } },
  { id: '2', speaker: 'assistant', content: 'Studies show that AI can augment certain aspects of empathy by reducing administrative burden.', role: 'Expert', metadata: { tension: 0.2 } },
  { id: '3', speaker: 'user', content: 'But does it lose the human touch?', role: 'Seeker', metadata: { tension: 0.7 } },
  { id: '4', speaker: 'assistant', content: 'That is a key concern. Balancing automation with human presence is critical.', role: 'Guide', metadata: { tension: 0.3 } },
];

const HEATMAP_DATA = [
  { row: 'Expert', col: 'D3.1', value: 10 },
  { row: 'Expert', col: 'D3.2', value: 5 },
  { row: 'Guide', col: 'D3.1', value: 2 },
  { row: 'Guide', col: 'D3.2', value: 12 },
];

export default function App() {
  const [activeMsg, setActiveMsg] = useState<string | undefined>();
  const metrics = calculateConversationMetrics({ id: 'conv-1', messages: MOCK_MESSAGES as any });

  return (
    <div style={{ 
      background: theme.colors.background, 
      minHeight: '100vh', 
      padding: '40px', 
      color: theme.colors.text.primary,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ 
            background: theme.gradients.premium, 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontSize: '32px',
            marginBottom: '8px'
          }}>
            AROMA Research Dashboard
          </h1>
          <p style={{ color: theme.colors.text.secondary }}>Phase 3 Calibration Workspace</p>
        </div>
        <PremiumButton onClick={() => alert('Exporting data...')}>
          Export Analysis
        </PremiumButton>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <GlassCard title="Conversation Transcript">
            <TranscriptViewer 
              messages={MOCK_MESSAGES as any} 
              onMessageClick={setActiveMsg}
              highlightedId={activeMsg}
            />
          </GlassCard>

          <GlassCard title="Strategic Heatmap (D2xD3)">
            <D2xD3Heatmap 
              data={HEATMAP_DATA}
              rows={['Expert', 'Guide']}
              cols={['D3.1', 'D3.2']}
              width={500}
              height={300}
            />
          </GlassCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <GlassCard title="Role Dynamics Visualization">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadialLayout 
                messages={MOCK_MESSAGES as any} 
                width={400} 
                height={400} 
                onNodeClick={setActiveMsg}
              />
            </div>
          </GlassCard>

          <AnnotationDesk 
            title="Calibrate Observation"
            fields={[
              { id: 'role', label: 'Primary Role', type: 'select', options: ['Expert', 'Guide', 'Companion'] },
              { id: 'tension', label: 'Perceived Tension', type: 'boolean' },
              { id: 'notes', label: 'Qualitative Notes', type: 'text' }
            ]}
            onSubmit={(data) => console.log('Saved:', data)}
          />

          <GlassCard title="Quick Metrics">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ color: theme.colors.text.secondary, fontSize: '12px', textTransform: 'uppercase' }}>Turns</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{metrics.turnCount}</div>
              </div>
              <div>
                <div style={{ color: theme.colors.text.secondary, fontSize: '12px', textTransform: 'uppercase' }}>Avg length</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{Math.round(metrics.avgMsgLength)} chars</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
