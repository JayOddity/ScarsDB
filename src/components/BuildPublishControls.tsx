'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface Props {
  buildCode: string;
  authorRef?: string;
  initialIsPublic: boolean;
}

function getOwnedBuilds(): string[] {
  try {
    const cookie = document.cookie.split('; ').find((c) => c.startsWith('scarshq-owned-builds='));
    if (!cookie) return [];
    return decodeURIComponent(cookie.split('=')[1]).split(',');
  } catch {
    return [];
  }
}

export default function BuildPublishControls({ buildCode, authorRef, initialIsPublic }: Props) {
  const { data: session } = useSession();
  const [canPublish, setCanPublish] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;
    if (!userId) { setCanPublish(false); return; }
    const ownsByAuth = userId === authorRef;
    const ownsByCookie = !authorRef && getOwnedBuilds().includes(buildCode);
    setCanPublish(ownsByAuth || ownsByCookie);
  }, [session, authorRef, buildCode]);

  if (!canPublish) return null;

  async function toggle(publish: boolean) {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/builds/${encodeURIComponent(buildCode)}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsPublic(!!data.isPublic);
      } else {
        if (data.code === 'NEED_DISPLAY_NAME') {
          window.location.href = `/onboarding?returnTo=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        setError(data.error || 'Failed to update');
      }
    } catch {
      setError('Network error');
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {isPublic ? (
        <button
          onClick={() => toggle(false)}
          disabled={busy}
          className="px-4 py-2 border border-border-subtle text-text-secondary rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors text-sm disabled:opacity-50"
        >
          {busy ? 'Working...' : 'Unpublish'}
        </button>
      ) : (
        <button
          onClick={() => toggle(true)}
          disabled={busy}
          className="px-4 py-2 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors text-sm disabled:opacity-50"
        >
          {busy ? 'Publishing...' : 'Publish to Community'}
        </button>
      )}
      {error && <span className="text-xs text-scar-red-light">{error}</span>}
    </div>
  );
}
