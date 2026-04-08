// Lightweight client-side profanity check
// This is NOT a replacement for server-side validation — it's for instant UI feedback only.
// The server-side filter (profanityFilter.ts) is the real gate.

const BLOCKED_PATTERNS = [
  // Racial slurs (with common evasions)
  /\bn[i1!|][g9][g9]+[e3]?[r]+s?\b/i,
  /\bn[i1!|][g9]+[a@]+[sz]?\b/i,
  /\bch[i1!|]nk\b/i,
  /\bsp[i1!|]c[ks]?\b/i,
  /\bgooks?\b/i,
  /\bwetbacks?\b/i,
  /\bbeaners?\b/i,
  /\bcoons?\b/i,
  /\bk[i1!|]kes?\b/i,
  /\bragheads?\b/i,
  /\btowelheads?\b/i,
  /\bredskins?\b/i,
  // Homophobic / transphobic
  /\bf[a@4][g9]+[o0]?[t]+s?\b/i,
  /\bf[a@4][g9]+s?\b/i,
  /\bdykes?\b/i,
  /\btrann[yie]+s?\b/i,
  /\bshemales?\b/i,
  // Ableist
  /\bretard(ed|s)?\b/i,
  /\br[e3]t[a4]rd\b/i,
  /\bsp[a@]z+\b/i,
  // Hate speech
  /\bnazis?\b/i,
  /\bheil\b/i,
  /\bsieg\s*heil\b/i,
  /\bwhite\s*power\b/i,
  /\bgas\s*the\b/i,
  /\bgenocide\b/i,
  // Common profanity
  /\bf+u+c+k+/i,
  /\bsh[i1!|]+t+/i,
  /\bc+u+n+t+s?\b/i,
  /\bb[i1!|]tch/i,
  /\bass+h[o0]+le/i,
  /\bwh[o0]+re/i,
];

/**
 * Client-side profanity check for instant feedback.
 * Returns error message if profanity detected, null if clean.
 */
export function checkProfanity(text: string): string | null {
  if (!text) return null;
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return 'This contains inappropriate language. Please remove offensive words.';
    }
  }
  return null;
}
