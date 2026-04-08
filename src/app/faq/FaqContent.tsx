import Link from 'next/link';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'Is Scars of Honor free to play?',
        a: 'Yes. Scars of Honor is free to play with no subscription. The in game shop is cosmetic only.',
      },
      {
        q: 'What platform is the game on?',
        a: 'Scars of Honor is PC-first. The development team is focused on delivering the best possible experience on PC before considering other platforms.',
      },
      {
        q: 'When does Scars of Honor come out?',
        a: 'Scars of Honor is expected to release in Early Access around Q1 2027, as per Beastburst CEO Armegon\'s statement on his Twitch channel. The full release date is currently unknown. The next public Technical Alpha runs April 30 to May 11, 2026 on Steam.',
      },
    ],
  },
  {
    category: 'Classes & Races',
    questions: [
      {
        q: 'How many classes are there?',
        a: 'There are 10 classes in Scars of Honor. Rather than using a subclass system, each class has a deep talent tree that lets you define your own role and playstyle. Your build is your identity.',
      },
      {
        q: 'Are there subclasses?',
        a: 'No. Instead of subclasses, Scars of Honor uses a talent tree system where your node choices define your role - tank, healer, damage, or hybrid. This gives you far more flexibility than a rigid subclass structure.',
      },
      {
        q: 'How many races can I choose from?',
        a: 'There are 8 playable races split across 2 factions: the Sacred Order and the Domination. Each faction has 4 races, and your faction choice affects your story, allies, and enemies.',
      },
    ],
  },
  {
    category: 'Progression',
    questions: [
      {
        q: 'What is the Scars system?',
        a: 'Scars are a permanent progression system unique to Scars of Honor. They provide meaningful character customization beyond talent trees, earned through gameplay achievements and milestones. Each Scar shapes your character in a lasting way.',
      },
      {
        q: 'Are there professions?',
        a: 'Yes. The game features both gathering and crafting professions. Gathering professions let you collect resources from the world, while crafting professions turn those materials into powerful gear and consumables.',
      },
    ],
  },
  {
    category: 'Content',
    questions: [
      {
        q: 'What PvE content is available?',
        a: 'PvE includes open world questing, boss encounters, and procedural dungeons. The developers have said dungeons will change between runs so they do not play out the same way every time. Group content is a core focus.',
      },
      {
        q: 'What PvP modes are there?',
        a: 'Confirmed PvP modes include the Mourning Pass 5v5 battleground and Thallan\'s Ring arena with 1v1v1 and 2v2v2 formats. Open world PvP has been discussed but not fully detailed.',
      },
      {
        q: 'How do dungeons work?',
        a: 'Dungeons in Scars of Honor are procedurally generated. The developers have said layouts and encounters will vary between runs so each dungeon feels different.',
      },
    ],
  },
  {
    category: 'Business Model',
    questions: [
      {
        q: 'Is there a subscription fee?',
        a: 'No. There is no subscription fee. The game is free to play and free to download.',
      },
      {
        q: 'What does the in-game shop sell?',
        a: 'The shop sells cosmetic items only - skins, visual effects, and appearance options. Nothing in the shop gives you a gameplay advantage. Your power is earned, never bought.',
      },
    ],
  },
];

export default function FaqContent() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">FAQ</span>
      </nav>

      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">
        Frequently Asked Questions
      </h1>
      <p className="text-text-secondary mb-12 max-w-3xl">
        Everything you need to know about Scars of Honor. Can&apos;t find your answer?
        Join the{' '}
        <a
          href="https://discord.com/invite/jDSuQVgwHF"
          target="_blank"
          rel="noopener noreferrer"
          className="text-honor-gold hover:text-honor-gold-light transition-colors"
        >
          community Discord
        </a>{' '}
        and ask away.
      </p>

      <div className="space-y-10">
        {faqs.map((section) => (
          <section key={section.category}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-honor-gold rotate-45" />
              <h2 className="font-heading text-2xl text-honor-gold">{section.category}</h2>
            </div>
            <div className="space-y-2">
              {section.questions.map((faq, i) => (
                <div key={i} className="bg-card-bg border border-border-subtle rounded-lg overflow-hidden px-5 py-4">
                  <h3 className="text-base text-honor-gold-light font-heading mb-1">{faq.q}</h3>
                  <p className="text-sm text-text-secondary">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="diamond-divider my-12">
        <span className="diamond" />
      </div>
      <div className="text-center">
        <p className="text-text-secondary mb-4">Ready to dive in?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/playtest"
            className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
          >
            Playtest Info
          </Link>
          <Link
            href="/classes"
            className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            Explore Classes
          </Link>
        </div>
      </div>
    </div>
  );
}
