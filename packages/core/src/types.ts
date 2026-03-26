// ── Foundational types ──────────────────────────────────────────

export interface DataItem {
  id: string;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  speaker: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  role?: string;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  metadata?: Record<string, unknown>;
}

// ── Taxonomy (generalised category system) ──────────────────────

export interface TaxonomyCategory {
  name: string;
  color: string;
  description?: string;
  tier?: string;
}

export interface TaxonomyDimension {
  id: string;
  label: string;
  categories: TaxonomyCategory[];
}

export interface Taxonomy {
  dimensions: TaxonomyDimension[];
}

// ── Coding / Annotation ─────────────────────────────────────────

export interface AnnotationField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'boolean' | 'multi-select' | 'slider';
  options?: string[];
  min?: number;
  max?: number;
  labels?: string[];
}

export interface Annotation {
  id: string;
  targetId: string;
  type: string;
  value: unknown;
  annotator: string;
  timestamp: string;
  confidence?: number;
  notes?: string;
}

// ── Segments & Sequences ────────────────────────────────────────

export interface Segment<T = Record<string, unknown>> {
  value: string;
  start: number;
  end: number;
  items: T[];
}

// ── Metrics & Distribution ──────────────────────────────────────

export interface CountEntry {
  label: string;
  count: number;
}

export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
}

export interface TransitionMatrix {
  labels: string[];
  matrix: number[][];
}

// ── Dataset wrapper ─────────────────────────────────────────────

export interface Dataset<T = Record<string, unknown>> {
  id: string;
  title?: string;
  items: T[];
  metadata?: Record<string, unknown>;
}

// ── Graph Data (Atlas / Cartography) ─────────────────────────────

export interface GraphNode extends DataItem {
  node_type: string;
  id: string;
}

export interface GraphLink {
  source: string | any;
  target: string | any;
  edge_type: string;
  metadata?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
