import fs from 'node:fs';
import path from 'node:path';
import QuestDatabase, { type Quest } from '@/components/QuestDatabase';

export const metadata = {
  title: 'Quest Database — ScarsHQ',
  description: 'Every datamined Scars of Honor quest. Filter by Main, Side, or Special and search objectives.',
  alternates: { canonical: '/database/quests' },
};

interface QuestData {
  total: number;
  types: string[];
  quests: Quest[];
}

async function getQuests(): Promise<QuestData> {
  const file = path.join(process.cwd(), 'public', 'data', 'playtest-quests.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as QuestData;
  return raw;
}

export default async function QuestsPage() {
  const data = await getQuests();
  return <QuestDatabase quests={data.quests} types={data.types} />;
}
