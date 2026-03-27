import { Message, Conversation, TaxonomyDimension, Taxonomy, HeatmapCell } from './types';

// ── Default taxonomy ────────────────────────────────────────────

const D1_SUPPORT: TaxonomyDimension = {
  id: 'd1',
  label: 'Label 01',
  categories: [
    { name: 'Type A', color: '#5b8def', description: 'Category A of dimension 1.' },
    { name: 'Type B', color: '#16a34a', description: 'Category B of dimension 1.' },
    { name: 'Type C', color: '#8b5cf6', description: 'Category C of dimension 1.' },
    { name: 'Type D', color: '#f59e0b', description: 'Category D of dimension 1.' },
    { name: 'Type E', color: '#0ea5a4', description: 'Category E of dimension 1.' },
    { name: 'Type F', color: '#e11d48', description: 'Category F of dimension 1.' },
  ],
};

const D2_ROLES: TaxonomyDimension = {
  id: 'd2',
  label: 'Label 02',
  categories: [
    { name: 'Role 01', color: '#5b8def', tier: 'Low', description: 'Role 01 description.' },
    { name: 'Role 02', color: '#8b5cf6', tier: 'Low', description: 'Role 02 description.' },
    { name: 'Role 03', color: '#f59e0b', tier: 'Moderate', description: 'Role 03 description.' },
    { name: 'Role 04', color: '#e11d48', tier: 'High', description: 'Role 04 description.' },
    { name: 'Role 05', color: '#64748b', tier: 'Low', description: 'Role 05 description.' },
    { name: 'Role 06', color: '#0ea5a4', tier: 'High', description: 'Role 06 description.' },
  ],
};

const D3_STRATEGIES: TaxonomyDimension = {
  id: 'd3',
  label: 'Label 03',
  categories: [
    { name: 'Strategy A', color: '#5b8def' },
    { name: 'Strategy B', color: '#8b5cf6' },
    { name: 'Strategy C', color: '#0ea5a4' },
    { name: 'Strategy D', color: '#16a34a' },
    { name: 'Strategy E', color: '#f59e0b' },
    { name: 'Strategy F', color: '#e11d48' },
    { name: 'Strategy G', color: '#64748b' },
    { name: 'Strategy H', color: '#ec4899' },
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
        ? `User turn ${i + 1}: Exploring theme ${d1.name}.`
        : `Assistant turn ${i + 1}: Responding as ${role.name} using ${d3.name}.`,
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
