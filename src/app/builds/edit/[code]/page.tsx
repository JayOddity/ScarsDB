'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkProfanity } from '@/lib/profanityClient';
import { classes } from '@/data/classes';
import { use } from 'react';

const classMap = new Map(classes.map((c) => [c.slug, c]));

interface Build {
  code: string;
  classSlug: string;
  allocation: string;
  equipment?: string;
  name: string;
  tags?: string[];
  description?: string;
  guide?: string;
  patch?: string;
  totalPoints: number;
  authorName?: string;
}

export default function EditBuildPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [guide, setGuide] = useState('');
  const [profanityWarning, setProfanityWarning] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/builds/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.code) {
          setBuild(data);
          setName(data.name || '');
          setTags(data.tags || []);
          setDescription(data.description || '');
          setGuide(data.guide || '');
        } else {
          setError('Build not found.');
        }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load build.'); setLoading(false); });
  }, [code]);

  function checkAllProfanity(n: string, d: string, g: string) {
    setProfanityWarning(checkProfanity(n) || checkProfanity(d) || checkProfanity(g));
  }

  async function handleSave() {
    if (profanityWarning || saving) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/builds/${encodeURIComponent(code)}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          tags,
          description: description.trim(),
          guide: guide.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to save.');
      }
    } catch {
      setError('Network error.');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-surface rounded w-1/3" />
          <div className="h-4 bg-dark-surface rounded w-2/3" />
          <div className="h-40 bg-dark-surface rounded" />
        </div>
      </div>
    );
  }

  if (error && !build) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-scar-red-light text-lg mb-4">{error}</p>
        <Link href="/builds" className="text-honor-gold hover:text-honor-gold-light">Back to Builds</Link>
      </div>
    );
  }

  // No login check — cookie-based ownership works for anonymous users too

  const cls = build ? classMap.get(build.classSlug) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/builds" className="hover:text-honor-gold transition-colors">Builds</Link>
        <span className="mx-2">/</span>
        <Link href={`/builds/view/${code}`} className="hover:text-honor-gold transition-colors">{build?.name || code}</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">Edit</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        {cls && <img src={cls.icon} alt={cls.name} className="w-12 h-12" />}
        <div>
          <h1 className="font-heading text-2xl text-honor-gold">Edit Build</h1>
          <p className="text-sm text-text-muted">{cls?.name} &middot; {build?.totalPoints} pts &middot; {code}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-xs text-text-muted block mb-1">Build Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); checkAllProfanity(e.target.value, description, guide); }}
            maxLength={50}
            className={`w-full bg-dark-surface border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${checkProfanity(name) ? 'border-scar-red/50' : 'border-border-subtle focus:border-honor-gold-dim'}`}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-text-muted block mb-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {(['pvp', 'pve', 'leveling', 'beginner'] as const).map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags((prev) => active ? prev.filter((t) => t !== tag) : [...prev, tag])}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors border ${
                    active
                      ? 'bg-honor-gold/15 border-honor-gold text-honor-gold'
                      : 'bg-dark-surface border-border-subtle text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {tag === 'pvp' ? 'PvP' : tag === 'pve' ? 'PvE' : tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-text-muted block mb-1">Short Description</label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); checkAllProfanity(name, e.target.value, guide); }}
            maxLength={500}
            rows={3}
            placeholder="Brief summary shown in build lists..."
            className={`w-full bg-dark-surface border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none ${checkProfanity(description) ? 'border-scar-red/50' : 'border-border-subtle focus:border-honor-gold-dim'}`}
          />
          <div className="text-right text-[10px] text-text-muted">{description.length}/500</div>
        </div>

        {/* Guide */}
        <div>
          <label className="text-xs text-text-muted block mb-1">Full Guide <span className="text-text-muted/50">(Markdown supported)</span></label>
          <textarea
            value={guide}
            onChange={(e) => { setGuide(e.target.value); checkAllProfanity(name, description, e.target.value); }}
            rows={20}
            placeholder={"# Build Guide\n\n## Overview\nDescribe what this build does...\n\n## Talent Priority\n1. First pick...\n\n## Gear Recommendations\n- Helmet: ...\n\n## Playstyle Tips\n- In PvP..."}
            className={`w-full bg-dark-surface border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none resize-y font-mono leading-relaxed ${checkProfanity(guide) ? 'border-scar-red/50' : 'border-border-subtle focus:border-honor-gold-dim'}`}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-text-muted">Markdown: # headings, **bold**, *italic*, - lists</span>
            <span className="text-[10px] text-text-muted">{guide.length.toLocaleString()} chars</span>
          </div>
        </div>

        {/* Warnings / Errors */}
        {profanityWarning && (
          <div className="bg-scar-red/10 border border-scar-red/30 rounded p-3 flex items-start gap-2">
            <span className="text-scar-red text-sm mt-px">&#9888;</span>
            <p className="text-xs text-scar-red-light">{profanityWarning}</p>
          </div>
        )}
        {error && <p className="text-xs text-scar-red">{error}</p>}
        {success && <p className="text-xs text-green-400">Build updated successfully!</p>}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !!profanityWarning}
            className="px-6 py-2.5 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/builds/view/${code}`}
            className="px-6 py-2.5 border border-border-subtle text-text-secondary rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors text-sm"
          >
            Cancel
          </Link>
          <Link
            href={`/talents/${build?.classSlug}?build=${code}`}
            className="px-4 py-2.5 text-xs text-text-muted hover:text-honor-gold transition-colors ml-auto"
          >
            Edit Talents in Calculator
          </Link>
        </div>

        <p className="text-[10px] text-text-muted">
          To update talents or equipment, open the build in the Talent Calculator, make your changes, and save again with the same name.
        </p>
      </div>
    </div>
  );
}
