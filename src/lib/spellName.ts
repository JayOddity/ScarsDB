// Strips internal localization-key suffixes and converts camelCase to a
// human-readable spaced title. The BeastBurst dataset names many spells with
// raw keys like "elementalBeamNameKey", "finalVerdictCastigationDescKey", or
// "100armorStatNameKey" instead of their final display name. Real strings
// (sentences, already-spaced labels) pass through untouched.
export function formatSpellName(raw: string | null | undefined): string {
  if (!raw) return '';
  const hasKeySuffix = /(NameKey|DescKey|Key)$/.test(raw);
  const isCamelKey = !raw.includes(' ') && /^[a-z][a-zA-Z0-9]*[A-Z]/.test(raw);
  if (!hasKeySuffix && !isCamelKey) return raw;
  let s = raw.replace(/(NameKey|DescKey|Key)$/, '');
  if (s.includes(' ')) {
    return s.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
  }
  s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
  s = s.replace(/^(\d+)([a-zA-Z])/, '$1 $2');
  return s.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}
