'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { classes } from '@/data/classes';
import VoteButton from './VoteButton';
import BuildEditButton from './BuildEditButton';
import AdminBuildControls from './AdminBuildControls';
import BuildThumbnails from './BuildThumbnails';

const classMap = new Map(classes.map((c) => [c.slug, c]));

interface CloudBuild {
  code: string;
  classSlug: string;
  allocation?: string;
  name: string;
  tags?: string[];
  difficulty?: string;
  description?: string;
  guide?: string;
  patch?: string;
  totalPoints: number;
  upvotes?: number;
  downvotes?: number;
  createdAt: string;
  views?: number;
  authorName?: string;
  authorImage?: string;
  authorRef?: string;
}

interface FilteredBuildListProps {
  initialTag?: string;
  initialClass?: string;
  defaultSort?: 'newest' | 'top' | 'popular';
  layout?: 'list' | 'grid';
  externalClass?: string | null;
  externalSort?: string;
  externalTags?: string[];
  onClassChange?: (cls: string) => void;
  onSortChange?: (sort: string) => void;
  onTagsChange?: (tags: string[]) => void;
  hideTagFilter?: boolean;
  tagPills?: boolean;
  mine?: boolean;
}

export default function FilteredBuildList({
  initialTag,
  initialClass,
  defaultSort = 'top',
  layout = 'list',
  externalClass,
  externalSort,
  externalTags,
  onClassChange,
  onSortChange,
  onTagsChange,
  hideTagFilter,
  tagPills,
  mine,
}: FilteredBuildListProps) {
  const [builds, setBuilds] = useState<CloudBuild[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(externalSort || defaultSort);
  const [filterClass, setFilterClass] = useState(externalClass ?? initialClass ?? 'all');
  const [filterTags, setFilterTags] = useState<string[]>(externalTags || (initialTag ? [initialTag] : []));

  // Sync external class/sort when parent changes them
  useEffect(() => {
    if (externalClass !== undefined && externalClass !== null) {
      setFilterClass(externalClass);
    } else if (externalClass === null) {
      setFilterClass('all');
    }
  }, [externalClass]);

  useEffect(() => {
    if (externalSort) setSort(externalSort);
  }, [externalSort]);

  useEffect(() => {
    if (externalTags !== undefined) {
      setFilterTags(externalTags);
    }
  }, [externalTags]);

  const fetchBuilds = useCallback(async (p: number, s: string, cls: string, tags: string[]) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), sort: s, limit: '50' });
      if (tags.length === 1) params.set('tag', tags[0]);
      if (cls && cls !== 'all') params.set('class', cls);
      if (mine) params.set('mine', 'true');
      const res = await fetch(`/api/builds?${params}`);
      const data = await res.json();
      if (res.ok) {
        let results = data.builds;
        // Client-side filter for multi-tag (API only supports single tag)
        if (tags.length > 1) {
          results = results.filter((b: CloudBuild) => b.tags?.some((t: string) => tags.includes(t)));
        }
        setBuilds(results);
        setTotal(tags.length > 1 ? results.length : data.total);
        setPage(data.page);
        setPages(tags.length > 1 ? 1 : data.pages);
      }
    } catch {
      /* empty */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBuilds(1, sort, filterClass, filterTags);
  }, [sort, filterClass, filterTags, fetchBuilds]);

  function handlePageChange(newPage: number) {
    fetchBuilds(newPage, sort, filterClass, filterTags);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={sort}
          onChange={(e) => { const v = e.target.value as typeof sort; setSort(v); setPage(1); onSortChange?.(v); }}
          className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-honor-gold-dim"
        >
          <option value="newest">Newest First</option>
          <option value="top">Highest Rated</option>
          <option value="popular">Most Viewed</option>
        </select>
        <select
          value={filterClass}
          onChange={(e) => { setFilterClass(e.target.value); setPage(1); onClassChange?.(e.target.value); }}
          className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-honor-gold-dim"
        >
          <option value="all">All Classes</option>
          {classes.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        {!hideTagFilter && (
          <select
            value={filterTags.length === 1 ? filterTags[0] : 'all'}
            onChange={(e) => { const v = e.target.value; setFilterTags(v === 'all' ? [] : [v]); setPage(1); onTagsChange?.(v === 'all' ? [] : [v]); }}
            className="bg-dark-surface border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-honor-gold-dim"
          >
            <option value="all">All Tags</option>
            <option value="pvp">PvP</option>
            <option value="pve">PvE</option>
            <option value="leveling">Leveling</option>
            <option value="beginner">Beginner</option>
          </select>
        )}
        <span className="text-xs text-text-muted ml-auto">
          {total} build{total !== 1 ? 's' : ''}
        </span>
      </div>

      {tagPills && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: 'PvP', value: 'pvp' },
            { label: 'PvE', value: 'pve' },
            { label: 'Leveling', value: 'leveling' },
            { label: 'Beginner', value: 'beginner' },
          ].map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => { const next = filterTags.includes(tag.value) ? filterTags.filter(t => t !== tag.value) : [...filterTags, tag.value]; setFilterTags(next); setPage(1); onTagsChange?.(next); }}
              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                filterTags.includes(tag.value)
                  ? 'border-honor-gold bg-honor-gold text-void-black'
                  : 'border-border-subtle bg-card-bg text-text-secondary hover:border-honor-gold-dim hover:text-honor-gold'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={layout === 'grid' ? 'grid lg:grid-cols-2 gap-3' : 'grid gap-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card-bg border border-border-subtle rounded-lg p-5 animate-pulse">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded bg-dark-surface shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-surface rounded w-1/4" />
                  <div className="h-5 bg-dark-surface rounded w-1/2" />
                  <div className="h-3 bg-dark-surface rounded w-1/3" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-dark-surface rounded w-24" />
                <div className="h-8 bg-dark-surface rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : builds.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg mb-4">No builds found yet.</p>
          <Link href="/talents" className="inline-block px-6 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors">
            Create a Build
          </Link>
        </div>
      ) : (
        <>
          <div className={layout === 'grid' ? 'grid lg:grid-cols-2 gap-3' : 'grid gap-3'}>
            {builds.map((build) => {
              const cls = classMap.get(build.classSlug);
              const date = new Date(build.createdAt);
              const score = (build.upvotes || 0) - (build.downvotes || 0);

              return (
                <div
                  key={build.code}
                  className={`bg-card-bg border border-border-subtle hover:border-honor-gold-dim transition-colors group ${
                    layout === 'grid'
                      ? 'rounded-xl p-4 bg-[linear-gradient(145deg,rgba(200,168,78,0.06),rgba(255,255,255,0.01)_40%,rgba(255,255,255,0.02)_100%)]'
                      : 'rounded-lg p-5'
                  }`}
                >
                  {layout === 'grid' ? (
                    <div className="flex h-full gap-3">
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <Link href={`/builds/view/${build.code}`} className="shrink-0">
                            {cls && <img src={cls.icon} alt={cls.name} className="w-12 h-12" />}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {cls && <span className="font-heading text-sm text-honor-gold shrink-0">{cls.name}</span>}
                              {build.tags?.map((t) => (
                                <span key={t} className="text-[9px] px-1 py-0.5 rounded border shrink-0 bg-honor-gold/10 text-honor-gold border-honor-gold/20">
                                  {t === 'pvp' ? 'PvP' : t === 'pve' ? 'PvE' : t.charAt(0).toUpperCase() + t.slice(1)}
                                </span>
                              ))}
                              {build.difficulty && (
                                <span className={`text-[9px] px-1 py-0.5 rounded border shrink-0 ${
                                  build.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  build.difficulty === 'hard' ? 'bg-scar-red/10 text-scar-red-light border-scar-red/20' :
                                  'bg-honor-gold/10 text-honor-gold border-honor-gold/20'
                                }`}>
                                  {build.difficulty.charAt(0).toUpperCase() + build.difficulty.slice(1)}
                                </span>
                              )}
                            </div>
                            <Link href={`/builds/view/${build.code}`} className="font-heading text-sm text-text-primary line-clamp-1 hover:text-honor-gold transition-colors">
                              {build.name || 'Unnamed Build'}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-text-muted mt-1">
                              <span>{build.totalPoints} pts</span>
                              <span>{date.toLocaleDateString()}</span>
                              <span className="font-mono">{build.code}</span>
                              {score > 0 && <span className="text-emerald-400">+{score}</span>}
                            </div>
                          </div>
                          {build.allocation && (
                            <div className="shrink-0">
                              <BuildThumbnails classSlug={build.classSlug} allocation={build.allocation} size={48} />
                            </div>
                          )}
                        </div>

                        <div className="mt-auto flex items-center gap-2">
                          <Link
                            href={`/builds/view/${build.code}`}
                            className="px-3 py-1.5 bg-honor-gold/10 border border-honor-gold-dim rounded-lg text-xs text-honor-gold hover:bg-honor-gold/20 transition-colors whitespace-nowrap"
                          >
                            {build.guide ? 'View Guide' : 'View'}
                          </Link>
                          <a
                            href={`/talents/${build.classSlug}?build=${build.code}`}
                            className="px-3 py-1.5 bg-dark-surface border border-border-subtle rounded-lg text-xs text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors whitespace-nowrap"
                          >
                            Calculator
                          </a>
                          <BuildEditButton buildCode={build.code} authorRef={build.authorRef} />
                          <AdminBuildControls buildCode={build.code} onDeleted={() => fetchBuilds(page, sort, filterClass, filterTags)} onVotesReset={() => fetchBuilds(page, sort, filterClass, filterTags)} />
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center border-l border-border-subtle pl-3">
                        <VoteButton buildCode={build.code} initialUpvotes={build.upvotes} initialDownvotes={build.downvotes} large />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Link href={`/builds/view/${build.code}`} className="shrink-0">
                        {cls && <img src={cls.icon} alt={cls.name} className="w-16 h-16 sm:w-20 sm:h-20" />}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {cls && <span className="font-heading text-xl text-honor-gold shrink-0">{cls.name}</span>}
                          {build.tags?.map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded border shrink-0 bg-honor-gold/10 text-honor-gold border-honor-gold/20">
                              {t === 'pvp' ? 'PvP' : t === 'pve' ? 'PvE' : t.charAt(0).toUpperCase() + t.slice(1)}
                            </span>
                          ))}
                          {build.difficulty && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                              build.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              build.difficulty === 'hard' ? 'bg-scar-red/10 text-scar-red-light border-scar-red/20' :
                              'bg-honor-gold/10 text-honor-gold border-honor-gold/20'
                            }`}>
                              {build.difficulty.charAt(0).toUpperCase() + build.difficulty.slice(1)}
                            </span>
                          )}
                          {build.patch && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">{build.patch}</span>}
                        </div>
                        <Link href={`/builds/view/${build.code}`} className="font-heading text-sm text-text-secondary truncate block hover:text-honor-gold transition-colors">
                          {build.name || 'Unnamed Build'}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                          <span>{build.totalPoints} pts</span>
                          <span>{date.toLocaleDateString()}</span>
                          {(build.views !== undefined && build.views > 0) && (
                            <span>{build.views} view{build.views !== 1 ? 's' : ''}</span>
                          )}
                          <span className="font-mono">{build.code}</span>
                          {build.authorName && (
                            <span className="flex items-center gap-1">
                              {build.authorImage && <img src={build.authorImage} alt="" className="w-4 h-4 rounded-full" />}
                              <span className="text-text-secondary">{build.authorName}</span>
                            </span>
                          )}
                        </div>
                        {build.allocation && (
                          <div className="mt-2">
                            <BuildThumbnails classSlug={build.classSlug} allocation={build.allocation} size={48} />
                          </div>
                        )}
                        {build.description && (
                          <p className="text-xs text-text-muted mt-2 line-clamp-2">{build.description}</p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/builds/view/${build.code}`}
                            className="px-4 py-2 bg-honor-gold/10 border border-honor-gold-dim rounded-lg text-xs text-honor-gold hover:bg-honor-gold/20 transition-colors whitespace-nowrap"
                          >
                            {build.guide ? 'View Guide' : 'View'}
                          </Link>
                          <a
                            href={`/talents/${build.classSlug}?build=${build.code}`}
                            className="px-4 py-2 bg-dark-surface border border-border-subtle rounded-lg text-xs text-text-secondary hover:text-honor-gold hover:border-honor-gold-dim transition-colors whitespace-nowrap"
                          >
                            Calculator
                          </a>
                          <BuildEditButton buildCode={build.code} authorRef={build.authorRef} />
                          <AdminBuildControls buildCode={build.code} onDeleted={() => fetchBuilds(page, sort, filterClass, filterTags)} onVotesReset={() => fetchBuilds(page, sort, filterClass, filterTags)} />
                        </div>
                        <VoteButton buildCode={build.code} initialUpvotes={build.upvotes} initialDownvotes={build.downvotes} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="px-3 py-2 bg-dark-surface border border-border-subtle rounded text-sm text-text-muted hover:text-honor-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Prev</button>
              <span className="text-sm text-text-muted px-3">Page {page} of {pages}</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= pages} className="px-3 py-2 bg-dark-surface border border-border-subtle rounded text-sm text-text-muted hover:text-honor-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
