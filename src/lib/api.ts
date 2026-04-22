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
  slug: string;
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
