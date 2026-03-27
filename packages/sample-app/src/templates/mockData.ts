// Mock Data for RTL v2.1 Template Expansion

export const MOCK_CORPUS_TURNS = [
  { d1: 'Type A', d2: 'Role 01', d3: 'Strategy A' },
  { d1: 'Type A', d2: 'Role 01', d3: 'Strategy D' },
  { d1: 'Type B', d2: 'Role 04', d3: 'Strategy E' },
  { d1: 'Type B', d2: 'Role 04', d3: 'Strategy F' },
  { d1: 'Type A', d2: 'Role 03', d3: 'Strategy B' },
  { d1: 'Type B', d2: 'Role 06', d3: 'Strategy G' },
  { d1: 'Type A', d2: 'Role 05', d3: 'Strategy C' },
  { d1: 'Type A', d2: 'Role 01', d3: 'Strategy A' },
  { d1: 'Type B', d2: 'Role 04', d3: 'Strategy E' },
  { d1: 'Type A', d2: 'Role 03', d3: 'Strategy B' },
  { d1: 'Type B', d2: 'Role 06', d3: 'Strategy G' },
  { d1: 'Type A', d2: 'Role 05', d3: 'Strategy C' },
  // Adding more for statistical significance in Mosaic/Parallel Sets
  ...Array(20).fill({ d1: 'Type A', d2: 'Role 01', d3: 'Strategy D' }),
  ...Array(15).fill({ d1: 'Type B', d2: 'Role 04', d3: 'Strategy E' }),
  ...Array(10).fill({ d1: 'Type B', d2: 'Role 06', d3: 'Strategy G' }),
  ...Array(8).fill({ d1: 'Type A', d2: 'Role 03', d3: 'Strategy A' }),
];

export const MOCK_SEQUENCE_TURNS = [
  { idx: 0, text: "Sample turn from participant A.", d1: 'Type A', d2: 'Seeker', d3: 'Strategy C' },
  { idx: 1, text: "Acknowledged. Following up on that.", d1: 'Type A', d2: 'Role 01', d3: 'Strategy D' },
  { idx: 2, text: "Can you elaborate on that point?", d1: 'Type A', d2: 'Role 01', d3: 'Strategy A' },
  { idx: 3, text: "Sure — it relates to the earlier topic.", d1: 'Type A', d2: 'Seeker', d3: 'Strategy C' },
  { idx: 4, text: "One option would be to restructure that.", d1: 'Type B', d2: 'Role 04', d3: 'Strategy E' },
  { idx: 5, text: "Let's start by prioritising the items.", d1: 'Type B', d2: 'Role 06', d3: 'Strategy G' },
  { idx: 6, text: "That approach works well, thanks.", d1: 'Type A', d2: 'Seeker', d3: 'Strategy B' },
  { idx: 7, text: "Great progress — let's keep going.", d1: 'Type A', d2: 'Role 03', d3: 'Strategy B' },
];

export const MOCK_SEQUENCE_ROLES = [
  { start: 0, end: 3, role: 'Role 01' },
  { start: 4, end: 5, role: 'Role 04' },
  { start: 6, end: 7, role: 'Role 03' }
];

export const MOCK_LIFECYCLE_EVENTS = [
  { idx: 5, type: 'trigger', label: 'Event Trigger A', constraintId: 'C1: Constraint 01' },
  { idx: 12, type: 'violation', label: 'Violation Event A', constraintId: 'C1: Constraint 01' },
  { idx: 15, type: 'repair', label: 'Repair Event A', constraintId: 'C1: Constraint 01' },
  { idx: 2, type: 'trigger', label: 'Event Trigger B', constraintId: 'C2: Constraint 02' },
  { idx: 25, type: 'ratify', label: 'Ratification B', constraintId: 'C2: Constraint 02' },
  { idx: 10, type: 'info', label: 'Info Event C', constraintId: 'C3: Constraint 03' },
  { idx: 18, type: 'violation', label: 'Violation Event C', constraintId: 'C3: Constraint 03' },
];

export const MOCK_PAD_DATA = Array.from({ length: 30 }, (_, i) => ({
  idx: i,
  p: Math.sin(i * 0.3) * 0.5 + Math.random() * 0.2,
  a: Math.cos(i * 0.2) * 0.4 + Math.random() * 0.3,
  d: (i / 30) * 0.8 - 0.4 + Math.random() * 0.1
}));

export const MOCK_PARADOX_STATS = {
  High: [2, 5, 8, 12, 10, 8, 5, 3, 2, 1],
  Moderate: [5, 10, 15, 20, 18, 15, 12, 8, 5, 3],
  Low: [20, 30, 40, 35, 30, 25, 20, 15, 10, 5]
};

export const MOCK_STABILITY_DATA = {
  'Class A': { n: 42 },
  'Class B': { n: 156 },
  'Class C': { n: 89 },
  'Class D': { n: 412 },
  'Class E': { n: 98 }
};

export const MOCK_VIOLATION_TIMING = {
  "1": 5, "2": 12, "3": 8, "4": 15, "5": 22, "6": 18, "7": 25, "8": 30, "9": 22, "10": 15,
  "11": 12, "12": 8, "13": 5, "14": 3, "15": 1
};

export const MOCK_ROLE_DISTRIBUTION = {
  human: {
    'Role 01': 0.45,
    'Role 02': 0.25,
    'Role 03': 0.15,
    'Role 04': 0.1,
    'Role 05': 0.05
  },
  ai: {
    'Role 04': 0.4,
    'Role 03': 0.3,
    'Role 06': 0.2,
    'Role 01': 0.1
  }
};

export const MOCK_CALIBRATION_ITEMS = [
  { id: 'seq_1', external_id: 'SEQ-001', turn_range: '1-12', stance: 'Passive', status: 'coded', coder_count: 3 },
  { id: 'seq_2', external_id: 'SEQ-002', turn_range: '4-8', stance: 'Exploratory', status: 'partially_coded', coder_count: 1 },
  { id: 'seq_3', external_id: 'SEQ-003', turn_range: '10-25', stance: null, status: 'pending' },
  { id: 'seq_4', external_id: 'SEQ-004', turn_range: '2-15', stance: 'Active', status: 'coded', coder_count: 2 },
  { id: 'seq_5', external_id: 'SEQ-005', turn_range: '5-20', stance: null, status: 'pending' }
];

export const MOCK_GRAPH_DATA = {
  nodes: [
    { id: 'conv_1', node_type: 'Conversation', label: 'Dataset 01' },
    { id: 'turn_1', node_type: 'Turn', turn_index: 1, speaker: 'user' },
    { id: 'turn_2', node_type: 'Turn', turn_index: 2, speaker: 'assistant' },
    { id: 'turn_3', node_type: 'Turn', turn_index: 3, speaker: 'user' },
    { id: 'move_1', node_type: 'Move', label: 'Move 01' },
    { id: 'c_1', node_type: 'Constraint', label: 'Constraint 01' },
    { id: 'v_1', node_type: 'ViolationEvent', label: 'Violation 01' }
  ],
  links: [
    { source: 'conv_1', target: 'turn_1', edge_type: 'CONTAINS' },
    { source: 'turn_1', target: 'turn_2', edge_type: 'NEXT' },
    { source: 'turn_2', target: 'turn_3', edge_type: 'NEXT' },
    { source: 'turn_2', target: 'move_1', edge_type: 'CONTAINS' },
    { source: 'move_1', target: 'c_1', edge_type: 'TRIGGERS' },
    { source: 'turn_3', target: 'c_1', edge_type: 'VIOLATES' }
  ]
};
