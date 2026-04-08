import filter from 'leo-profanity';

// Add extra slurs and hate speech that leo-profanity might miss
const EXTRA_BLOCKED_WORDS = [
  // Racial slurs
  'chink', 'wetback', 'spic', 'gook', 'beaner', 'coon', 'darkie', 'jigaboo',
  'kike', 'raghead', 'towelhead', 'camelj0ckey', 'zipperhead', 'chinaman',
  'redskin', 'halfbreed', 'mongol', 'mongoloid',
  // Homophobic slurs
  'fag', 'fags', 'faggot', 'faggots', 'dyke', 'dykes', 'homo', 'homos',
  'tranny', 'trannies', 'shemale', 'ladyboy',
  // Transphobic
  'trannie', 'heshe', 'shim',
  // Ableist slurs
  'retard', 'retards', 'retarded', 'spaz', 'spazz', 'spastic',
  // General hate
  'nazi', 'nazis', 'heil', 'sieg heil', 'white power', 'whitepower',
  'gas the', 'genocide',
  // Common evasions
  'f4g', 'f4gg0t', 'n1gger', 'n1gga', 'nigg3r', 'n1gg3r', 'niqqa',
  'f@g', 'f@ggot', 'r3tard', 'ret4rd',
];

filter.add(EXTRA_BLOCKED_WORDS);

/**
 * Check if text contains profanity or hate speech.
 * Returns true if the text is clean.
 */
export function isClean(text: string): boolean {
  if (!text) return true;
  return !filter.check(text);
}

/**
 * Replace profanity with asterisks.
 */
export function censorText(text: string): string {
  if (!text) return text;
  return filter.clean(text);
}

/**
 * Validate user-submitted text. Returns an error message if profanity detected, null if clean.
 */
export function validateText(text: string, fieldName: string = 'Text'): string | null {
  if (!text) return null;
  if (!isClean(text)) {
    return `${fieldName} contains inappropriate language. Please remove offensive words.`;
  }
  return null;
}
