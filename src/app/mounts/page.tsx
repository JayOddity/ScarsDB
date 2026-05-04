import Link from 'next/link';

export const metadata = {
  title: 'Mounts - ScarsHQ',
  description: 'Mounts in Scars of Honor. Ground mounts only — no flying mounts in the game.',
  alternates: { canonical: '/mounts' },
};

export default function MountsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-3 h-3 gem-bullet" />
        <p className="text-xs uppercase tracking-[0.22em] text-honor-gold">Mounts</p>
      </div>
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Mounts</h1>
      <p className="text-text-secondary leading-8 mb-8 max-w-3xl">
        Scars of Honor has ground mounts only — there are no flying mounts in the game. Beyond
        that, specific mount names, speeds, and how you get them have not been confirmed yet.
      </p>

      <div className="rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8 mb-8">
        <h2 className="font-heading text-xl text-honor-gold mb-3">What we know so far</h2>
        <ul className="space-y-3 text-text-secondary text-sm leading-7">
          <li className="flex items-start gap-3">
            <div className="mt-2 h-2 w-2 rounded-full bg-honor-gold shrink-0" />
            <span>Ground mounts only. The developers have confirmed there will be no flying mounts.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-2 h-2 w-2 rounded-full bg-honor-gold shrink-0" />
            <span>Mounts increase your movement speed when travelling the open world.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-2 h-2 w-2 rounded-full bg-honor-gold shrink-0" />
            <span>More details on specific mounts, speeds, and acquisition methods are expected as development continues.</span>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-honor-gold/20 bg-card-bg px-6 py-8 text-center">
        <p className="text-text-muted mb-4">This page will be updated as more mount information is confirmed.</p>
        <Link
          href="/gameplay"
          className="text-sm text-honor-gold hover:text-honor-gold-light transition-colors"
        >
          Back to gameplay overview &rarr;
        </Link>
      </div>
    </div>
  );
}
