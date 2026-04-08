'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TalentsPage() {
  const router = useRouter();

  useEffect(() => {
    let lastClass = 'warrior';
    try { const saved = localStorage.getItem('scarshq-last-class'); if (saved) lastClass = saved; } catch {}
    router.replace(`/talents/${lastClass}?pick=true`);
  }, [router]);

  return null;
}
