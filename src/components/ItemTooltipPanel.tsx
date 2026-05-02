import Image from 'next/image';
import Link from 'next/link';
import type { Item, StatModification } from '@/lib/api';
import { rarityColorClass } from '@/lib/rarityStyles';

const RARITY_HEX: Record<string, string> = {
  Common: '#9d9d9d',
  Rare: '#4a8ff7',
  Epic: '#a855f7',
  Legendary: '#f59e0b',
};
function rarityHex(r?: string) {
  return RARITY_HEX[r || ''] || '#6b7280';
}

interface Processed { label: string; min: number; max: number; type: string }

function processStatList(mods: StatModification[]): Processed[] {
  const minDmg = mods.find((m) => m.stat === 'Weapon Min Damage');
  const maxDmg = mods.find((m) => m.stat === 'Weapon Max Damage');
  const rest = mods.filter((m) => m.stat !== 'Weapon Min Damage' && m.stat !== 'Weapon Max Damage');
  const out: Processed[] = [];
  if (minDmg && maxDmg) {
    out.push({
      label: 'Damage',
      min: parseFloat(minDmg.modif_min_value) || 0,
      max: parseFloat(maxDmg.modif_max_value) || 0,
      type: 'Damage',
    });
  } else {
    if (minDmg) rest.unshift(minDmg);
    if (maxDmg) rest.unshift(maxDmg);
  }
  for (const mod of rest) {
    out.push({
      label: mod.stat,
      min: parseFloat(mod.modif_min_value) || 0,
      max: parseFloat(mod.modif_max_value) || 0,
      type: mod.modif_type,
    });
  }
  return out;
}

function formatRange(stat: Processed): string {
  const isPercent = stat.type === 'Percentage' || stat.type === 'Percent';
  const pct = isPercent ? '%' : '';
  const round = (n: number) => Number.isInteger(n) ? n : Math.round(n * 100) / 100;
  if (stat.min === stat.max) return `${round(stat.min)}${pct}`;
  return `${round(stat.min)}-${round(stat.max)}${pct}`;
}

interface ItemTooltipPanelProps {
  item: Item;
  /** When true, the item name is a link to the detail page and a "Click item to view full page" hint is shown. Defaults to true (hover-card behaviour). */
  linkable?: boolean;
  /** "sm" matches the in-game cursor tooltip (used on hover). "lg" is ~25% larger and used on the dedicated item page. */
  size?: 'sm' | 'lg';
}

export default function ItemTooltipPanel({ item, linkable = true, size = 'sm' }: ItemTooltipPanelProps) {
  const lists = item.stat_configuration?.lists || [];
  const allStats: Processed[] = lists.flatMap((l) => processStatList(l.modifications));
  const damage = allStats.find((s) => s.label === 'Damage');
  const otherStats = allStats.filter((s) => s.label !== 'Damage');
  const hex = rarityHex(item.rarity);

  const isLg = size === 'lg';
  const nameSizeClass = isLg ? 'text-2xl' : 'text-xl';
  const typeSizeClass = isLg ? 'text-base' : 'text-sm';
  const iconBoxClass = isLg ? 'w-[72px] h-[72px]' : 'w-14 h-14';
  const iconImgPx = isLg ? 60 : 48;
  const headerPad = isLg ? 'px-5 py-4' : 'px-4 py-3';
  const statsPad = isLg ? 'px-5 py-4' : 'px-4 py-3';
  const damageSizeClass = isLg ? 'text-base' : 'text-sm';
  const statRowSizeClass = isLg ? 'text-base' : 'text-sm';
  const statRowPadClass = isLg ? 'py-2' : 'py-1.5';
  const footerSizeClass = isLg ? 'text-sm' : 'text-xs';
  const coinPx = isLg ? 18 : 14;

  const nameInner = (
    <span
      className={`font-heading italic ${nameSizeClass} leading-tight ${rarityColorClass[item.rarity]}`}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
    >
      {item.name}
    </span>
  );

  return (
    <div
      className="detail-panel-enter overflow-hidden"
      style={{
        border: '1px solid #c8a84e',
        borderRadius: '3px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header section: lighter grey, faint rarity tint. Name + type on the left,
          circular icon on the right, then the headline Damage line below to match
          the in-game tooltip layout. */}
      <div className="relative" style={{ backgroundColor: '#26262b' }}>
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-full pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${hex}33 0%, ${hex}10 35%, transparent 75%)` }}
        />
        <div className={`relative ${headerPad}`}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              {linkable ? (
                <Link href={item.slug ? `/database/${item.slug}` : `/items/${item.id}`} className="hover:underline block">
                  {nameInner}
                </Link>
              ) : (
                <div>{nameInner}</div>
              )}
              {item.type && (
                <div className={`${typeSizeClass} text-text-secondary mt-0.5`}>{item.type}</div>
              )}
            </div>
            {/* Circular icon with gold-bracket frame */}
            <div
              className={`relative ${iconBoxClass} flex-shrink-0 flex items-center justify-center`}
              style={{
                backgroundImage: 'url(/Icons/UI/tooltip-item-icon-bg.png)',
                backgroundSize: '100% 100%',
              }}
            >
              {item.icon && !item.icon.includes('placehold') ? (
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={iconImgPx}
                  height={iconImgPx}
                  className="object-cover rounded-full"
                  style={{ width: '64%', height: '64%' }}
                />
              ) : (
                <span className="text-text-muted">?</span>
              )}
            </div>
          </div>
          {damage && (
            <div className={`${damageSizeClass} font-semibold mt-3`} style={{ color: '#7ac74c' }}>
              Damage {formatRange(damage)}
            </div>
          )}
        </div>
      </div>

      {/* Stats section: darker grey. Damage already lives in the header above. */}
      <div className={`relative ${statsPad}`} style={{ backgroundColor: '#16161a' }}>
        {otherStats.length > 0 && (
          <ul className={statRowSizeClass}>
            {otherStats.map((stat, i) => (
              <li
                key={i}
                className={`flex items-center justify-between ${statRowPadClass}`}
                style={i > 0 ? {
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                } : undefined}
              >
                <span className="text-text-secondary">{stat.label}</span>
                <span className="text-text-primary tabular-nums">{formatRange(stat)}</span>
              </li>
            ))}
          </ul>
        )}

        {(item.sell_value > 0 || item.stack_size > 1) && (
          <div
            className={`mt-2 pt-2 flex items-center gap-3 ${footerSizeClass} text-text-muted`}
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {item.sell_value > 0 && (
              <span className="flex items-center gap-1.5">
                Buying Price:
                <Image src="/Icons/UI/tooltip-coin.png" alt="" width={coinPx} height={coinPx} className="inline-block" />
                <span className="text-text-secondary tabular-nums">{item.sell_value}</span>
              </span>
            )}
            {item.stack_size > 1 && (
              <span className="ml-auto">Stack: <span className="text-text-secondary">{item.stack_size}</span></span>
            )}
          </div>
        )}

        {linkable && (
          <p className="mt-2 text-center text-[10px] text-text-muted/70">Click item to view full page</p>
        )}
      </div>
    </div>
  );
}
