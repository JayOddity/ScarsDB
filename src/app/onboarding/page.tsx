'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const existing = (session?.user as unknown as Record<string, string | null> | undefined)?.displayName || null;
  const returnTo = searchParams.get('returnTo') || '/builds';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/onboarding?returnTo=${returnTo}`)}`);
    }
  }, [status, router, returnTo]);

  useEffect(() => {
    if (existing) router.replace(returnTo);
  }, [existing, router, returnTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/user/display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }
      await update();
      router.replace(returnTo);
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-text-muted">Loading…</div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-heading text-3xl text-honor-gold mb-3">Pick a display name</h1>
      <p className="text-text-secondary mb-6">
        This is the name shown on your public builds and votes. We never show your real name from
        Google or Discord.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-heading text-text-secondary mb-2">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_\-]{3,20}"
            placeholder="e.g. Stormbreaker_42"
            className="w-full px-4 py-3 rounded-lg bg-dark-surface border border-border-subtle text-text-primary focus:outline-none focus:border-honor-gold"
          />
          <p className="text-xs text-text-muted mt-2">
            3 to 20 characters. Letters, numbers, underscore, or hyphen. No profanity.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-scar-red/30 bg-scar-red/10 text-sm text-scar-red-light">
            {error}
          </div>
        )}

        <div className="p-3 rounded-lg border border-honor-gold/20 bg-honor-gold/5 text-xs text-text-muted">
          Heads up: this cannot be changed later without contacting support. Pick carefully.
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || value.trim().length < 3}
            className="px-6 py-3 bg-honor-gold text-void-black font-heading rounded-lg hover:bg-honor-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : 'Save name'}
          </button>
          <Link href="/" className="text-sm text-text-muted hover:text-honor-gold transition-colors">
            Skip for now
          </Link>
        </div>
      </form>
    </div>
  );
}
