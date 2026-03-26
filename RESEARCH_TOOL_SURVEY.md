# Research Tool Survey — Components to Replicate

Surveyed existing research tools across qualitative analysis, corpus linguistics, network/bibliometric analysis, survey visualization, and open-source platforms. This document catalogs **components we should add** to `@research-tools`, cross-referenced against what we already have.

---

## What We Already Have

### `@research-tools/ui`
Badge, KPICard, BarDistribution, DataTable, CompactSelector, ControlPanel, ItemInspector, TranscriptViewer, CodingForm, ParticipationSummary, ProtocolDraftingWorkspace, SequenceBatchManager, GlassCard, PremiumButton

### `@research-tools/viz`
TopologyNetwork, CooccurrenceMatrix, SequenceTimeline, MultiTrackTimeline, DocumentPortrait, StateTransitionFlow, ParallelSets, MosaicPlot, EventLifecycle, AffectiveSparklines, ParadoxHeatmap, ParticipationGauge, TimingHistogram, ConsistencyDoughnut

### `@research-tools/core`
Types, countsBy, dominantValue, sortCounts, makeSegments, boundaryPairs, computeTransitionMatrix, calculateConversationMetrics, generateMockDataset, exportSvg/Png/Json, colorFor

---

## Priority 1 — High-Impact Components (Found in Nearly Every Research Tool)

### 1. Code Stripe Document `<CodeStripeDocument>`
**Inspired by:** NVivo, MAXQDA, ATLAS.ti, Taguette, QualCoder
**What it does:** Text viewer with **colored vertical bars in the margin** showing which codes/tags cover which text segments. Each code gets a distinct color stripe. Clicking a stripe highlights the coded passage.
**Why it matters:** This is the single most iconic QDA UI pattern. Every serious qualitative tool has it.
**Closest existing:** TranscriptViewer (shows messages but has no margin code stripes)
**Package:** `@research-tools/ui`

### 2. KWIC Concordance `<KWICConcordance>`
**Inspired by:** AntConc, Voyant Tools, CATMA, LancsBox
**What it does:** Keyword-in-context table: target word centered in a fixed-width column, left and right context extending outward. Sortable by L1/R1/L2/R2 positions. Click a row to jump to source.
**Why it matters:** Core of all corpus linguistics workflows. No text analysis tool exists without it.
**Package:** `@research-tools/ui`

### 3. Hierarchical Code Tree `<CodeTree>`
**Inspired by:** NVivo, MAXQDA, QualCoder, Taguette, ATLAS.ti
**What it does:** Collapsible tree of codes/tags with inline frequency counts, color swatches, and drag-and-drop reordering. Supports parent/child code hierarchies.
**Why it matters:** Every QDA tool uses a code tree for organizing the coding scheme.
**Closest existing:** CompactSelector (flat list, not hierarchical)
**Package:** `@research-tools/ui`

### 4. Word Cloud `<WordCloud>`
**Inspired by:** Voyant Cirrus, NVivo, ATLAS.ti, NodeXL
**What it does:** Interactive word cloud with size mapped to frequency. Click a word to filter/highlight in linked views. Configurable stop-word list.
**Why it matters:** Universal entry point for text exploration. Researchers expect it.
**Package:** `@research-tools/viz`

### 5. Force-Directed Network Graph `<ForceGraph>`
**Inspired by:** Gephi, Cytoscape, VOSviewer, Sigma.js
**What it does:** Interactive force-directed graph with zoom/pan, node drag, hover tooltips, click-to-select. Node size/color mapped to metrics (centrality, community). Edge thickness mapped to weight. Semantic zoom (labels appear on zoom-in).
**Why it matters:** Foundation for social network, co-citation, co-occurrence, and concept mapping.
**Closest existing:** TopologyNetwork (may overlap — evaluate scope)
**Package:** `@research-tools/viz`

### 6. Correlation Matrix `<CorrelationMatrix>`
**Inspired by:** SPSS, JASP, jamovi, Stata
**What it does:** Lower-triangle heatmap with coefficient values in cells, significance stars, diverging color scale. Click a cell to show the underlying scatterplot.
**Why it matters:** Standard quantitative research output. Used in every empirical study.
**Package:** `@research-tools/viz`

---

## Priority 2 — Distinctive High-Value Components

### 7. Concordance Plot `<ConcordancePlot>`
**Inspired by:** AntConc, Voyant MicroSearch
**What it does:** Horizontal barcode-style chart — one row per document, marks at positions where a search term appears. Gives a visual fingerprint of term distribution across the corpus.
**Package:** `@research-tools/viz`

### 8. Frequency Trends `<FrequencyTrends>`
**Inspired by:** Voyant Trends
**What it does:** Multi-series line chart showing term frequencies across document segments. X = segment position, Y = relative frequency. Multiple terms overlaid with legend.
**Package:** `@research-tools/viz`

### 9. Stream Graph `<StreamGraph>`
**Inspired by:** Voyant, topic modeling tools
**What it does:** Stacked area chart (stream layout) showing how topic/term/code frequencies evolve over a sequence. Good for showing thematic shifts in a corpus.
**Package:** `@research-tools/viz`

### 10. Sankey / Alluvial Diagram `<SankeyDiagram>`
**Inspired by:** ATLAS.ti, Bibliometrix three-fields plot, CiteSpace thematic evolution
**What it does:** Flow diagram with columns of categories and ribbons showing transitions/relationships between them. Supports 2-4 columns.
**Closest existing:** StateTransitionFlow (circular layout — Sankey is linear column layout)
**Package:** `@research-tools/viz`

### 11. Likert Chart `<LikertChart>`
**Inspired by:** Survey analysis tools (SPSS, Qualtrics, jamovi)
**What it does:** Diverging stacked horizontal bar chart centered at the neutral point. Positive responses extend right, negative extend left. Standard for Likert-scale survey data.
**Package:** `@research-tools/viz`

### 12. Forest Plot `<ForestPlot>`
**Inspired by:** Meta-analysis tools, Cochrane Review Manager
**What it does:** Effect sizes with confidence intervals displayed as horizontal lines with center marks, ordered vertically. Diamond for pooled effect. Vertical line at null effect.
**Package:** `@research-tools/viz`

### 13. Bubble Matrix `<BubbleMatrix>`
**Inspired by:** MAXQDA Code Matrix Browser
**What it does:** Grid with proportionally sized circles (not just colored cells). Rows = documents/cases, columns = codes/categories. Circle size = frequency. More expressive than a plain heatmap.
**Closest existing:** CooccurrenceMatrix (uses cells, not bubbles)
**Package:** `@research-tools/viz`

### 14. Cluster Dendrogram `<ClusterDendrogram>`
**Inspired by:** NVivo, QDA Miner, hierarchical clustering in R/Python
**What it does:** Hierarchical clustering tree. Horizontal or vertical layout. Color-coded branches for cut-level clusters. Hover to see merge distance.
**Package:** `@research-tools/viz`

### 15. Semantic Network Editor `<ConceptMap>`
**Inspired by:** ATLAS.ti Network View, NVivo Project Maps, MAXQDA MAXMaps
**What it does:** Interactive canvas where researchers place nodes (codes, themes, memos) and draw labeled, directional edges between them ("is cause of", "contradicts", "is part of"). For theory-building and grounded theory.
**Package:** `@research-tools/viz`

---

## Priority 3 — Specialized / Domain-Specific Components

### 16. Thematic Map `<ThematicMap>`
**Inspired by:** Bibliometrix/biblioshiny
**What it does:** 2D quadrant scatter — X = centrality (relevance), Y = density (development). Bubbles = keyword clusters, size = cluster size. Quadrants labeled: Motor Themes, Basic Themes, Niche Themes, Emerging/Declining.

### 17. Timeline Network `<TimelineNetwork>`
**Inspired by:** CiteSpace
**What it does:** Nodes positioned by time on X-axis, clustered vertically. Edges cross time periods. Time-slice slider for animation.

### 18. Burst Detection Chart `<BurstDetectionChart>`
**Inspired by:** CiteSpace
**What it does:** Horizontal bars with highlighted active periods (Gantt-like). Shows when terms/citations experience bursts of activity.

### 19. Raincloud Plot `<RaincloudPlot>`
**Inspired by:** Modern statistical visualization (R ggdist, Python)
**What it does:** Combination of half-violin + boxplot + jittered strip plot. Shows full distribution shape, summary statistics, and individual data points.

### 20. Parallel Coordinates `<ParallelCoordinates>`
**Inspired by:** Multivariate data exploration tools
**What it does:** Vertical axes for each variable, polylines for each observation. Brushable axes for filtering.
**Closest existing:** ParallelSets (categorical — parallel coordinates is continuous)

### 21. Choropleth + Arc Map `<GeoCollaborationMap>`
**Inspired by:** CiteSpace, Bibliometrix, VOSviewer
**What it does:** World map with fill color = publication count and arc overlays = collaborations between regions.

### 22. Historiograph `<Historiograph>`
**Inspired by:** Bibliometrix
**What it does:** Horizontal directed graph of key papers arranged left-to-right by year. Citation edges flow forward in time.

### 23. Path Diagram `<PathDiagram>`
**Inspired by:** SEM tools (lavaan, AMOS, Mplus)
**What it does:** Directed acyclic graph with standardized coefficients on edges. Ovals = latent variables, rectangles = observed variables.

### 24. Dual Map Overlay `<DualMapOverlay>`
**Inspired by:** CiteSpace
**What it does:** Two scatter plots side by side (citing journals left, cited journals right) with colored flow curves between them showing citation flows between disciplines.

---

## Infrastructure Components to Add

| Component | Description | Priority |
|-----------|-------------|----------|
| `<LinkedDashboard>` | Shared selection/filter state container (like Vega-Lite selections or R crosstalk). Child components subscribe to selection context. | **High** |
| `<ZoomPanCanvas>` | SVG/Canvas wrapper with mouse wheel zoom, drag pan, fit-to-screen, minimap | High |
| `<SearchBar>` | Regex-capable search with autocomplete, highlights matches in linked views | Medium |
| `<ThresholdSlider>` | Numeric range slider that dynamically filters data in all linked views | Medium |
| `<TilingLayout>` | react-grid-layout style draggable/resizable panel layout (like Voyant) | Medium |
| `<ColorScaleLegend>` | Interactive continuous/categorical legend with click-to-toggle categories | Medium |
| `<AnnotationLayer>` | User-drawn text labels, arrows, rectangles overlaid on any viz for presentation | Low |
| `<MiniMap>` | Small overview inset showing full extent with viewport rectangle | Low |

---

## Analysis Utilities to Add (`@research-tools/core`)

| Function | Description | Inspired By |
|----------|-------------|-------------|
| `kwicSearch(corpus, term, windowSize)` | Extract keyword-in-context concordance lines | AntConc, Voyant |
| `collocates(corpus, term, span, measure)` | Find collocates with MI, T-score, log-likelihood | AntConc, LancsBox |
| `keyness(targetCorpus, refCorpus)` | Compare term frequencies between corpora (log-likelihood, chi-square) | AntConc |
| `tfidf(corpus)` | Term frequency–inverse document frequency | Standard NLP |
| `cosineSimilarity(vecA, vecB)` | Vector similarity for document comparison | Standard NLP |
| `hierarchicalCluster(distanceMatrix)` | Agglomerative clustering returning dendrogram structure | NVivo, QDA Miner |
| `correlationMatrix(variables)` | Pearson/Spearman correlation with p-values | SPSS, jamovi |
| `likertSummary(responses, scale)` | Summarize Likert data into diverging format | Survey tools |
| `burstDetection(timeSeries)` | Kleinberg burst detection algorithm | CiteSpace |
| `modularityCommunities(graph)` | Community detection in networks | Gephi |

---

## Recommended Build Order

**Phase 1 — Text Analysis Foundation**
1. `KWICConcordance` + `kwicSearch()` utility
2. `CodeStripeDocument`
3. `CodeTree`
4. `WordCloud`
5. `ConcordancePlot`
6. `FrequencyTrends`
7. `LinkedDashboard` (shared selection context)

**Phase 2 — Network & Quantitative**
8. `ForceGraph` (or extend TopologyNetwork)
9. `CorrelationMatrix`
10. `SankeyDiagram`
11. `LikertChart`
12. `ForestPlot`
13. `ClusterDendrogram`

**Phase 3 — Advanced / Specialized**
14. `StreamGraph`
15. `ConceptMap`
16. `BubbleMatrix`
17. `ThematicMap`
18. `RaincloudPlot`
19. `TimelineNetwork`
20. `BurstDetectionChart`

---

## Key Open-Source Libraries to Leverage

| Library | Use For | GitHub |
|---------|---------|--------|
| **visx** (Airbnb) | Low-level D3+React primitives (scales, axes, shapes, zoom, brush) | airbnb/visx |
| **Sigma.js** | WebGL graph rendering for large networks | jacomyal/sigma.js |
| **Cytoscape.js** | Full graph library with layouts and analysis | cytoscape/cytoscape.js |
| **react-grid-layout** | Draggable/resizable panel tiling | react-grid-layout/react-grid-layout |
| **recogito-js** | Text annotation with W3C Web Annotation model | recogito/recogito-js |
| **annotorious** | Image region annotation | recogito/annotorious |
| **d3-cloud** | Word cloud layout algorithm | jasondavies/d3-cloud |
| **d3-sankey** | Sankey diagram layout | d3/d3-sankey |

---

## Source Tools Referenced

| Tool | Domain | Type | Notable Features |
|------|--------|------|-----------------|
| **NVivo** | Qualitative analysis | Commercial | Code stripes, treemap, cluster dendrogram, concept maps |
| **ATLAS.ti** | Qualitative analysis | Commercial | Semantic network editor, co-occurrence matrix, Sankey |
| **MAXQDA** | Qualitative/mixed-methods | Commercial | Document portrait, codeline, bubble matrix, word tree |
| **Dedoose** | Mixed-methods | Commercial (web) | Packed bubble chart, descriptor crosstab, inter-rater reliability |
| **Voyant Tools** | Text analysis | Open-source (web) | Cirrus, trends, KWIC, bubblelines, stream graph, linked panels |
| **AntConc** | Corpus linguistics | Free | KWIC, concordance plot, collocate table, keyword list |
| **LancsBox** | Corpus linguistics | Free | GraphColl, collocation network, POS-colored KWIC |
| **CATMA** | Digital humanities | Open-source | KWIC, tag distribution, inter-annotator diff |
| **Taguette** | Qualitative coding | Open-source | Inline highlights, tag sidebar, excerpt aggregation |
| **QualCoder** | Qualitative coding | Open-source | Code tree, margin coding, co-occurrence heatmap |
| **Gephi** | Network analysis | Open-source | Force-directed layouts, modularity, timeline filter |
| **VOSviewer** | Bibliometrics | Free | Density overlay, semantic zoom, co-citation maps |
| **CiteSpace** | Scientometrics | Free | Timeline network, burst detection, dual-map overlay |
| **Bibliometrix** | Bibliometrics | Open-source (R) | Thematic map, three-fields Sankey, historiograph |
| **ELAN** | Conversation analysis | Free | Multi-tier annotation timeline, waveform display |
| **Transana** | Media analysis | Commercial | Synced transcript+media, keyword timeline |
| **Quirkos** | Qualitative coding | Commercial | Drag-target bubbles, overlap view |
