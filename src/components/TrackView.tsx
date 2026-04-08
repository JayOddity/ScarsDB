'use client';

import { useEffect } from 'react';

export default function TrackView({ itemId }: { itemId: string }) {
  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    }).catch(() => {});
  }, [itemId]);

  return null;
}
