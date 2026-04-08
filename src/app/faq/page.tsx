import { Metadata } from 'next';
import FaqContent from './FaqContent';

export const metadata: Metadata = {
  title: 'FAQ - ScarsHQ',
  description: 'Frequently asked questions about Scars of Honor - free to play, classes, races, PvP, PvE, and more.',
  alternates: {
    canonical: '/faq',
  },
};

const faqItems = [
  { q: 'Is Scars of Honor free to play?', a: 'Yes. Free to play, no subscription. The shop is cosmetic only.' },
  { q: 'What platform is the game on?', a: 'PC only for now. The team has said they want to get PC right first before looking at anything else.' },
  { q: 'When does Scars of Honor come out?', a: 'Early Access is expected around Q1 2027 based on what Beastburst CEO Armegon has said on stream. No confirmed full release date yet. The next Technical Alpha runs April 30 to May 11, 2026 on Steam.' },
  { q: 'How many classes are there?', a: '10 classes. There are no subclasses. Instead, each class has a talent tree with 240+ nodes and three paths you can spend points in however you want.' },
  { q: 'Are there subclasses?', a: 'No. The talent tree replaces subclasses. You pick your nodes and that determines your role.' },
  { q: 'How many races can I choose from?', a: '8 races across 2 factions (Sacred Order and Domination, 4 races each). Your race locks your faction and limits which classes you can play.' },
  { q: 'What is the Scars system?', a: 'Scars are permanent character modifications you earn through gameplay. They cannot be respecced.' },
  { q: 'Is there a subscription fee?', a: 'No. Free to play, free to download, no sub.' },
  { q: 'What does the in game shop sell?', a: 'Cosmetics only. Skins, visual effects, appearance stuff. No gameplay advantages, no pay to win.' },
];

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          }),
        }}
      />
      <FaqContent />
    </>
  );
}
