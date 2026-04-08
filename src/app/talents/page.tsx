'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TalentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let lastClass = 'warrior';
    try { const saved = localStorage.getItem('scarshq-last-class'); if (saved) lastClass = saved; } catch {}
    const tab = searchParams.get('tab');
    const params = new URLSearchParams({ pick: 'true' });
    if (tab) params.set('tab', tab);
    router.replace(`/talents/${lastClass}?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}
