import { Message, Conversation, TaxonomyDimension, Taxonomy, HeatmapCell } from './types';

// ── Default taxonomy ────────────────────────────────────────────

const D1_SUPPORT: TaxonomyDimension = {
  id: 'd1',
  label: 'Support Type',
  categories: [
    { name: 'Emotional', color: '#5b8def', description: 'Empathy, sympathy, or concern.' },
    { name: 'Informational', color: '#16a34a', description: 'Advice, suggestions, guidance.' },
    { name: 'Appraisal', color: '#8b5cf6', description: 'Helping reframe or reinterpret.' },
    { name: 'Esteem', color: '#f59e0b', description: "Affirming the recipient's worth." },
    { name: 'Network', color: '#0ea5a4', description: 'Connecting to others or communities.' },
    { name: 'Tangible', color: '#e11d48', description: 'Concrete, practical assistance.' },
  ],
};

const D2_ROLES: TaxonomyDimension = {
  id: 'd2',
  label: 'Care Role',
  categories: [
    { name: 'Listener', color: '#5b8def', tier: 'Low', description: 'Receptive, non-directive.' },
    { name: 'Reflective Partner', color: '#8b5cf6', tier: 'Low', description: 'Socratic, exploratory.' },
    { name: 'Coach', color: '#f59e0b', tier: 'Moderate', description: 'Directive, motivating.' },
    { name: 'Advisor', color: '#e11d48', tier: 'High', description: 'Authoritative, expertise-led.' },
    { name: 'Companion', color: '#64748b', tier: 'Low', description: 'Warm relational presence.' },
    { name: 'Navigator', color: '#0ea5a4', tier: 'High', description: 'Practical, resource-oriented.' },
  ],
};

const D3_STRATEGIES: TaxonomyDimension = {
  id: 'd3',
  label: 'Strategy',
  categories: [
    { name: 'Question', color: '#5b8def' },
    { name: 'Reflective Listening', color: '#8b5cf6' },
    { name: 'Self-disclosure', color: '#0ea5a4' },
    { name: 'Affirmation', color: '#16a34a' },
    { name: 'Providing Suggestions', color: '#f59e0b' },
    { name: 'Information Sharing', color: '#e11d48' },
    { name: 'Reframing', color: '#64748b' },
    { name: 'Sympathy', color: '#ec4899' },
  ],
};

export const DEFAULT_TAXONOMY: Taxonomy = {
  dimensions: [D1_SUPPORT, D2_ROLES, D3_STRATEGIES],
};

// ── Helper ──────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Mock conversation generator ─────────────────────────────────

export function generateMockConversation(turnCount = 20, id = 'conv-1'): Conversation {
  const messages: Message[] = [];
  const roles = D2_ROLES.categories;
  const stances = ['Passive', 'Exploratory', 'Active'];

  for (let i = 0; i < turnCount; i++) {
    const isUser = i % 2 === 0;
    const role = pick(roles);
    const d1 = pick(D1_SUPPORT.categories);
    const d3 = pick(D3_STRATEGIES.categories);
    const tension = Math.round((0.2 + Math.random() * 0.6) * 100) / 100;
    const status = Math.round((0.3 + Math.random() * 0.5) * 100) / 100;

    messages.push({
      id: `${id}-msg-${i}`,
      speaker: isUser ? 'user' : 'assistant',
      content: isUser
        ? `User turn ${i + 1}: Exploring the theme of ${d1.name.toLowerCase()} support.`
        : `Assistant turn ${i + 1}: Responding with a ${role.name.toLowerCase()} approach using ${d3.name.toLowerCase()}.`,
      role: role.name,
      timestamp: new Date(Date.now() + i * 30000).toISOString(),
      metadata: {
        tension,
        status,
        d1: d1.name,
        d2: role.name,
        d3: d3.name,
        stance: pick(stances),
        roleColor: role.color,
        roleFamily: role.tier || 'Low',
        functionalSocial: Math.random(),
        emergentPrescribed: Math.random(),
      },
    });
  }

  return { id, title: `Sample Conversation ${id}`, messages, metadata: { source: 'mock' } };
}

/** Generate multiple conversations. */
export function generateMockDataset(count = 3, turnsPerConv = 20): Conversation[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockConversation(turnsPerConv, `conv-${i + 1}`)
  );
}

/** Generate heatmap data from two dimensions. */
export function generateMockHeatmap(
  rows: string[] = D2_ROLES.categories.map(c => c.name),
  cols: string[] = D3_STRATEGIES.categories.map(c => c.name)
): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (const row of rows) {
    for (const col of cols) {
      cells.push({ row, col, value: Math.floor(Math.random() * 20) });
    }
  }
  return cells;
}

/** Lookup a colour from a taxonomy dimension. */
export function colorFor(taxonomy: Taxonomy, dimensionId: string, value: string): string {
  const dim = taxonomy.dimensions.find(d => d.id === dimensionId);
  const cat = dim?.categories.find(c => c.name === value);
  return cat?.color || '#94a3b8';
}
