import React, { useState } from 'react';
import { ShieldCheck, Zap, MessageSquare, Save } from 'lucide-react';
import { theme } from '../theme';
import { 
  D2_ROLES, 
  D1_SUPPORT_TYPES, 
  D3_STRATEGIES, 
  USER_STANCES,
  getAlignment,
  type D1SupportType, 
  type D3Strategy,
  type UserStance,
  type AlignmentLevel
} from '@research-tools/core';

interface Turn {
  id: string;
  speaker: 'seeker' | 'supporter';
  text: string;
}

interface ProtocolDraftingWorkspaceProps {
  conversationId: string;
  sequence: { id: string; turns: Turn[] };
  existingStance?: UserStance;
  onSaveStance: (stance: UserStance, notes: string) => Promise<void>;
  onSaveAnnotation: (data: any) => Promise<void>;
}

const D1_HINTS: Record<string, string> = {
  'Emotional': 'Empathy, sympathy, concern directed at alleviating emotional distress.',
  'Informational': 'Advice, suggestions, factual information, or guidance.',
  'Esteem': "Affirming the recipient's worth, strengths, or positive qualities.",
  'Network': 'Connecting the recipient to others, communities, or shared experiences.',
  'Tangible': 'Offering concrete, practical assistance or crisis resources.',
  'Appraisal': 'Helping the recipient reframe or make meaning of their situation.',
};

const D2_HINTS: Record<string, string> = {
  'Listener': 'Receptive, non-directive. Mirrors, validates, follows the user\'s lead.',
  'Reflective Partner': 'Socratic, exploratory. Introduces reframes, holds open questions.',
  'Coach': 'Directive, motivating. Builds self-efficacy, supports user-defined goals.',
  'Advisor': 'Authoritative, expertise-led. Provides psychoeducation and clinical info.',
  'Companion': 'Warm, persistent presence. Relational bonding across sessions.',
  'Navigator': 'Practical, resource-oriented. Connects users to external care systems.',
  'Ambiguous': 'Decision tree does not resolve to a single role.',
  'None': 'Non-care turn (greetings, technical troubleshooting, system messages).',
};

export const ProtocolDraftingWorkspace: React.FC<ProtocolDraftingWorkspaceProps> = ({
  sequence,
  existingStance,
  onSaveStance,
  onSaveAnnotation,
}) => {
  const [loading, setLoading] = useState(false);
  const [stanceSaved, setStanceSaved] = useState(!!existingStance);

  const [stanceData, setStanceData] = useState({
    user_stance: existingStance || '' as UserStance | '',
    stance_notes: '',
  });

  const [formData, setFormData] = useState({
    primary_d2_role: '' as string,
    d1_support_type: '' as D1SupportType | '',
    d3_strategies: [] as D3Strategy[],
    confidence: 2 as 1 | 2 | 3,
    notes: '',
  });

  // Computed alignment
  const alignment = formData.primary_d2_role && stanceData.user_stance
    ? getAlignment(formData.primary_d2_role, stanceData.user_stance as UserStance)
    : null;

  const seekerTurns = sequence.turns.filter(t => t.speaker === 'seeker');
  const allTurns = sequence.turns;

  const handleStanceSubmit = async () => {
    if (!stanceData.user_stance) return;
    setLoading(true);
    await onSaveStance(stanceData.user_stance as UserStance, stanceData.stance_notes);
    setStanceSaved(true);
    setLoading(false);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    await onSaveAnnotation({
      ...formData,
      stance_mismatch: alignment,
    });
    setLoading(false);
  };

  const toggleD3 = (strategy: D3Strategy) => {
    const next = formData.d3_strategies.includes(strategy)
      ? formData.d3_strategies.filter(x => x !== strategy)
      : [...formData.d3_strategies, strategy];
    setFormData({ ...formData, d3_strategies: next });
  };

  if (!sequence) return null;

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: theme.colors.text.secondary,
    marginBottom: '16px'
  };

  const buttonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '10px 12px',
    fontSize: '12px',
    borderRadius: theme.radius.md,
    border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
    background: isSelected ? theme.colors.primary : 'white',
    color: isSelected ? 'white' : theme.colors.text.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isSelected ? theme.shadows.md : 'none',
    fontWeight: isSelected ? 600 : 400
  });

  return (
    <div style={{ padding: '24px', background: 'white', borderLeft: `1px solid ${theme.colors.border}`, height: '100%', overflowY: 'auto' }}>
      
      {/* 1. Seeker Stance */}
      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <h4 style={sectionHeaderStyle}>
          <ShieldCheck size={14} /> 1. Seeker Stance
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {USER_STANCES.map(s => (
            <button
              key={s}
              disabled={stanceSaved}
              onClick={() => setStanceData({ ...stanceData, user_stance: s })}
              style={buttonStyle(stanceData.user_stance === s)}
            >
              {s}
            </button>
          ))}
        </div>

        {!stanceSaved ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              style={{ 
                width: '100%', 
                minHeight: '80px', 
                padding: '12px', 
                borderRadius: theme.radius.md, 
                border: `1px solid ${theme.colors.border}`,
                fontSize: '13px',
                resize: 'none',
                outline: 'none'
              }}
              placeholder="Stance rationale..."
              value={stanceData.stance_notes}
              onChange={(e) => setStanceData({ ...stanceData, stance_notes: e.target.value })}
            />
            <button
              disabled={!stanceData.user_stance || loading}
              onClick={handleStanceSubmit}
              style={{ 
                padding: '14px', 
                borderRadius: theme.radius.md, 
                background: theme.colors.primary, 
                color: 'white', 
                border: 'none', 
                fontWeight: 600, 
                cursor: 'pointer',
                opacity: (!stanceData.user_stance || loading) ? 0.5 : 1
              }}
            >
              {loading ? 'Saving...' : 'Lock Stance & Reveal AI'}
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            background: 'rgba(34, 197, 94, 0.08)', 
            borderRadius: theme.radius.md, 
            border: `1px solid rgba(34, 197, 94, 0.2)` 
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: theme.colors.accent }}>{stanceData.user_stance} Stance Locked</span>
            <button 
              style={{ background: 'none', border: 'none', color: theme.colors.text.secondary, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => setStanceSaved(false)}
            >
              CHANGE
            </button>
          </div>
        )}
      </div>

      {/* 2. Annotation */}
      <div style={{ opacity: stanceSaved ? 1 : 0.4, pointerEvents: stanceSaved ? 'auto' : 'none' }}>
        <h4 style={sectionHeaderStyle}>
          <Zap size={14} /> 2. Annotate Segment
        </h4>

        {/* D1: Support Type */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: theme.colors.text.secondary, display: 'block', marginBottom: '8px' }}>
            D1: Support Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {D1_SUPPORT_TYPES.map(opt => (
              <button
                key={opt}
                title={D1_HINTS[opt]}
                onClick={() => setFormData({ ...formData, d1_support_type: opt })}
                style={buttonStyle(formData.d1_support_type === opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* D2: Care Role */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: theme.colors.text.secondary, display: 'block', marginBottom: '8px' }}>
            D2: Care Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {D2_ROLES.map(opt => (
              <button
                key={opt}
                title={D2_HINTS[opt]}
                onClick={() => setFormData({ ...formData, primary_d2_role: opt })}
                style={buttonStyle(formData.primary_d2_role === opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* D3: Strategies */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: theme.colors.text.secondary, display: 'block', marginBottom: '8px' }}>
            D3: Strategies
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {D3_STRATEGIES.map(st => {
              const isSelected = formData.d3_strategies.includes(st);
              return (
                <div
                  key={st}
                  onClick={() => toggleD3(st)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '11px',
                    borderRadius: '100px',
                    border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                    background: isSelected ? theme.colors.primary : theme.colors.backgroundSubtle,
                    color: isSelected ? 'white' : theme.colors.text.secondary,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {st}
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: theme.colors.text.secondary, display: 'block', marginBottom: '8px' }}>
            Confidence
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {([1, 2, 3] as const).map(v => (
              <button
                key={v}
                onClick={() => setFormData({ ...formData, confidence: v })}
                style={{ ...buttonStyle(formData.confidence === v), flex: 1 }}
              >
                {v === 1 ? 'Low' : v === 2 ? 'Med' : 'High'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleFinalSubmit}
          disabled={!formData.primary_d2_role || !formData.d1_support_type || loading}
          style={{ 
            width: '100%',
            padding: '16px', 
            borderRadius: theme.radius.md, 
            background: theme.gradients.premium, 
            color: 'white', 
            border: 'none', 
            fontWeight: 700, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: (!formData.primary_d2_role || !formData.d1_support_type || loading) ? 0.5 : 1
          }}
        >
          <Save size={16} /> {loading ? 'Saving...' : 'Finalize Sequence'}
        </button>
      </div>
    </div>
  );
};
