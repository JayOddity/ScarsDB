'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { getSavedBuilds, deleteBuild, type SavedBuild } from '@/lib/savedBuilds';
import { classes } from '@/data/classes';
import FilteredBuildList from '@/components/FilteredBuildList';

const classMap = new Map(classes.map((c) => [c.slug, c]));

interface CloudBuild {
  code: string;
  classSlug: string;
  name: string;
  tags?: string[];
  difficulty?: string;
  description?: string;
  totalPoints: number;
  upvotes?: number;
  downvotes?: number;
  createdAt: string;
}

type Tab = 'all' | 'mine';

export default function BuildsPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'all');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [localBuilds, setLocalBuilds] = useState<SavedBuild[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [topBuilds, setTopBuilds] = useState<CloudBuild[]>([]);

  const isLoggedIn = !!session?.user;

  useEffect(() => {
    if (!isLoggedIn) setLocalBuilds(getSavedBuilds());
  }, [isLoggedIn]);

  useEffect(() => {
    const params = new URLSearchParams({ sort: 'top', limit: '6' });
    if (selectedClass) params.set('class', selectedClass);
    if (selectedTags.length === 1) params.set('tag', selectedTags[0]);
    fetch(`/api/builds?${params}`)
      .then((r) => r.json())
      .then((data) => {
        let builds = (data.builds || []) as CloudBuild[];
        if (selectedTags.length > 1) {
          builds = builds.filter(b => b.tags?.some(t => selectedTags.includes(t)));
        }
        setTopBuilds(builds);
      })
      .catch(() => {});
  }, [selectedClass, selectedTags]);

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      deleteBuild(id);
      setLocalBuilds(getSavedBuilds());
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }

  function toggleClass(slug: string) {
    setSelectedClass((prev) => (prev === slug ? null : slug));
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-8 pb-5 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-honor-gold/5 to-void-black" />
        <div className="relative max-w-6xl mx-auto">
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-3">
            Builds
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto mb-1">
            Community talent builds for every class. Browse, vote, and share your own.
          </p>

          {/* Class Filter Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-w-6xl mx-auto">
            {classes.map((c) => {
              const isActive = selectedClass === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => toggleClass(c.slug)}
                  className={`group flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-colors ${
                    isActive
                      ? 'border-honor-gold bg-honor-gold/10'
                      : 'border-transparent hover:border-honor-gold-dim hover:bg-honor-gold/5'
                  }`}
                >
                  <img
                    src={c.icon}
                    alt={c.name}
                    className={`w-28 h-28 sm:w-32 sm:h-32 object-contain transition-all ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    } ${selectedClass && !isActive ? 'opacity-40 grayscale' : ''}`}
                  />
                  <span className={`text-[10px] transition-colors ${
                    isActive ? 'text-honor-gold' : 'text-text-muted group-hover:text-honor-gold'
                  }`}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Quick Links */}
        <section className="pt-2 pb-3">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'PvP', value: 'pvp' },
              { label: 'PvE', value: 'pve' },
              { label: 'Leveling', value: 'leveling' },
              { label: 'Beginner', value: 'beginner' },
            ].map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => setSelectedTags(prev => prev.includes(tag.value) ? prev.filter(t => t !== tag.value) : [...prev, tag.value])}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  selectedTags.includes(tag.value)
                    ? 'border-honor-gold bg-honor-gold text-void-black'
                    : 'border-border-subtle bg-card-bg text-text-secondary hover:border-honor-gold-dim hover:text-honor-gold'
                }`}
              >
                {tag.label}
              </button>
            ))}
            <Link
              href="/talents"
              className="px-4 py-2 rounded-lg bg-honor-gold/10 border border-honor-gold/20 text-sm text-honor-gold hover:bg-honor-gold/20 transition-colors ml-auto"
            >
              + Create Build
            </Link>
          </div>
        </section>

        {/* Top Builds */}
        {topBuilds.length > 0 && (
          <section className="py-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-honor-gold">
                {selectedClass ? `Top ${classMap.get(selectedClass)?.name} Builds` : 'Top Rated'}
              </h2>
              <Link href="/builds/best" className="text-xs text-text-muted hover:text-honor-gold transition-colors">
                View all &rarr;
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topBuilds.map((build) => {
                const cls = classMap.get(build.classSlug);
                const score = (build.upvotes || 0) - (build.downvotes || 0);
                return (
                  <Link
                    key={build.code}
                    href={`/builds/view/${build.code}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-card-bg hover:border-honor-gold-dim transition-colors"
                  >
                    {cls && <img src={cls.icon} alt={cls.name} className="w-10 h-10 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm text-text-primary truncate">{build.name || 'Unnamed Build'}</span>
                        {score > 0 && <span className="text-[10px] text-emerald-400 shrink-0 ml-auto">+{score}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-text-muted">{cls?.name}</span>
                        <span className="text-[10px] text-text-muted">{build.totalPoints} pts</span>
                        {build.difficulty && (
                          <span className={`text-[9px] px-1 py-0.5 rounded border ${
                            build.difficulty === 'easy' ? 'text-emerald-400 border-emerald-500/20' :
                            build.difficulty === 'hard' ? 'text-scar-red-light border-scar-red/20' :
                            'text-honor-gold border-honor-gold/20'
                          }`}>
                            {build.difficulty.charAt(0).toUpperCase() + build.difficulty.slice(1)}
                          </span>
                        )}
                        {build.tags?.map((t) => (
                          <span key={t} className="text-[9px] text-text-muted/70">{t === 'pvp' ? 'PvP' : t === 'pve' ? 'PvE' : t.charAt(0).toUpperCase() + t.slice(1)}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border-subtle">
          <button
            onClick={() => setTab('all')}
            className={`px-5 py-3 text-sm font-heading transition-colors relative ${
              tab === 'all' ? 'text-honor-gold' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            All Builds
            {tab === 'all' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-honor-gold" />}
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-5 py-3 text-sm font-heading transition-colors relative ${
              tab === 'mine' ? 'text-honor-gold' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            My Builds
            {tab === 'mine' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-honor-gold" />}
          </button>
        </div>

        {tab === 'all' && (
          <FilteredBuildList
            defaultSort="newest"
            layout="grid"
            externalClass={selectedClass}
            externalSort={selectedSort}
            externalTags={selectedTags}
            onClassChange={(cls) => setSelectedClass(cls === 'all' ? null : cls)}
            onSortChange={(s) => setSelectedSort(s)}
            onTagsChange={setSelectedTags}
            hideTagFilter
            tagPills
          />
        )}

        {tab === 'mine' && (
          <>
            {!isLoggedIn ? (
              <>
                <div className="bg-card-bg border border-honor-gold/20 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <span className="text-sm text-text-secondary">
                    <Link href="/login" className="text-honor-gold hover:text-honor-gold-light transition-colors">Sign in</Link> to save builds to your account and access them anywhere.
                  </span>
                </div>
                {localBuilds.length === 0 ? (
                  <div className="text-center py-20 rounded-lg border border-border-subtle bg-card-bg">
                    <p className="text-text-muted text-lg mb-4">No saved builds yet.</p>
                    <Link href="/talents" className="inline-block px-6 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors">
                      Create a Build
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {localBuilds.map((build) => {
                      const cls = classMap.get(build.classSlug);
                      const isConfirming = confirmDelete === build.id;
                      return (
                        <div key={build.id} className="bg-card-bg border border-border-subtle rounded-lg p-4 hover:border-honor-gold-dim transition-colors">
                          <div className="flex items-center gap-4">
                            {cls && <img src={cls.icon} alt={cls.name} className="w-12 h-12 shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-heading text-lg text-text-primary truncate">{build.name}</h3>
                              <div className="flex items-center gap-3 text-xs text-text-muted">
                                {cls && <span>{cls.name}</span>}
                                <span>{build.totalPoints} pts</span>
                                <span>{new Date(build.createdAt).toLocaleDateString()}</span>
                                {build.cloudCode && <span className="text-emerald-400">Code: {build.cloudCode}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/talents/${build.classSlug}${build.cloudCode ? `?build=${build.cloudCode}` : `#${build.allocation}`}`}
                                className="px-4 py-2 bg-honor-gold/10 border border-honor-gold-dim rounded-lg text-sm text-honor-gold hover:bg-honor-gold/20 transition-colors"
                              >
                                Open
                              </Link>
                              <button
                                onClick={() => handleDelete(build.id)}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors border ${isConfirming ? 'bg-scar-red/20 border-scar-red/50 text-scar-red-light' : 'bg-dark-surface border-border-subtle text-text-muted hover:text-scar-red-light hover:border-scar-red/30'}`}
                                onBlur={() => setConfirmDelete(null)}
                              >
                                {isConfirming ? 'Confirm?' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <FilteredBuildList defaultSort="newest" layout="grid" mine />
            )}
          </>
        )}
      </div>
      <div className="pb-20" />
    </div>
  );
}
