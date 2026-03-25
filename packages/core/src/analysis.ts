import { DataItem, Segment, CountEntry, TransitionMatrix, Conversation } from './types.ts';

/** Count occurrences of a key across items. */
export function countsBy<T extends DataItem>(items: T[], key: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const v = item[key];
    if (v === undefined || v === null || v === '') continue;
    out[v] = (out[v] || 0) + 1;
  }
  return out;
}

/** Find the most-frequent value for a given key. */
export function dominantValue<T extends DataItem>(items: T[], key: string): string | null {
  const counts = countsBy(items, key);
  const pairs = Object.entries(counts);
  if (!pairs.length) return null;
  pairs.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return pairs[0][0];
}

/** Sort a counts record into descending CountEntry[]. */
export function sortCounts(counts: Record<string, number>): CountEntry[] {
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Segment a sorted sequence by a categorical key (run-length encoding). */
export function makeSegments<T extends DataItem>(items: T[], key: string): Segment[] {
  if (!items.length) return [];
  const segments: Segment[] = [];
  let current: Segment = { value: items[0][key], start: 0, end: 0, items: [items[0]] };
  for (let i = 1; i < items.length; i++) {
    if (items[i][key] === current.value) {
      current.end = i;
      current.items.push(items[i]);
    } else {
      segments.push(current);
      current = { value: items[i][key], start: i, end: i, items: [items[i]] };
    }
  }
  segments.push(current);
  return segments;
}

/** Extract boundary transition labels between consecutive segments. */
export function boundaryPairs(segments: Segment[]): string[] {
  const pairs: string[] = [];
  for (let i = 1; i < segments.length; i++) {
    pairs.push(`${segments[i - 1].value} → ${segments[i].value}`);
  }
  return pairs;
}

/** Compute an NxN transition matrix from sequences keyed by `key`. */
export function computeTransitionMatrix<T extends DataItem>(
  sequences: T[][],
  key: string
): TransitionMatrix {
  const labelSet = new Set<string>();
  for (const seq of sequences) {
    for (const item of seq) {
      if (item[key]) labelSet.add(item[key]);
    }
  }
  const labels = Array.from(labelSet).sort();
  const indexMap = new Map(labels.map((l, i) => [l, i]));
  const matrix = labels.map(() => labels.map(() => 0));

  for (const seq of sequences) {
    for (let i = 1; i < seq.length; i++) {
      const from = indexMap.get(seq[i - 1][key]);
      const to = indexMap.get(seq[i][key]);
      if (from !== undefined && to !== undefined) matrix[from][to]++;
    }
  }
  return { labels, matrix };
}

/** Calculate basic conversation metrics. */
export function calculateConversationMetrics(conversation: Conversation) {
  const messages = conversation.messages;
  const turnCount = messages.length;
  const userMessages = messages.filter(m => m.speaker === 'user');
  const assistantMessages = messages.filter(m => m.speaker === 'assistant');

  return {
    turnCount,
    userTurnCount: userMessages.length,
    assistantTurnCount: assistantMessages.length,
    avgMsgLength: messages.reduce((acc, m) => acc + m.content.length, 0) / turnCount || 0,
    startTime: messages[0]?.timestamp,
    endTime: messages[messages.length - 1]?.timestamp,
  };
}

/** Extract unique values of a key across items. */
export function uniqueValues<T extends DataItem>(items: T[], key: string): string[] {
  return Array.from(new Set(items.map(i => i[key]).filter(Boolean)));
}

/** Turn sequence string (e.g. "UAUA"). */
export function getTurnSequence(conversation: Conversation): string {
  return conversation.messages.map(m => m.speaker[0].toUpperCase()).join('');
}

/** Extract all unique roles from a conversation. */
export function extractRoles(conversation: Conversation): string[] {
  const roles = new Set<string>();
  conversation.messages.forEach(m => {
    if (m.role) roles.add(m.role);
  });
  return Array.from(roles);
}
