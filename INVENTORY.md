# Research Tools — Component & Interface Inventory

## Source Projects Analysed

| # | Project | Stack | Domain |
|---|---------|-------|--------|
| 1 | **Annotation Desk** (AROMA Phase 3) | React 19, Vite 8, Supabase, Tailwind 4, Framer Motion | Human coding / annotation workflow |
| 2 | **Role Dynamics Visualization** | React 18, Vite, Lucide, SVG | Radial conversation portrait |
| 3 | **AROMA Research UI** | Vanilla HTML/JS, D3 | Corpus exploration & findings review |
| 4 | **Atlas Suite** (Cartography v2) | Vanilla HTML/JS, D3, Chart.js | Interactional graph exploration & ISP dashboard |

---

## Generalised Tool Catalogue

### A. Core Utilities (`@research-tools/core`)

| Tool | Source(s) | Description |
|------|-----------|-------------|
| **Types** | All | Unified interfaces: `DataItem`, `Dataset`, `Annotation`, `Taxonomy`, `Metric`, `Segment` |
| **countsBy** | AROMA UI | Count occurrences of a key across items |
| **dominantValue** | AROMA UI | Find the most-frequent value for a key |
| **sortCounts** | AROMA UI | Sort `{label, count}` pairs descending |
| **makeSegments** | AROMA UI | Segment a sequence by a categorical key (run-length encoding) |
| **boundaryPairs** | AROMA UI | Extract transition labels between consecutive segments |
| **computeTransitionMatrix** | AROMA UI | NxN transition counts between categories |
| **computeDistribution** | AROMA UI + Atlas | Aggregate a dataset into labelled distributions |
| **calculateMetrics** | Existing core | Turn count, speaker breakdown, avg length, etc. |
| **generateMockDataset** | Role Dynamics, existing | Produce a synthetic conversation with roles, tension, categories |
| **exportSvg / exportPng** | AROMA UI | Serialise an SVG element to file download |

### B. UI Components (`@research-tools/ui`)

#### Layout

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **AppShell** | All 4 | Top bar + sidebar + workspace — the shared research app skeleton |
| **SplitPane** | Annotation Desk | Two-panel layout (transcript left, form right) |
| **TabBar** | Annotation Desk | Horizontal tab navigation with icons |

#### Base

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **GlassCard** | Existing UI | Frosted-glass card with framer-motion entrance |
| **PremiumButton** | Existing UI | Gradient CTA with hover/tap animation |
| **Badge** | AROMA UI, Atlas | Coloured inline label `{text, color}` |
| **Pill** | AROMA UI | Bordered chip with optional secondary text |
| **KPICard** | Atlas Dashboard, AROMA Findings, Annotation Desk | Large number + label + optional detail |

#### Data Display

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **TranscriptViewer** | Existing UI, Annotation Desk | Scrollable chat transcript with speaker colouring, click-to-select |
| **DataTable** | Annotation Desk (CalibrationDashboard), Atlas Dashboard | Sortable table with badges, search, action column |
| **BarDistribution** | AROMA UI (all 3 pages), Atlas Dashboard | Horizontal bar chart for `{label, count}` data |
| **KPIGrid** | Atlas Dashboard, Turning Point, AROMA Findings | Grid of KPICards |
| **ItemInspector** | Atlas Explorer, Role Dynamics (MessageDetails) | Detailed property card for a selected item |

#### Forms & Controls

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **CodingForm** | Existing UI, Annotation Desk (SeekerFirstForm) | Dynamic form with field schema → text, select, boolean, multi-tag, slider |
| **CompactSelector** | Annotation Desk | Single-select button group with tooltip definitions |
| **TagSelector** | Annotation Desk | Multi-select pill chips |
| **ConfidenceSlider** | Annotation Desk | Labelled range input (Low / Med / High) |
| **SearchBox** | Annotation Desk, AROMA Sequence Explorer | Text input with icon and optional filter toggles |
| **ControlPanel** | Role Dynamics, Atlas Explorer | View-mode toggles + metric selectors + action buttons |
| **FileUpload** | AROMA UI, Atlas Suite | Drop zone / file input with reset button |

### C. Visualisation Components (`@research-tools/viz`)

#### Radial / Circular

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **TopologyNetwork** | Existing viz, Role Dynamics | Circular plot: angle=time, distance=metric, color=category |
| **ConcentricRings** | Role Dynamics | SVG background rings with labels |
| **ConnectionLines** | Role Dynamics | Lines between consecutive nodes |
| **StateTransitionFlow** | AROMA Findings | Circular node-link diagram showing NxN transition counts |

#### Matrix / Grid

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **CooccurrenceMatrix** | Existing viz (D2xD3) | Row x Col heatmap with D3 colour scale |
| **PositionHeatmap** | AROMA Findings | Tier x Position grid showing intensity per bin |
| **MosaicPlot** | AROMA Findings | Area-proportional tiles with residual colouring |

#### Sequence

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **SequenceTimeline** | AROMA Sequence Explorer | Segmented horizontal bar showing category runs over time |
| **MultiTrackTimeline** | AROMA Sequence Explorer | Parallel tracks (D1/D2/D3 etc.) per unit, clickable |

#### Corpus Overview

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **DocumentPortrait** | AROMA Corpus Map | Quilt view: each row = one document, segments = units coloured by dimension |

#### Graph

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **ForceGraph** | Atlas Explorer / Compare | D3 force-directed graph with typed nodes, zoom, drag, filters |

#### Multi-dimensional

| Component | Source(s) | Description |
|-----------|-----------|-------------|
| **ParallelSets** | AROMA Findings | D3 ribbon diagram tracing category combinations across 3+ axes |

---

## Shared UI Patterns

| Pattern | Where it appears | Generalised as |
|---------|-----------------|----------------|
| Transcript + sidebar coding | Annotation Desk, Sequence Explorer | `SplitPane` + `TranscriptViewer` + `CodingForm` |
| Three-column research layout | Sequence Explorer, Corpus Map, Atlas Explorer | `AppShell` with left sidebar, workspace, right inspector |
| KPI row → distribution bars → detail table | Atlas Dashboard, AROMA Findings, Turning Point | `KPIGrid` → `BarDistribution` → `DataTable` |
| Role/category colour coding | All 4 projects | `Taxonomy` type + `colorFor()` + `Badge` / `Pill` |
| Upload data → render → export | AROMA UI, Atlas Suite | `FileUpload` + `exportSvg/Png` |
| Click-to-inspect node detail | Role Dynamics, Atlas Suite | `ItemInspector` |
| Filter toggles (type checkboxes / pill buttons) | Atlas Explorer, AROMA Corpus Map, Sequence Explorer | `ControlPanel` with toggle groups |
| Side-by-side comparison | Atlas Compare | Two `ForceGraph` instances in split view |

---

## Monorepo Package Map

```
@research-tools/
├── core/           — Types, analysis utilities, data generators, export helpers
├── ui/             — React components: layout, base, forms, data display
├── viz/            — React + D3 visualisation components
└── sample-app/     — Demo app wiring everything together with dummy data
```

## Dummy Data Strategy

All components use a shared mock dataset generated by `@research-tools/core`:
- 3 conversations, ~20 turns each
- 3 speakers (user, assistant, system)
- Taxonomy with 3 dimensions (D1: 6 categories, D2: 6 categories, D3: 8 strategies)
- Numeric metrics: tension (0-1), status (0-1), confidence (1-3)
- Annotations attached to sequences
