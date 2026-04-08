import Link from 'next/link';

const quickFacts = [
  { label: 'Platform', value: 'PC via Steam' },
  { label: 'Price', value: 'Free to Play' },
  { label: 'Status', value: 'Pre release playtest phase' },
  { label: 'Next Access', value: 'April 30 - May 11, 2026' },
];

const steps = [
  {
    step: 1,
    title: 'Get Steam',
    description: 'Scars of Honor is available through Steam. Install the Steam client first if it is not already on your PC.',
    link: 'https://store.steampowered.com/about/',
    linkText: 'Download Steam',
    external: true,
  },
  {
    step: 2,
    title: 'Request Playtest Access',
    description: 'Go to the Steam page and click "Request Access" to sign up for the playtest. Access is not guaranteed — spots may be limited.',
    link: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
    linkText: 'Steam Store Page',
    external: true,
  },
  {
    step: 3,
    title: 'Play During Playtests',
    description: 'The game is not permanently available yet. It opens for download on Steam during official playtest windows.',
    link: '/playtest',
    linkText: 'Playtest Info',
    external: false,
  },
  {
    step: 4,
    title: 'Join the Community',
    description: 'Join the Discord for news, group finding, and build sharing while you wait for the next playtest.',
    link: '/community',
    linkText: 'Community Hub',
    external: false,
  },
];

const faqs = [
  {
    question: 'Can I download Scars of Honor right now?',
    answer:
      'Not yet as a permanent download. The game opens for download during playtest windows on Steam. The next one is April 30 to May 11, 2026.',
  },
  {
    question: 'Do I need a key to play?',
    answer:
      'No key needed, but access is not automatic. You need to request access on the Steam page. Not everyone who requests may get in.',
  },
  {
    question: 'Is Scars of Honor free to play?',
    answer:
      'Yes. No box price, no subscription. The store sells cosmetics only.',
  },
  {
    question: 'Where do I check the next playable dates?',
    answer:
      'Check our playtest page for the current schedule, access details, and what content is available during each test.',
  },
];

export default function DownloadContent() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pt-16 pb-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,168,78,0.16),_transparent_36%),linear-gradient(180deg,rgba(18,18,26,0.55)_0%,rgba(10,10,15,1)_72%)]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-honor-gold/20 bg-honor-gold/10 px-4 py-1 text-[11px] uppercase tracking-[0.22em] text-honor-gold mb-6">
            Steam Access Guide
          </div>
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
            Download Scars of Honor
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-4">
            Scars of Honor is a free to play MMORPG available on Steam.
          </p>
          <p className="text-text-muted max-w-2xl mx-auto mb-6 leading-8">
            The game is currently in pre release testing. Request access on the Steam page
            to sign up for the next playtest.
          </p>
          <a
            href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-honor-gold text-void-black font-heading font-semibold text-lg rounded-lg hover:bg-honor-gold-light transition-colors"
          >
            Wishlist on Steam
          </a>
          <p className="text-text-muted text-sm mt-4">
            Next playtest: April 30 to May 11, 2026.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickFacts.map((fact) => (
            <div key={fact.label} className="bg-card-bg border border-border-subtle rounded-xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted mb-2">
                {fact.label}
              </h2>
              <p className="font-heading text-lg text-text-primary">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-3">How to Play</h2>
        <p className="text-sm text-text-muted text-center max-w-2xl mx-auto mb-10">
          Four steps to get in and start playing.
        </p>
        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-honor-gold/10 text-honor-gold rounded-full flex items-center justify-center text-lg font-bold">
                  {s.step}
                </div>
              </div>
              <div className="flex-1 bg-card-bg border border-border-subtle rounded-lg p-5">
                <h3 className="font-heading text-lg text-text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-text-secondary mb-3">{s.description}</p>
                {s.external ? (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-honor-gold hover:text-honor-gold-light transition-colors">
                    {s.linkText} &rarr;
                  </a>
                ) : (
                  <Link href={s.link} className="text-xs text-honor-gold hover:text-honor-gold-light transition-colors">
                    {s.linkText} &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8">
            <h2 className="font-heading text-2xl text-honor-gold mb-4">Availability Right Now</h2>
            <p className="text-text-secondary leading-8 mb-4">
              Scars of Honor is not in full release yet. The game opens for download on Steam
              during official playtest windows. The next one runs April 30 to May 11, 2026.
            </p>
            <p className="text-text-muted leading-8 mb-6">
              Request access on the Steam page to sign up. If you are accepted, the download
              button will appear on the store page when the playtest goes live.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/playtest"
                className="inline-flex items-center justify-center px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
              >
                View Playtest Dates
              </Link>
              <Link
                href="/free-to-play"
                className="inline-flex items-center justify-center px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
              >
                Free to Play Details
              </Link>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-2xl text-honor-gold mb-4">Download FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-card-bg border border-border-subtle rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">{faq.question}</h3>
                  <p className="text-sm text-text-secondary leading-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="bg-card-bg border border-honor-gold/20 rounded-2xl p-8 md:p-10">
          <h2 className="font-heading text-2xl text-honor-gold mb-3">Ready to Get In?</h2>
          <p className="text-text-muted max-w-2xl mx-auto mb-6 leading-7">
            Request access on the Steam page to sign up for the next playtest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
            >
              Wishlist on Steam
            </a>
            <Link
              href="/playtest"
              className="inline-flex items-center justify-center px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
            >
              See Playtest Info
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
