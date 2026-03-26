export interface LikertRow {
  question: string;
  negative: number;
  neutral: number;
  positive: number;
}

export interface DendrogramNode {
  id: string;
  label?: string;
  children?: DendrogramNode[];
  height: number;
}

export interface BurstInterval {
  start: number;
  end: number;
  level: number;
}

/** Pearson correlation coefficient between two arrays. */
export function pearsonR(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }

  const n = x.length;
  if (n === 0) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/** Compute Pearson correlation matrix. Returns { labels, matrix } where matrix[i][j] is the correlation between variables[i] and variables[j]. */
export function correlationMatrix(
  variables: Array<{ label: string; values: number[] }>
): { labels: string[]; matrix: number[][] } {
  const labels = variables.map((v) => v.label);
  const n = variables.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const r = pearsonR(variables[i].values, variables[j].values);
      matrix[i][j] = r;
      matrix[j][i] = r;
    }
  }

  return { labels, matrix };
}

/** Summarize Likert responses into diverging format for visualization. Returns { label, negative, neutral, positive } per question. */
export function likertSummary(
  responses: Array<{ question: string; value: number }>,
  scale: { min: number; max: number; neutral: number } = { min: 1, max: 5, neutral: 3 }
): LikertRow[] {
  const grouped = new Map<string, number[]>();

  for (const r of responses) {
    if (!grouped.has(r.question)) {
      grouped.set(r.question, []);
    }
    grouped.get(r.question)!.push(r.value);
  }

  const results: LikertRow[] = [];

  for (const [question, values] of grouped) {
    const total = values.length;
    if (total === 0) continue;

    let negative = 0;
    let neutral = 0;
    let positive = 0;

    for (const v of values) {
      if (v < scale.neutral) negative++;
      else if (v === scale.neutral) neutral++;
      else positive++;
    }

    results.push({
      question,
      negative: negative / total,
      neutral: neutral / total,
      positive: positive / total,
    });
  }

  return results;
}

/** Hierarchical agglomerative clustering. Returns a dendrogram tree structure. Uses single/complete/average linkage. */
export function hierarchicalCluster(
  distMatrix: number[][],
  labels: string[],
  linkage: 'single' | 'complete' | 'average' = 'average'
): DendrogramNode {
  const n = labels.length;
  if (n === 0) {
    return { id: 'root', height: 0 };
  }
  if (n === 1) {
    return { id: '0', label: labels[0], height: 0 };
  }

  // Copy distance matrix
  const dist: number[][] = distMatrix.map((row) => [...row]);

  // Track active clusters
  type Cluster = { node: DendrogramNode; size: number };
  const clusters: Map<number, Cluster> = new Map();

  for (let i = 0; i < n; i++) {
    clusters.set(i, {
      node: { id: String(i), label: labels[i], height: 0 },
      size: 1,
    });
  }

  let nextId = n;

  while (clusters.size > 1) {
    // Find closest pair
    let minDist = Infinity;
    let mergeA = -1;
    let mergeB = -1;

    const keys = [...clusters.keys()];
    for (let ii = 0; ii < keys.length; ii++) {
      for (let jj = ii + 1; jj < keys.length; jj++) {
        const i = keys[ii];
        const j = keys[jj];
        const d = dist[i][j];
        if (d < minDist) {
          minDist = d;
          mergeA = i;
          mergeB = j;
        }
      }
    }

    const clusterA = clusters.get(mergeA)!;
    const clusterB = clusters.get(mergeB)!;

    const newNode: DendrogramNode = {
      id: String(nextId),
      children: [clusterA.node, clusterB.node],
      height: minDist,
    };

    const newSize = clusterA.size + clusterB.size;

    // Update distances
    // Ensure dist matrix is large enough
    while (dist.length <= nextId) {
      dist.push(Array(dist.length).fill(Infinity));
    }
    for (let row = 0; row < dist.length; row++) {
      while (dist[row].length <= nextId) {
        dist[row].push(Infinity);
      }
    }

    for (const k of keys) {
      if (k === mergeA || k === mergeB) continue;

      let d: number;
      if (linkage === 'single') {
        d = Math.min(dist[mergeA][k], dist[mergeB][k]);
      } else if (linkage === 'complete') {
        d = Math.max(dist[mergeA][k], dist[mergeB][k]);
      } else {
        // average (weighted by cluster size)
        d =
          (dist[mergeA][k] * clusterA.size + dist[mergeB][k] * clusterB.size) /
          newSize;
      }

      dist[nextId][k] = d;
      dist[k][nextId] = d;
    }

    dist[nextId][nextId] = 0;

    clusters.delete(mergeA);
    clusters.delete(mergeB);
    clusters.set(nextId, { node: newNode, size: newSize });

    nextId++;
  }

  return clusters.values().next().value!.node;
}

/** Compute a distance matrix from a set of numeric vectors using Euclidean distance. */
export function distanceMatrix(vectors: number[][]): number[][] {
  const n = vectors.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < vectors[i].length; k++) {
        const diff = vectors[i][k] - (vectors[j][k] ?? 0);
        sum += diff * diff;
      }
      const d = Math.sqrt(sum);
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }

  return matrix;
}

/** Kleinberg burst detection (simplified). Returns array of burst intervals. */
export function burstDetection(
  timeSeries: number[],
  gamma: number = 1.0
): BurstInterval[] {
  const n = timeSeries.length;
  if (n === 0) return [];

  // Compute overall mean as baseline rate
  let totalSum = 0;
  for (const v of timeSeries) totalSum += v;
  const mean = totalSum / n;

  if (mean === 0) return [];

  // Two-state automaton: state 0 = baseline, state 1 = elevated
  // Threshold for burst state: values above mean + 1 stddev
  let variance = 0;
  for (const v of timeSeries) variance += (v - mean) * (v - mean);
  variance /= n;
  const stddev = Math.sqrt(variance);

  const threshold = mean + stddev * gamma;

  // Assign states using a cost-minimization approach
  const states: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (timeSeries[i] > threshold) {
      states[i] = 1;
    }
  }

  // Apply transition cost: use Viterbi-like smoothing
  // Cost of transitioning up is gamma * ln(n), encouraging persistence
  const transitionCost = gamma * Math.log(n + 1);

  // Forward pass with dynamic programming for 2 states
  const cost: number[][] = Array.from({ length: n }, () => [0, 0]);
  // State 0 cost: penalty for high values, state 1 cost: penalty for low values
  for (let i = 0; i < n; i++) {
    const ratio = timeSeries[i] / mean;
    cost[i][0] = ratio > 1 ? (ratio - 1) : 0;
    cost[i][1] = ratio <= 1 ? (1 - ratio) : 0;
  }

  const dp: number[][] = Array.from({ length: n }, () => [0, 0]);
  const backtrack: number[][] = Array.from({ length: n }, () => [0, 0]);

  dp[0][0] = cost[0][0];
  dp[0][1] = cost[0][1] + transitionCost;

  for (let i = 1; i < n; i++) {
    // To state 0
    const toState0From0 = dp[i - 1][0];
    const toState0From1 = dp[i - 1][1];
    if (toState0From0 <= toState0From1) {
      dp[i][0] = toState0From0 + cost[i][0];
      backtrack[i][0] = 0;
    } else {
      dp[i][0] = toState0From1 + cost[i][0];
      backtrack[i][0] = 1;
    }

    // To state 1
    const toState1From0 = dp[i - 1][0] + transitionCost;
    const toState1From1 = dp[i - 1][1];
    if (toState1From1 <= toState1From0) {
      dp[i][1] = toState1From1 + cost[i][1];
      backtrack[i][1] = 1;
    } else {
      dp[i][1] = toState1From0 + cost[i][1];
      backtrack[i][1] = 0;
    }
  }

  // Backtrack to find optimal state sequence
  const optimalStates: number[] = new Array(n);
  optimalStates[n - 1] = dp[n - 1][0] <= dp[n - 1][1] ? 0 : 1;

  for (let i = n - 2; i >= 0; i--) {
    optimalStates[i] = backtrack[i + 1][optimalStates[i + 1]];
  }

  // Extract burst intervals (contiguous runs of state 1)
  const bursts: BurstInterval[] = [];
  let i = 0;

  while (i < n) {
    if (optimalStates[i] === 1) {
      const start = i;
      while (i < n && optimalStates[i] === 1) i++;
      bursts.push({ start, end: i - 1, level: 1 });
    } else {
      i++;
    }
  }

  return bursts;
}
