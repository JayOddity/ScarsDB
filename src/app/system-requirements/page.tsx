import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scars of Honor System Requirements: Can You Run It? | ScarsHQ',
  description: 'Official Scars of Honor minimum specs from Steam: Windows 10, GTX 970 or RX 480, 8 GB RAM, DirectX 11. Plus what you actually need for smooth play in busy hubs.',
  openGraph: {
    title: 'Scars of Honor System Requirements: Minimum PC Specs (2026)',
    description: 'Official minimum specs from Steam: Windows 10, GTX 970 / RX 480, 8 GB RAM, DirectX 11. Recommended specs not yet published.',
    url: '/system-requirements',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Scars of Honor system requirements — minimum PC specs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor System Requirements',
    description: 'Official minimum specs from Steam: Windows 10, GTX 970 / RX 480, 8 GB RAM, DirectX 11.',
  },
  alternates: { canonical: '/system-requirements' },
};

const specs = [
  { label: 'OS', value: 'Windows 10 64-bit', status: 'Required' },
  { label: 'Processor', value: 'Intel I5 4690 / AMD FX 8350 / Snapdragon X Elite', status: 'Required' },
  { label: 'Memory', value: '8 GB RAM', status: 'Required' },
  { label: 'Graphics', value: 'Nvidia GTX 970 / RX 480 / Intel Arc A380 / Qualcomm Adreno X1 (4GB+ of VRAM)', status: 'Required' },
  { label: 'DirectX', value: 'Version 11', status: 'Required' },
];

const statusBoard = [
  { label: 'Minimum Spec', value: 'Published', tone: 'text-emerald-300 border-emerald-400/20 bg-emerald-500/10' },
  { label: 'Recommended Spec', value: 'Not Published', tone: 'text-text-primary border-border-subtle bg-dark-surface/60' },
  { label: 'Official Platform', value: 'Windows PC', tone: 'text-honor-gold border-honor-gold/20 bg-honor-gold/10' },
];

const practicalNotes = [
  {
    title: 'Laptop viability',
    text: 'Meeting the GPU target matters more than simply being on a laptop. Gaming laptops should be fine. Thin integrated-graphics machines are a risk.',
  },
  {
    title: 'SSD reality',
    text: 'The listing does not call out SSD storage, but MMOs benefit from it immediately through faster loading, patching, and zone transitions.',
  },
  {
    title: 'Crowded scenes',
    text: 'Minimum specs are rarely measured around large fights or busy hubs. Expect heavier CPU pressure once more players are on screen.',
  },
];

const supportRows = [
  { platform: 'Windows 10 64-bit', state: 'Supported', detail: 'Current official target.' },
  { platform: 'Windows 11', state: 'Likely Fine', detail: 'Not called out separately, but current PC releases generally run without issue.' },
  { platform: 'Linux / Proton', state: 'Unconfirmed', detail: 'May work through Proton, but there is no official support statement.' },
  { platform: 'macOS', state: 'Unsupported', detail: 'No Mac version has been announced.' },
  { platform: 'Console', state: 'Unavailable', detail: 'No PS5 or Xbox release is confirmed.' },
];

export default function SystemRequirementsPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border-subtle/70">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(200,168,78,0.08)_0%,rgba(200,168,78,0)_28%),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-honor-gold/75 mb-4">Technical Readout</p>
              <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
                System Requirements
              </h1>
              <p className="max-w-3xl text-lg text-text-secondary leading-8 mb-6">
                The official Steam listing now gives Scars of Honor a minimum PC baseline.
                That answers the basic question, but not the whole performance story.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                <span className="rounded-full border border-border-subtle bg-card-bg px-3 py-1.5">Source: Steam</span>
                <span className="rounded-full border border-border-subtle bg-card-bg px-3 py-1.5">Minimum only</span>
                <span className="rounded-full border border-border-subtle bg-card-bg px-3 py-1.5">Windows target</span>
              </div>
            </div>

            <div className="rounded-2xl border border-honor-gold/20 bg-card-bg/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-4">Status Board</p>
              <div className="space-y-3">
                {statusBoard.map((item) => (
                  <div key={item.label} className={`rounded-xl border px-4 py-3 ${item.tone}`}>
                    <p className="text-[11px] uppercase tracking-[0.18em] opacity-80 mb-1">{item.label}</p>
                    <p className="font-heading text-xl">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle bg-dark-surface/50">
              <div>
                <h2 className="font-heading text-2xl text-honor-gold">Minimum Spec Matrix</h2>
                <p className="text-sm text-text-muted mt-1">Official baseline from the current Steam listing.</p>
              </div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-emerald-300 border border-emerald-400/20 bg-emerald-500/10 rounded-full px-3 py-1.5">
                Live
              </span>
            </div>

            <div className="divide-y divide-border-subtle/80">
              {specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`grid md:grid-cols-[160px_1fr_110px] gap-4 px-5 py-4 ${index % 2 === 0 ? 'bg-card-bg' : 'bg-dark-surface/20'}`}
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-1">{spec.label}</p>
                  </div>
                  <div>
                    <p className="text-sm md:text-base text-text-primary leading-7">{spec.value}</p>
                  </div>
                  <div className="md:text-right">
                    <span className="inline-flex rounded-full border border-honor-gold/20 bg-honor-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-honor-gold">
                      {spec.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-card-bg p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-4">Interpretation</p>
            <div className="space-y-4 text-sm text-text-secondary leading-7">
              <p>
                Minimum specs tell you where the game starts, not where it feels best.
                In an MMO, crowded cities, mass PvP, and longer sessions are usually tougher than an empty starting area.
              </p>
              <p>
                There is still no official recommended column, so anyone aiming for higher settings or steadier frame pacing is working from inference rather than a published target.
              </p>
              <p>
                The safest assumption is simple: if you only barely meet minimum, expect compromises.
                If you clear the baseline comfortably, the playtest is a more realistic bet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid md:grid-cols-3 gap-4">
          {practicalNotes.map((note) => (
            <div key={note.title} className="rounded-2xl border border-border-subtle bg-card-bg p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-honor-gold/80 mb-3">{note.title}</p>
              <p className="text-sm text-text-secondary leading-7">{note.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="rounded-2xl border border-honor-gold/20 bg-card-bg p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-4">Source Integrity</p>
            <h2 className="font-heading text-2xl text-honor-gold mb-4">What Is Confirmed</h2>
            <p className="text-sm text-text-secondary leading-7 mb-4">
              This page is grounded in the{' '}
              <a
                href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-honor-gold hover:text-honor-gold-light transition-colors"
              >
                official Steam listing
              </a>
              . Right now that means one thing: minimum PC requirements are public, recommended specs are not.
            </p>
            <p className="text-sm text-text-muted leading-7">
              If BeastBurst adds a recommended column later, this page should split the matrix into baseline and target-performance sections instead of forcing both ideas into one list.
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-card-bg overflow-hidden">
            <div className="px-5 py-4 border-b border-border-subtle bg-dark-surface/40">
              <h2 className="font-heading text-2xl text-text-primary">Support Status</h2>
            </div>
            <div className="divide-y divide-border-subtle/80">
              {supportRows.map((row) => (
                <div key={row.platform} className="grid md:grid-cols-[180px_120px_1fr] gap-4 px-5 py-4">
                  <p className="text-sm font-semibold text-text-primary">{row.platform}</p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-honor-gold">{row.state}</p>
                  <p className="text-sm text-text-secondary leading-7">{row.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-3">Common Questions</p>
              <h2 className="font-heading text-2xl text-honor-gold mb-4">Compatibility Notes</h2>
              <p className="text-sm text-text-secondary leading-7">
                The most common confusion around PC requirements is not the list itself. It is what the list leaves out:
                laptop performance variance, storage expectations, and the difference between launching the game and enjoying it.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xl border border-border-subtle bg-dark-surface/30 p-5">
                <h3 className="text-base font-semibold text-text-primary mb-2">Can I run it on a laptop?</h3>
                <p className="text-sm text-text-secondary leading-7">Yes, if the laptop actually meets the CPU and GPU targets. The word laptop by itself does not tell you much. The hardware tier does.</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-dark-surface/30 p-5">
                <h3 className="text-base font-semibold text-text-primary mb-2">Is an SSD required?</h3>
                <p className="text-sm text-text-secondary leading-7">Not officially, but it is still the sensible setup for an MMO. Even when not required, SSD storage usually improves the experience immediately.</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-dark-surface/30 p-5">
                <h3 className="text-base font-semibold text-text-primary mb-2">What about Mac, Linux, or console?</h3>
                <p className="text-sm text-text-secondary leading-7">Windows is the official target today. For everything else, treat it as unsupported or unconfirmed until BeastBurst says otherwise. You can track broader platform status on <Link href="/mobile" className="text-honor-gold hover:text-honor-gold-light">the mobile and platform page</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl border border-honor-gold/20 bg-[linear-gradient(135deg,rgba(200,168,78,0.10),rgba(200,168,78,0.02)_35%,rgba(20,20,28,0.95)_100%)] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-honor-gold/70 mb-2">Next Step</p>
              <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-2">Check the Listing, Then Test It for Real</h2>
              <p className="text-sm text-text-secondary leading-7 max-w-2xl">
                Minimum specs are useful, but the playtest is the real answer. If your machine clears the baseline, request access and validate performance under actual game conditions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
              >
                Open Steam Page
              </a>
              <Link
                href="/playtest"
                className="inline-flex items-center justify-center px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
              >
                View Playtest Info
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
