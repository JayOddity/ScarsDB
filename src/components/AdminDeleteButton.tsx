'use client';

import { useState, useEffect } from 'react';

interface AdminDeleteButtonProps {
  buildCode: string;
  onDeleted?: () => void;
}

export default function AdminDeleteButton({ buildCode, onDeleted }: AdminDeleteButtonProps) {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/user-status')
      .then((r) => r.json())
      .then((data) => { if (data.admin) setIsAdminUser(true); })
      .catch(() => {});
  }, []);

  if (!isAdminUser) return null;

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/builds/${buildCode}/delete`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted?.();
      }
    } catch { /* empty */ }
    setDeleting(false);
    setConfirming(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={`px-3 py-1.5 rounded text-xs transition-colors border ${
        confirming
          ? 'bg-scar-red/20 border-scar-red/50 text-scar-red-light'
          : 'bg-dark-surface border-border-subtle text-text-muted hover:text-scar-red-light hover:border-scar-red/30'
      }`}
    >
      {deleting ? 'Deleting...' : confirming ? 'Confirm Delete?' : 'Delete'}
    </button>
  );
}
