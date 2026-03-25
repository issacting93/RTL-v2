// ── Foundational types ──────────────────────────────────────────

export interface DataItem {
  id: string;
  [key: string]: any;
}

export interface Message {
  id: string;
  speaker: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  role?: string;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  metadata?: Record<string, any>;
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
  value: any;
  annotator: string;
  timestamp: string;
  confidence?: number;
  notes?: string;
}

// ── Segments & Sequences ────────────────────────────────────────

export interface Segment {
  value: string;
  start: number;
  end: number;
  items: DataItem[];
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

export interface Dataset<T extends DataItem = DataItem> {
  id: string;
  title?: string;
  items: T[];
  metadata?: Record<string, any>;
}
