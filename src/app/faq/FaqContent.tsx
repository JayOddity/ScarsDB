import Link from 'next/link';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'Is Scars of Honor free to play?',
        a: 'Yes. Free to play, no subscription. The shop is cosmetic only.',
      },
      {
        q: 'What platform is the game on?',
        a: 'PC only for now. The team has said they want to get PC right first before looking at anything else.',
      },
      {
        q: 'When does Scars of Honor come out?',
        a: 'Early Access is expected around Q1 2027 based on what Beastburst CEO Armegon has said on stream. No confirmed full release date yet. The next Technical Alpha runs April 30 to May 11, 2026 on Steam.',
      },
    ],
  },
  {
    category: 'Classes & Races',
    questions: [
      {
        q: 'How many classes are there?',
        a: '10 classes. There are no subclasses. Instead, each class has a talent tree with 240+ nodes and three paths you can spend points in however you want.',
      },
      {
        q: 'Are there subclasses?',
        a: 'No. The talent tree replaces subclasses. You pick your nodes and that determines your role. You can go full tank, full healer, full damage, or mix across paths for a hybrid.',
      },
      {
        q: 'How many races can I choose from?',
        a: '8 races across 2 factions (Sacred Order and Domination, 4 races each). Your race locks your faction and limits which classes you can play.',
      },
    ],
  },
  {
    category: 'Progression',
    questions: [
      {
        q: 'What is the Scars system?',
        a: 'Scars are permanent character modifications you earn through gameplay. They cannot be respecced. Think of them as a layer on top of your talent build that makes your character different from someone running the same class and gear.',
      },
      {
        q: 'Are there professions?',
        a: 'Yes. There are gathering professions (mining, herbalism, woodcutting, fishing) and crafting professions (blacksmithing, cooking, alchemy, enchanting). Gathering feeds into crafting.',
      },
    ],
  },
  {
    category: 'Content',
    questions: [
      {
        q: 'What PvE content is available?',
        a: 'Open world questing, boss encounters, and procedural dungeons. The devs have said dungeon layouts change between runs so you are not just memorising the same route every time.',
      },
      {
        q: 'What PvP modes are there?',
        a: 'Mourning Pass (5v5 battleground) and Thallan\'s Ring (arena with 1v1v1 and 2v2v2). Open world PvP has been mentioned but not fully detailed yet.',
      },
      {
        q: 'How do dungeons work?',
        a: 'They are procedurally generated. Layouts and encounters change between runs. The devs want each dungeon run to feel different.',
      },
    ],
  },
  {
    category: 'Business Model',
    questions: [
      {
        q: 'Is there a subscription fee?',
        a: 'No. Free to play, free to download, no sub.',
      },
      {
        q: 'What does the in game shop sell?',
        a: 'Cosmetics only. Skins, visual effects, appearance stuff. No gameplay advantages, no pay to win.',
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
        Quick answers about Scars of Honor. If something isn&apos;t covered here, ask in the{' '}
        <a
          href="https://discord.com/invite/jDSuQVgwHF"
          target="_blank"
          rel="noopener noreferrer"
          className="text-honor-gold hover:text-honor-gold-light transition-colors"
        >
          community Discord
        </a>.
      </p>

      <div className="space-y-10">
        {faqs.map((section) => (
          <section key={section.category}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 gem-bullet" />
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
        <p className="text-text-secondary mb-4">Want to try it?</p>
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
