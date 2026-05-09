import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import type { Quest } from '@/components/QuestDatabase';

interface QuestData {
  quests: Quest[];
}

const TYPE_COLORS: Record<string, string> = {
  Main: '#e8c432',
  Side: '#9aa4b2',
  Special: '#c084fc',
  Other: '#9ca3af',
};

const OBJECTIVE_TYPE_LABELS: Record<number, string> = {
  1: 'Kill',
  3: 'Gather',
  6: 'Deliver',
  7: 'Talk',
  8: 'Speak To',
  12: 'Investigate',
};

function loadQuests(): Quest[] {
  const file = path.join(process.cwd(), 'public', 'data', 'playtest-quests.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as QuestData;
  return raw.quests;
}

function findQuest(slug: string): Quest | null {
  return loadQuests().find((q) => q.slug === slug) || null;
}

export function generateStaticParams() {
  return loadQuests().map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quest = findQuest(slug);
  if (!quest) return { title: 'Quest — ScarsHQ' };
  const description = quest.objectives.length
    ? `${quest.typeLabel} quest in Scars of Honor. ${quest.objectives.length} objectives including: ${quest.objectives[0].text}.`
    : `${quest.typeLabel} quest in Scars of Honor.`;
  return {
    title: `${quest.title} — ${quest.typeLabel} Quest | Scars of Honor | ScarsHQ`,
    description,
    alternates: { canonical: `/database/quests/${slug}` },
  };
}

export default async function QuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quest = findQuest(slug);
  if (!quest) notFound();

  const typeColor = TYPE_COLORS[quest.typeLabel] || TYPE_COLORS.Other;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Database', url: '/database' },
          { name: 'Quests', url: '/database/quests' },
          { name: quest.title, url: `/database/quests/${slug}` },
        ]}
      />
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/database" className="hover:text-honor-gold transition-colors">Database</Link>
        <span>/</span>
        <Link href="/database/quests" className="hover:text-honor-gold transition-colors">Quests</Link>
        <span>/</span>
        <span className="text-text-primary">{quest.title}</span>
      </nav>

      <div className="bg-card-bg border border-border-subtle rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: typeColor }}>
              {quest.typeLabel} Quest
            </div>
            <h1 className="font-heading text-2xl md:text-3xl text-text-primary">{quest.title}</h1>
          </div>
          <div className="text-right text-text-muted text-sm">
            <div>{quest.objectives.length} objective{quest.objectives.length === 1 ? '' : 's'}</div>
            <div className="text-xs opacity-70 mt-1">Quest ID: {quest.id}</div>
          </div>
        </div>
      </div>

      <div className="bg-card-bg border border-border-subtle rounded-lg p-6 sm:p-8 mb-8">
        <h2 className="font-heading text-lg text-honor-gold mb-4">Objectives</h2>
        {quest.objectives.length === 0 ? (
          <p className="text-text-muted text-sm">No objectives recorded.</p>
        ) : (
          <ol className="space-y-3">
            {quest.objectives.map((o, i) => {
              const tag = OBJECTIVE_TYPE_LABELS[o.type];
              return (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-text-muted text-xs tabular-nums mt-1 w-6 flex-shrink-0">{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-text-primary">
                      {o.text}
                      {o.counter ? <span className="text-text-muted"> (×{o.counter})</span> : null}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-text-muted">
                      {tag && <span className="px-1.5 py-0.5 rounded bg-dark-surface">{tag}</span>}
                      {o.coords && (
                        <span className="px-1.5 py-0.5 rounded bg-dark-surface tabular-nums">
                          {o.coords[0].toFixed(0)}, {o.coords[1].toFixed(0)}, {o.coords[2].toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="bg-card-bg border border-border-subtle/50 rounded-lg p-4 mb-8 text-xs text-text-muted">
        Datamined from the Spring 2026 Playtest client. Quest data may change before launch.
      </div>

      <Link href="/database/quests" className="text-honor-gold hover:text-honor-gold-light text-sm transition-colors">
        ← Back to Quest Database
      </Link>
    </div>
  );
}
