import Link from 'next/link';

interface FooterProps {
  siteName: string;
  siteAbbrev: string;
  socials?: {
    discord?: string;
    twitter?: string;
    youtube?: string;
  };
}

const footerLinks = [
  {
    title: 'Database',
    links: [
      { name: 'All Items', href: '/items' },
      { name: 'NPCs & Bestiary', href: '/npcs' },
      { name: 'Skills', href: '/skills' },
      { name: 'Maps & Zones', href: '/map' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { name: 'Articles', href: '/articles' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Creators', href: '/creators' },
    ],
  },
  {
    title: 'Character',
    links: [
      { name: 'Classes', href: '/classes' },
      { name: 'Races & Factions', href: '/races' },
      { name: 'Talent Calculator', href: '/talents' },
      { name: 'Scars System', href: '/scars' },
      { name: 'Gear Planner', href: '/gear' },
      { name: 'Professions', href: '/professions' },
    ],
  },
  {
    title: 'World',
    links: [
      { name: 'PvE Content', href: '/pve' },
      { name: 'PvP Content', href: '/pvp' },
      { name: 'Playtest', href: '/playtest' },
      { name: 'Mounts', href: '/mounts' },
      { name: 'Cosmetics', href: '/cosmetics' },
    ],
  },
];

export default function Footer({ siteName, siteAbbrev, socials }: FooterProps) {
  const externalLinks = [
    ...(socials?.discord ? [{ name: 'Discord', href: socials.discord, external: true as const }] : []),
    ...(socials?.twitter ? [{ name: 'Twitter/X', href: socials.twitter, external: true as const }] : []),
    ...(socials?.youtube ? [{ name: 'YouTube', href: socials.youtube, external: true as const }] : []),
  ];

  const allGroups = [
    ...footerLinks,
    ...(externalLinks.length > 0 ? [{ title: 'External', links: externalLinks }] : []),
  ];

  return (
    <footer className="bg-deep-night border-t border-border-subtle mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {allGroups.map((group) => (
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
              {siteAbbrev}
            </div>
            <span>{siteName} - Fan Site</span>
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
