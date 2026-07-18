/** Usernames: reject when more than 25% similar (must be ≥75% different). */
export const MIN_USERNAME_DISSIMILARITY = 0.75;

/** Display names: reject only when more than 90% similar (allows Steve → Steve Sermons). */
export const MIN_DISPLAY_NAME_DISSIMILARITY = 0.1;

/** @deprecated Use MIN_USERNAME_DISSIMILARITY or MIN_DISPLAY_NAME_DISSIMILARITY. */
export const MIN_NAME_DISSIMILARITY = MIN_USERNAME_DISSIMILARITY;

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array<number>(b.length + 1);
  const cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + cost,
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j]!;
  }
  return prev[b.length]!;
}

/** 0 = completely different, 1 = identical. */
export function nameSimilarity(a: string, b: string): number {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  if (x === y) return 1;
  const maxLen = Math.max(x.length, y.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(x, y) / maxLen;
}

export function nameDissimilarity(a: string, b: string): number {
  return 1 - nameSimilarity(a, b);
}

export function nameConflictMessage(
  candidate: string,
  existing: readonly string[],
  messages: { taken: string; similar: string },
  minDissimilarity = MIN_USERNAME_DISSIMILARITY,
): string | null {
  const c = candidate.trim().toLowerCase();
  if (!c) return null;
  const maxSimilarity = 1 - minDissimilarity;

  for (const other of existing) {
    const o = other.trim().toLowerCase();
    if (!o) continue;
    if (o === c) return messages.taken;
  }

  for (const other of existing) {
    const o = other.trim().toLowerCase();
    if (!o) continue;
    if (nameSimilarity(c, o) > maxSimilarity) return messages.similar;
  }

  return null;
}
