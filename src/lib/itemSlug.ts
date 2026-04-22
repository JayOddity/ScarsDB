export function slugify(name: string): string {
  return name
    .replace(/['\u2018\u2019]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface NamedItem {
  id: string;
  name: string;
}

export function assignSlugs(
  items: NamedItem[],
  existing: Map<string, string>,
): Map<string, string> {
  const result = new Map<string, string>();
  const used = new Set<string>();

  for (const item of items) {
    const prior = existing.get(item.id);
    if (prior) {
      result.set(item.id, prior);
      used.add(prior);
    }
  }

  const toAssign = items.filter((i) => !result.has(i.id));
  toAssign.sort((a, b) => a.id.localeCompare(b.id));

  for (const item of toAssign) {
    const base = slugify(item.name);
    if (!base) continue;
    let slug = base;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${n}`;
      n++;
    }
    used.add(slug);
    result.set(item.id, slug);
  }

  return result;
}
