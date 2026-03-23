import Link from 'next/link';

const footerLinks = [
  {
    title: 'Character',
    links: [
      { name: 'Classes', href: '/classes' },
      { name: 'Races & Factions', href: '/races' },
    ],
  },
  {
    title: 'Items',
    links: [
      { name: 'Item Database', href: '/items' },
      { name: 'Professions', href: '/professions' },
      { name: 'Mounts', href: '/mounts' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { name: 'Talent Calculator', href: '/talents' },
      { name: 'Gear Planner', href: '/gear' },
    ],
  },
  {
    title: 'Community',
    links: [
      { name: 'News', href: '/news' },
      { name: 'Articles', href: '/articles' },
      { name: 'Dev Tracker', href: '/tracker' },
      { name: 'Playtest', href: '/playtest' },
      { name: 'Info', href: '/pages' },
    ],
  },
  {
    title: 'External',
    links: [
      { name: 'Official Site', href: 'https://www.scarsofhonor.com/', external: true },
      { name: 'Steam', href: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/', external: true },
      { name: 'Discord', href: 'https://discord.com/invite/jDSuQVgwHF', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-deep-night border-t border-border-subtle mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-heading text-honor-gold text-sm mb-3">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    {'external' in link ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-muted hover:text-honor-gold transition-colors"
                      >
                        {link.name} ↗
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-text-muted hover:text-honor-gold transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-honor-gold rounded flex items-center justify-center text-void-black font-bold text-[10px]">
              SD
            </div>
            <span>ScarsDB — Scars of Honor Fan Site</span>
          </div>
          <p className="text-center">
            This is an independent fan project. Not affiliated with Beast Burst Entertainment.
          </p>
          <p>Scars of Honor &copy; Beast Burst Entertainment</p>
        </div>
      </div>
    </footer>
  );
}
