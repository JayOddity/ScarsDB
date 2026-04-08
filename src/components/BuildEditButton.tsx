'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface BuildEditButtonProps {
  buildCode: string;
  authorRef?: string;
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

export default function BuildEditButton({ buildCode, authorRef }: BuildEditButtonProps) {
  const { data: session } = useSession();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const userId = (session?.user as unknown as Record<string, string> | undefined)?.sanityUserId;
    const ownsByAuth = userId && userId === authorRef;
    const ownsByCookie = getOwnedBuilds().includes(buildCode);
    setCanEdit(!!ownsByAuth || ownsByCookie);
  }, [session, authorRef, buildCode]);

  if (!canEdit) return null;

  return (
    <Link
      href={`/builds/edit/${buildCode}`}
      className="px-4 py-2 border border-border-subtle text-text-secondary rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors text-sm text-center"
    >
      Edit Build
    </Link>
  );
}
