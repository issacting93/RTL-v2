export interface KWICLine {
  left: string;
  keyword: string;
  right: string;
  docId: string;
  position: number;
}

export interface Collocate {
  word: string;
  count: number;
  score: number;
}

export interface KeynessEntry {
  term: string;
  targetFreq: number;
  refFreq: number;
  keyness: number;
}

/** Tokenize text into words (lowercase, remove punctuation). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/** Build a term frequency map from text. */
export function termFrequency(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}

/** Extract keyword-in-context concordance lines. Returns array of { left, keyword, right, docId, position }. */
export function kwicSearch(
  documents: Array<{ id: string; text: string }>,
  term: string,
  windowSize: number = 40
): KWICLine[] {
  const results: KWICLine[] = [];
  const termLower = term.toLowerCase();

  for (const doc of documents) {
    const textLower = doc.text.toLowerCase();
    let searchFrom = 0;

    while (true) {
      const idx = textLower.indexOf(termLower, searchFrom);
      if (idx === -1) break;

      const leftStart = Math.max(0, idx - windowSize);
      const rightEnd = Math.min(doc.text.length, idx + term.length + windowSize);

      results.push({
        left: doc.text.slice(leftStart, idx),
        keyword: doc.text.slice(idx, idx + term.length),
        right: doc.text.slice(idx + term.length, rightEnd),
        docId: doc.id,
        position: idx,
      });

      searchFrom = idx + 1;
    }
  }

  return results;
}

/** Find collocates of a term within a span window. Returns array of { word, count, score } sorted by score. Uses Mutual Information. */
export function collocates(
  documents: Array<{ id: string; text: string }>,
  term: string,
  span: number = 5
): Collocate[] {
  const termLower = term.toLowerCase();
  const collocateCounts = new Map<string, number>();
  let totalWindows = 0;
  const globalFreq = new Map<string, number>();
  let totalTokens = 0;
  let termCount = 0;

  for (const doc of documents) {
    const tokens = tokenize(doc.text);
    totalTokens += tokens.length;

    for (let i = 0; i < tokens.length; i++) {
      globalFreq.set(tokens[i], (globalFreq.get(tokens[i]) ?? 0) + 1);
    }

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === termLower) {
        termCount++;
        const windowStart = Math.max(0, i - span);
        const windowEnd = Math.min(tokens.length - 1, i + span);

        for (let j = windowStart; j <= windowEnd; j++) {
          if (j === i) continue;
          const collocate = tokens[j];
          collocateCounts.set(collocate, (collocateCounts.get(collocate) ?? 0) + 1);
          totalWindows++;
        }
      }
    }
  }

  if (termCount === 0 || totalTokens === 0) return [];

  const results: Collocate[] = [];

  for (const [word, count] of collocateCounts) {
    const pXY = count / totalTokens;
    const pX = termCount / totalTokens;
    const pY = (globalFreq.get(word) ?? 0) / totalTokens;

    if (pX === 0 || pY === 0 || pXY === 0) continue;

    const mi = Math.log2(pXY / (pX * pY));

    results.push({ word, count, score: mi });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/** Compare term frequencies between target and reference corpus. Returns array of { term, targetFreq, refFreq, keyness } using log-likelihood. Sorted by keyness descending. */
export function keyness(
  targetDocs: Array<{ id: string; text: string }>,
  referenceDocs: Array<{ id: string; text: string }>,
  topN: number = 50
): KeynessEntry[] {
  const targetFreq = new Map<string, number>();
  const refFreq = new Map<string, number>();
  let targetTotal = 0;
  let refTotal = 0;

  for (const doc of targetDocs) {
    const tokens = tokenize(doc.text);
    targetTotal += tokens.length;
    for (const t of tokens) {
      targetFreq.set(t, (targetFreq.get(t) ?? 0) + 1);
    }
  }

  for (const doc of referenceDocs) {
    const tokens = tokenize(doc.text);
    refTotal += tokens.length;
    for (const t of tokens) {
      refFreq.set(t, (refFreq.get(t) ?? 0) + 1);
    }
  }

  const allTerms = new Set([...targetFreq.keys(), ...refFreq.keys()]);
  const results: KeynessEntry[] = [];

  for (const term of allTerms) {
    const a = targetFreq.get(term) ?? 0;
    const b = refFreq.get(term) ?? 0;
    const c = targetTotal;
    const d = refTotal;

    const e1 = c * (a + b) / (c + d);
    const e2 = d * (a + b) / (c + d);

    let ll = 0;
    if (a > 0) ll += a * Math.log(a / e1);
    if (b > 0) ll += b * Math.log(b / e2);
    ll *= 2;

    results.push({
      term,
      targetFreq: a,
      refFreq: b,
      keyness: ll,
    });
  }

  results.sort((a, b) => b.keyness - a.keyness);
  return results.slice(0, topN);
}

/** Compute TF-IDF scores for all terms in a corpus. Returns Map<docId, Map<term, score>>. */
export function tfidf(
  documents: Array<{ id: string; text: string }>
): Map<string, Map<string, number>> {
  const n = documents.length;
  const docFreqs = new Map<string, number>();
  const docTermFreqs: Array<{ id: string; tf: Map<string, number>; total: number }> = [];

  for (const doc of documents) {
    const tokens = tokenize(doc.text);
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    docTermFreqs.push({ id: doc.id, tf, total: tokens.length });

    const seen = new Set(tokens);
    for (const t of seen) {
      docFreqs.set(t, (docFreqs.get(t) ?? 0) + 1);
    }
  }

  const result = new Map<string, Map<string, number>>();

  for (const { id, tf, total } of docTermFreqs) {
    const scores = new Map<string, number>();
    for (const [term, count] of tf) {
      const tfScore = count / total;
      const df = docFreqs.get(term) ?? 0;
      const idf = Math.log(n / (1 + df));
      scores.set(term, tfScore * idf);
    }
    result.set(id, scores);
  }

  return result;
}

/** Cosine similarity between two numeric vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
