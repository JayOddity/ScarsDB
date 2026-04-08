'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TalentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    const skipClassPicker = tab === 'Equipment' || tab === 'Scars';
    let lastClass = skipClassPicker ? 'paladin' : 'warrior';
    if (!skipClassPicker) {
      try { const saved = localStorage.getItem('scarshq-last-class'); if (saved) lastClass = saved; } catch {}
    }
    const params = new URLSearchParams();
    if (!skipClassPicker) params.set('pick', 'true');
    if (tab) params.set('tab', tab);
    router.replace(`/talents/${lastClass}?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}
