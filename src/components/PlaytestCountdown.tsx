import Image from 'next/image';
import Link from 'next/link';

function BgImage() {
  return (
    <>
      <Image
        src="/images/steam-screenshot-1.avif"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
    </>
  );
}

export default function PlaytestCountdown() {
  return (
    <Link href="/playtest" className="block mb-10 group">
      <div className="relative overflow-hidden rounded-xl border border-honor-gold/20 hover:border-honor-gold/40 transition-colors">
        <BgImage />
        <div className="relative px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-honor-gold/70 mb-1">Steam Playtest</p>
            <h2 className="font-heading text-2xl sm:text-3xl text-white">
              Spring 2026 Playtest has wrapped
            </h2>
            <p className="text-sm text-text-muted mt-1">
              The Public Technical Alpha ran April 30 to May 11, 2026. No date set for the next test yet.
            </p>
          </div>
          <span className="flex-shrink-0 inline-flex items-center px-5 py-2.5 rounded-lg bg-honor-gold text-void-black font-heading font-semibold text-sm group-hover:bg-honor-gold-light transition-colors">
            Read the recap
          </span>
        </div>
      </div>
    </Link>
  );
}
