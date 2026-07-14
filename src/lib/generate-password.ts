/** Characters that avoid common ambiguous glyphs (0/O, 1/l/I). */
const LOWER = "abcdefghjkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*-_+=";
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

function randomIndex(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]! % max;
}

function pickChar(pool: string): string {
  return pool[randomIndex(pool.length)]!;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Generate a random password that satisfies app policy (8+ chars, letter, number).
 * Default length 16 with upper, lower, digit, and symbol.
 */
export function generateStrongPassword(length = 16): string {
  const len = Math.min(128, Math.max(12, length));
  const chars = [
    pickChar(LOWER),
    pickChar(UPPER),
    pickChar(DIGITS),
    pickChar(SYMBOLS),
  ];
  while (chars.length < len) {
    chars.push(pickChar(ALL));
  }
  return shuffle(chars).join("");
}
