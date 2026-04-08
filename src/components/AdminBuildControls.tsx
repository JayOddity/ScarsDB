'use client';

import { useState, useEffect } from 'react';

interface Props {
  buildCode: string;
  onDeleted?: () => void;
  onVotesReset?: () => void;
}

export default function AdminBuildControls({ buildCode, onDeleted, onVotesReset }: Props) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/user-status')
      .then((r) => r.json())
      .then((data) => { if (data.admin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  if (!isAdmin) return null;

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/builds/${buildCode}/delete`, { method: 'DELETE' });
      if (res.ok) onDeleted?.();
    } catch { /* */ }
    setBusy(false);
    setConfirmDelete(false);
  }

  async function handleResetVotes() {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/builds/${buildCode}/vote`, {
        method: 'DELETE',
      });
      if (res.ok) {
            try {
              const votes = JSON.parse(localStorage.getItem('scarshq-votes') || '{}');
              delete votes[buildCode];
              localStorage.setItem('scarshq-votes', JSON.stringify(votes));
            } catch { /* */ }
            onVotesReset?.();
            // Short delay for Sanity CDN to catch up
            setTimeout(() => window.location.reload(), 1500);
          }
    } catch { /* */ }
    setBusy(false);
    setConfirmReset(false);
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={handleResetVotes}
        disabled={busy}
        className={`px-2 py-1 rounded text-[10px] transition-colors border ${
          confirmReset
            ? 'bg-honor-gold/20 border-honor-gold/50 text-honor-gold'
            : 'bg-dark-surface border-border-subtle text-text-muted hover:text-honor-gold hover:border-honor-gold/30'
        }`}
      >
        {confirmReset ? 'Confirm Reset?' : 'Reset Votes'}
      </button>
      <button
        onClick={handleDelete}
        disabled={busy}
        className={`px-2 py-1 rounded text-[10px] transition-colors border ${
          confirmDelete
            ? 'bg-scar-red/20 border-scar-red/50 text-scar-red-light'
            : 'bg-dark-surface border-border-subtle text-text-muted hover:text-scar-red-light hover:border-scar-red/30'
        }`}
      >
        {confirmDelete ? 'Confirm Delete?' : 'Delete'}
      </button>
    </div>
  );
}
