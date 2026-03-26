// Mock Data for RTL v2.1 Template Expansion

export const MOCK_CORPUS_TURNS = [
  { d1: 'Emotional', d2: 'Listener', d3: 'Question' },
  { d1: 'Emotional', d2: 'Listener', d3: 'Affirmation' },
  { d1: 'Informational', d2: 'Advisor', d3: 'Suggestion' },
  { d1: 'Informational', d2: 'Advisor', d3: 'Fact' },
  { d1: 'Emotional', d2: 'Coach', d3: 'Validation' },
  { d1: 'Informational', d2: 'Navigator', d3: 'Structure' },
  { d1: 'Emotional', d2: 'Companion', d3: 'Self-disclosure' },
  { d1: 'Emotional', d2: 'Listener', d3: 'Question' },
  { d1: 'Informational', d2: 'Advisor', d3: 'Suggestion' },
  { d1: 'Emotional', d2: 'Coach', d3: 'Validation' },
  { d1: 'Informational', d2: 'Navigator', d3: 'Structure' },
  { d1: 'Emotional', d2: 'Companion', d3: 'Self-disclosure' },
  // Adding more for statistical significance in Mosaic/Parallel Sets
  ...Array(20).fill({ d1: 'Emotional', d2: 'Listener', d3: 'Affirmation' }),
  ...Array(15).fill({ d1: 'Informational', d2: 'Advisor', d3: 'Suggestion' }),
  ...Array(10).fill({ d1: 'Informational', d2: 'Navigator', d3: 'Structure' }),
  ...Array(8).fill({ d1: 'Emotional', d2: 'Coach', d3: 'Question' }),
];

export const MOCK_SEQUENCE_TURNS = [
  { idx: 0, text: "I've been feeling really overwhelmed lately.", d1: 'Emotional', d2: 'Seeker', d3: 'Disclosure' },
  { idx: 1, text: "I hear you. That sounds really tough.", d1: 'Emotional', d2: 'Listener', d3: 'Affirmation' },
  { idx: 2, text: "Can you tell me more about what's causing that?", d1: 'Emotional', d2: 'Listener', d3: 'Question' },
  { idx: 3, text: "Mainly work, it just never stops.", d1: 'Emotional', d2: 'Seeker', d3: 'Disclosure' },
  { idx: 4, text: "Maybe we could look at your schedule together?", d1: 'Informational', d2: 'Advisor', d3: 'Suggestion' },
  { idx: 5, text: "Actually, let's start with your priority list.", d1: 'Informational', d2: 'Navigator', d3: 'Structure' },
  { idx: 6, text: "I think that would help, thank you.", d1: 'Emotional', d2: 'Seeker', d3: 'Validation' },
  { idx: 7, text: "You're doing great, we'll figure it out.", d1: 'Emotional', d2: 'Coach', d3: 'Validation' },
];

export const MOCK_SEQUENCE_ROLES = [
  { start: 0, end: 3, role: 'Listener' },
  { start: 4, end: 5, role: 'Advisor' },
  { start: 6, end: 7, role: 'Coach' }
];

export const MOCK_LIFECYCLE_EVENTS = [
  { idx: 5, type: 'trigger', label: 'Seeking Advice', constraintId: 'C1: Accountability' },
  { idx: 12, type: 'violation', label: 'Unsolicited Direction', constraintId: 'C1: Accountability' },
  { idx: 15, type: 'repair', label: 'Softening Statement', constraintId: 'C1: Accountability' },
  { idx: 2, type: 'trigger', label: 'Opening Greeting', constraintId: 'C2: Politeness' },
  { idx: 25, type: 'ratify', label: 'Mutual Closure', constraintId: 'C2: Politeness' },
  { idx: 10, type: 'info', label: 'Topic Shift', constraintId: 'C3: Topic Coherence' },
  { idx: 18, type: 'violation', label: 'Abrupt Interruption', constraintId: 'C3: Topic Coherence' },
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
  'Agency Collapse': { n: 42 },
  'Constraint Drift': { n: 156 },
  'No Constraints': { n: 89 },
  'Task Maintained': { n: 412 },
  'Task Shift': { n: 98 }
};

export const MOCK_VIOLATION_TIMING = {
  "1": 5, "2": 12, "3": 8, "4": 15, "5": 22, "6": 18, "7": 25, "8": 30, "9": 22, "10": 15,
  "11": 12, "12": 8, "13": 5, "14": 3, "15": 1
};

export const MOCK_ROLE_DISTRIBUTION = {
  human: {
    'Listener': 0.45,
    'Reflective Partner': 0.25,
    'Coach': 0.15,
    'Advisor': 0.1,
    'Companion': 0.05
  },
  ai: {
    'Advisor': 0.4,
    'Coach': 0.3,
    'Navigator': 0.2,
    'Listener': 0.1
  }
};

export const MOCK_CALIBRATION_ITEMS = [
  { id: 'seq_1', external_id: 'CONV-A72', turn_range: '1-12', stance: 'Passive', status: 'coded', coder_count: 3 },
  { id: 'seq_2', external_id: 'CONV-B15', turn_range: '4-8', stance: 'Exploratory', status: 'partially_coded', coder_count: 1 },
  { id: 'seq_3', external_id: 'CONV-C44', turn_range: '10-25', stance: null, status: 'pending' },
  { id: 'seq_4', external_id: 'CONV-D99', turn_range: '2-15', stance: 'Active', status: 'coded', coder_count: 2 },
  { id: 'seq_5', external_id: 'CONV-E01', turn_range: '5-20', stance: null, status: 'pending' }
];

export const MOCK_GRAPH_DATA = {
  nodes: [
    { id: 'conv_1', node_type: 'Conversation', label: 'Case Study A' },
    { id: 'turn_1', node_type: 'Turn', turn_index: 1, speaker: 'user' },
    { id: 'turn_2', node_type: 'Turn', turn_index: 2, speaker: 'assistant' },
    { id: 'turn_3', node_type: 'Turn', turn_index: 3, speaker: 'user' },
    { id: 'move_1', node_type: 'Move', label: 'Disclosure' },
    { id: 'c_1', node_type: 'Constraint', label: 'Empathy' },
    { id: 'v_1', node_type: 'ViolationEvent', label: 'Unsolicited Advice' }
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
