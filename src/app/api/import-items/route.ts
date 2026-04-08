import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';

const API_BASE = process.env.BEASTBURST_API_URL || 'https://developers.beastburst.com/api/community';
const API_TOKEN = process.env.BEASTBURST_API_TOKEN || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

async function fetchPage(page: number) {
  const res = await fetch(`${API_BASE}/items?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'X-API-Version': '2.0.0',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`API error page ${page}: ${res.status}`);
  return res.json();
}

interface BeastBurstItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  icon: string;
  slot_type: string;
  stack_size: number;
  is_destructible: boolean;
  sell_value: number;
  stat_configuration?: {
    lists?: Array<{
      modifications?: Array<{
        stat: string;
        modif_type: string;
        modif_weight: number;
        modif_min_value: string;
        modif_max_value: string;
      }>;
    }>;
  };
}

function mapItem(item: BeastBurstItem) {
  const doc: { _id: string; _type: string; [key: string]: unknown } = {
    _type: 'item',
    _id: 'item-' + item.id,
    name: item.name,
    itemType: item.type,
    rarity: item.rarity,
    icon: item.icon,
    slotType: item.slot_type,
    stackSize: item.stack_size,
    isDestructible: item.is_destructible,
    sellValue: item.sell_value,
    externalId: item.id,
  };

  const mods = item.stat_configuration?.lists?.[0]?.modifications;
  if (mods?.length) {
    doc.stats = mods.map((mod) => ({
      _type: 'itemStat',
      _key: mod.stat || String(Math.random()).slice(2, 10),
      stat: mod.stat,
      modifType: mod.modif_type,
      modifWeight: mod.modif_weight,
      minValue: mod.modif_min_value,
      maxValue: mod.modif_max_value,
    }));
  }

  return doc;
}

export async function GET(request: NextRequest) {
  // Auth check - Vercel cron sends this header, manual calls use query param
  const authHeader = request.headers.get('authorization');
  const querySecret = request.nextUrl.searchParams.get('secret');
  const validAuth = authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET;

  if (!validAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all items from BeastBurst
    const firstPage = await fetchPage(1);
    const lastPage = firstPage.meta.last_page;
    let allItems: BeastBurstItem[] = [...firstPage.data.items];

    for (let page = 2; page <= lastPage; page++) {
      const data = await fetchPage(page);
      allItems = allItems.concat(data.data.items);
    }

    // Write to Sanity in batches
    const docs = allItems.map(mapItem);
    const BATCH_SIZE = 20;
    let written = 0;

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      let tx = sanityWriteClient.transaction();
      for (const doc of batch) {
        tx = tx.createOrReplace(doc);
      }
      await tx.commit();
      written += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${written} items from ${lastPage} pages`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Import failed', details: String(error) },
      { status: 500 }
    );
  }
}
