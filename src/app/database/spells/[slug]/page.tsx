import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { formatSpellName } from '@/lib/spellName';

interface Spell {
  _id: string;
  name: string;
  slug: string;
  externalId: string;
  description?: string;
  icon?: string;
  maxRange?: number;
  targetType?: string;
  channelTime?: number;
  castTime?: number;
  cooldown?: number;
  globalCooldown?: number;
  requiredAmount?: number;
  requiredResource?: string;
  schoolType?: string;
  flags?: string[];
  tags?: string[];
  classSpecLevels?: Array<{ class?: string; spec?: string; level?: number }>;
  _updatedAt?: string;
}

const SPELL_PROJECTION = `{
  _id,
  name,
  "slug": slug.current,
  externalId,
  description,
  icon,
  maxRange,
  targetType,
  channelTime,
  castTime,
  cooldown,
  globalCooldown,
  requiredAmount,
  requiredResource,
  schoolType,
  flags,
  tags,
  classSpecLevels,
  _updatedAt
}`;

const SCHOOL_COLORS: Record<string, string> = {
  Physical: '#f59e0b',
  Fire: '#ef4444',
  Frost: '#67e8f9',
  Nature: '#4ade80',
  Holy: '#fde047',
  Lightning: '#a5b4fc',
  Cosmos: '#c084fc',
  Chaos: '#e879f9',
  Poison: '#84cc16',
  Bleed: '#dc2626',
  All: '#9ca3af',
};

const CLASS_META: Record<string, { name: string; color: string }> = {
  WARRIOR: { name: 'Warrior', color: '#c84f3a' },
  KNIGHT: { name: 'Paladin', color: '#e8c432' },
  PALADIN: { name: 'Paladin', color: '#e8c432' },
  RANGER: { name: 'Ranger', color: '#5fa14a' },
  ASSASSIN: { name: 'Assassin', color: '#9c5cb6' },
  PIRATE: { name: 'Pirate', color: '#d18b3e' },
  MAGE: { name: 'Mage', color: '#4a8ff7' },
  PRIEST: { name: 'Priest', color: '#e9d8a6' },
  DRUID: { name: 'Druid', color: '#7bb866' },
  NECROMANCER: { name: 'Necromancer', color: '#7d3a8b' },
  MYSTIC: { name: 'Mystic', color: '#3aa8b4' },
};

function formatTime(ms?: number): string {
  if (ms == null) return '—';
  if (ms === 0) return 'Instant';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 2)}s`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spell = await sanityClient.fetch<{ name?: string; description?: string; schoolType?: string } | null>(
    `*[_type == "spell" && slug.current == $slug][0]{ name, description, schoolType }`,
    { slug },
  );
  if (!spell?.name) return { title: 'Spell — ScarsHQ' };
  const display = formatSpellName(spell.name);
  const school = spell.schoolType ? `${spell.schoolType} ` : '';
  return {
    title: `${display} — ${school}Spell | Scars of Honor | ScarsHQ`,
    description: formatSpellName(spell.description) || `${display} — ${school}spell in Scars of Honor. Range, cooldown, cast time, and more.`,
    alternates: { canonical: `/database/spells/${slug}` },
  };
}

export default async function SpellPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const spell = await sanityClient.fetch<Spell | null>(
    `*[_type == "spell" && slug.current == $slug && icon match "/Icons/Spells/*"][0] ${SPELL_PROJECTION}`,
    { slug },
  );

  if (!spell) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-3xl text-scar-red mb-4">Spell Not Found</h1>
        <p className="text-text-secondary mb-4">This spell could not be found in the database.</p>
        <Link href="/database/spells" className="text-honor-gold hover:text-honor-gold-light">← Back to Spell Database</Link>
      </div>
    );
  }

  const schoolColor = spell.schoolType ? SCHOOL_COLORS[spell.schoolType] || '#9ca3af' : null;
  const displayName = formatSpellName(spell.name);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Database', url: '/database' },
          { name: 'Spells', url: '/database/spells' },
          { name: displayName, url: `/database/spells/${slug}` },
        ]}
      />
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/database" className="hover:text-honor-gold transition-colors">Database</Link>
        <span>/</span>
        <Link href="/database/spells" className="hover:text-honor-gold transition-colors">Spells</Link>
        <span>/</span>
        <span className="text-text-primary">{displayName}</span>
      </nav>

      <div className="bg-card-bg border border-border-subtle rounded-lg p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-lg border-2 border-border-subtle overflow-hidden bg-dark-surface flex items-center justify-center flex-shrink-0">
            {spell.icon && !spell.icon.includes('placehold') ? (
              <Image src={spell.icon} alt={spell.name} width={80} height={80} className="object-cover" />
            ) : (
              <span className="text-2xl text-text-muted">?</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl md:text-3xl text-text-primary mb-2">{displayName}</h1>
            <div className="flex flex-wrap gap-2 text-sm">
              {spell.schoolType && (
                <span className="px-2 py-1 rounded bg-dark-surface" style={{ color: schoolColor || undefined }}>{spell.schoolType}</span>
              )}
              {spell.requiredResource && (
                <span className="px-2 py-1 rounded bg-dark-surface text-text-secondary">{spell.requiredResource}</span>
              )}
              {spell.targetType && (
                <span className="px-2 py-1 rounded bg-dark-surface text-text-secondary">{spell.targetType}</span>
              )}
            </div>
            {spell.description && (
              <p className="text-text-secondary mt-4 leading-relaxed">{formatSpellName(spell.description)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
          <h2 className="font-heading text-lg text-honor-gold mb-4">Combat</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-text-muted">Cast Time</span><span className="text-text-primary tabular-nums">{formatTime(spell.castTime)}</span></li>
            <li className="flex justify-between"><span className="text-text-muted">Channel Time</span><span className="text-text-primary tabular-nums">{formatTime(spell.channelTime)}</span></li>
            <li className="flex justify-between"><span className="text-text-muted">Cooldown</span><span className="text-text-primary tabular-nums">{formatTime(spell.cooldown)}</span></li>
            <li className="flex justify-between"><span className="text-text-muted">Global Cooldown</span><span className="text-text-primary tabular-nums">{formatTime(spell.globalCooldown)}</span></li>
          </ul>
        </div>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
          <h2 className="font-heading text-lg text-honor-gold mb-4">Targeting</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-text-muted">Max Range</span><span className="text-text-primary tabular-nums">{spell.maxRange ?? '—'}</span></li>
            <li className="flex justify-between"><span className="text-text-muted">Target Type</span><span className="text-text-primary text-right max-w-[60%]">{spell.targetType || '—'}</span></li>
            <li className="flex justify-between"><span className="text-text-muted">Resource</span><span className="text-text-primary">{spell.requiredResource || '—'}</span></li>
            <li className="flex justify-between"><span className="text-text-muted">Cost</span><span className="text-text-primary tabular-nums">{spell.requiredAmount ? spell.requiredAmount : '—'}</span></li>
          </ul>
        </div>
      </div>

      {spell.flags && spell.flags.length > 0 && (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6 mb-8">
          <h2 className="font-heading text-lg text-honor-gold mb-4">Flags</h2>
          <div className="flex flex-wrap gap-2">
            {spell.flags.map((f) => (
              <span key={f} className="text-xs px-2 py-1 rounded bg-dark-surface text-text-secondary border border-border-subtle/50">{f}</span>
            ))}
          </div>
        </div>
      )}

      {spell.tags && spell.tags.length > 0 && (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6 mb-8">
          <h2 className="font-heading text-lg text-honor-gold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {spell.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded bg-dark-surface text-text-muted">{t}</span>
            ))}
          </div>
        </div>
      )}

      {spell.classSpecLevels && spell.classSpecLevels.length > 0 && (
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6 mb-8">
          <h2 className="font-heading text-lg text-honor-gold mb-4">Class Availability</h2>
          <ul className="text-sm space-y-1">
            {spell.classSpecLevels.map((csl, i) => {
              const meta = csl.class ? CLASS_META[csl.class.toUpperCase()] : null;
              const tail = [csl.spec, csl.level != null ? `Lv ${csl.level}` : null].filter(Boolean).join(' · ');
              return (
                <li key={i}>
                  {meta && <span style={{ color: meta.color }}>{meta.name}</span>}
                  {tail && <span className="text-text-secondary"> · {tail}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Link href="/database/spells" className="text-honor-gold hover:text-honor-gold-light text-sm transition-colors">
        ← Back to Spell Database
      </Link>
    </div>
  );
}
