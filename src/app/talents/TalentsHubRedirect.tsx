'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Redirects human visitors to /talents/[lastClass]. Search engines don't
// execute this — they index the server-rendered landing content alongside.
export default function TalentsHubRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    // Default to Mage — it's one of the four classes with real datamined data,
    // so first-time visitors land on a populated tree instead of an empty stub.
    let lastClass = 'mage';
    try {
      const saved = localStorage.getItem('scarshq-last-class');
      if (saved) lastClass = saved;
    } catch {}
    const qs = tab ? `?tab=${encodeURIComponent(tab)}` : '';
    router.replace(`/talents/${lastClass}${qs}`);
  }, [router, searchParams]);

  return null;
}
