const API_URL = process.env.BEASTBURST_API_URL || 'https://developers.beastburst.com/api/community';
const API_TOKEN = process.env.BEASTBURST_API_TOKEN || '';

interface ApiResponse<T> {
  success: boolean;
  messages: string[];
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  first_page_url: string;
  prev_page_url: string | null;
  next_page_url: string | null;
  path: string;
}

export interface StatModification {
  stat: string;
  modif_weight: number;
  modif_type: string;
  modif_min_value: string;
  modif_max_value: string;
  created_at: string;
  updated_at: string;
}

export interface StatList {
  min_stat_count: number;
  max_stat_count: number;
  modifications: StatModification[];
}

export interface StatConfiguration {
  lists: StatList[];
}

export interface Item {
  id: string;
  name: string;
  description_key: number | null;
  type: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  stack_size: number;
  is_destructible: boolean;
  sell_value: number;
  icon: string;
  slot_type: string;
  created_at: string;
  updated_at: string;
  sets: unknown[];
  stat_configuration: StatConfiguration | null;
}

async function apiFetch<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-Version': '2.0.0',
    },
    next: { revalidate: 300 }, // cache for 5 minutes
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getItems(page: number = 1): Promise<{ items: Item[]; meta: PaginationMeta }> {
  const res = await apiFetch<{ items: Item[] }>('/items', { page: String(page) });
  return { items: res.data.items, meta: res.meta! };
}

export async function getItem(id: string): Promise<Item> {
  const res = await apiFetch<{ item: Item }>(`/items/${id}`);
  return res.data.item;
}

export async function getAllItems(): Promise<Item[]> {
  const allItems: Item[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const res = await getItems(page);
    allItems.push(...res.items);
    lastPage = res.meta.last_page;
    page++;
  } while (page <= lastPage);

  return allItems;
}
