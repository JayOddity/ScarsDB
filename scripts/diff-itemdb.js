// Diff two ItemDatabase.txt dumps to surface what a patch changed.
// Reads OLD baseline from output/ItemDatabase.OLD.txt and NEW from
// output/monobehaviours_json/ItemDatabase.txt, then prints added /
// removed / changed items by Id (ItemTemplate.Id is the stable key
// across patches — it's set per item, not per build).

const fs = require('fs');
const path = require('path');

const OLD_PATH = 'E:/Website Stuff/Datamining/output/ItemDatabase.OLD.txt';
const NEW_PATH = 'E:/Website Stuff/Datamining/output/monobehaviours_json/ItemDatabase.txt';
const OUT_DIR = path.join(__dirname, '..', 'tmp');

function parseItems(file) {
  if (!fs.existsSync(file)) {
    console.error('Missing:', file);
    process.exit(1);
  }
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const out = new Map();
  // Find the Items array.
  let i = 0;
  while (i < lines.length && !/^\tList`1 Items$/.test(lines[i])) i++;
  if (i >= lines.length) return out;
  i += 3; // skip header + Array Array + int size
  while (i < lines.length) {
    if (/^\tList`1 |^\tDictionary/.test(lines[i])) break;
    if (!/^\t{3}\[\d+\]$/.test(lines[i])) { i++; continue; }
    i++;
    if (i >= lines.length || !/^\t{3}ItemTemplate data$/.test(lines[i])) { i++; continue; }
    i++;
    const obj = {};
    while (i < lines.length) {
      const fl = lines[i];
      if (/^\t{3}\[/.test(fl) || /^\tList`1 |^\tDictionary/.test(fl)) break;
      if (!/^\t{4}/.test(fl)) { i++; continue; }
      const eq = fl.indexOf(' = ');
      if (eq > 0) {
        const lhs = fl.slice(0, eq).replace(/^\t+/, '');
        const tokens = lhs.split(/\s+/);
        let key = tokens[tokens.length - 1];
        const bm = key.match(/^<(\w+)>k__BackingField$/);
        if (bm) key = bm[1];
        let v = fl.slice(eq + 3);
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        else if (/^-?\d+$/.test(v)) v = parseInt(v, 10);
        else if (v === 'True') v = true;
        else if (v === 'False') v = false;
        obj[key] = v;
      }
      i++;
    }
    if (typeof obj.Id === 'number') out.set(obj.Id, obj);
  }
  return out;
}

const ITEM_TYPE = ['None', 'Material', 'Equipment', 'Consumable', 'Valuables', 'Currencies', 'Booster', 'MountEquipment', 'Quest'];
const RARITY = ['None', 'Common', 'Rare', 'Epic', 'Legendary', 'Currency', 'Junk', 'Quests', 'Set'];
const SLOT_TYPE = [
  'None', 'Helmet', 'Chest Piece', 'Gloves', 'Shoulder Pads', 'Belt', 'Cape', 'Pants', 'Boots',
  'Ring', 'Amulet', 'Main Hand', 'Off Hand',
  'Mining Tool', 'Woodcutting Tool', 'Gardening Tool', 'Carving Tool', 'Fishing Tool', 'Potion',
];
function summarize(it) {
  return `${it.Name} | ${RARITY[it.Rarity] || it.Rarity} ${ITEM_TYPE[it.ItemType] || it.ItemType} ${SLOT_TYPE[it.EquipmentSlotType] || it.EquipmentSlotType} | iconId=${it.IconId} sell=${it.SellValue}`;
}

const oldItems = parseItems(OLD_PATH);
const newItems = parseItems(NEW_PATH);
console.log(`OLD: ${oldItems.size} items`);
console.log(`NEW: ${newItems.size} items`);

const added = [];
const removed = [];
const changed = [];
for (const [id, it] of newItems) {
  if (!oldItems.has(id)) added.push(it);
}
for (const [id, it] of oldItems) {
  if (!newItems.has(id)) removed.push(it);
}
const fields = ['Name', 'ItemType', 'Rarity', 'StackSize', 'IsDestructible', 'SellValue', 'IconId', 'DropVisualId', 'EquipmentSlotType', 'Description'];
for (const [id, n] of newItems) {
  const o = oldItems.get(id);
  if (!o) continue;
  const diffs = {};
  for (const k of fields) {
    if (o[k] !== n[k]) diffs[k] = { old: o[k], new: n[k] };
  }
  if (Object.keys(diffs).length) changed.push({ id, name: n.Name, diffs });
}

console.log(`\nAdded: ${added.length}`);
console.log(`Removed: ${removed.length}`);
console.log(`Changed: ${changed.length}`);

const md = [];
md.push(`# ItemDatabase patch diff`);
md.push('');
md.push(`- OLD: ${oldItems.size} items`);
md.push(`- NEW: ${newItems.size} items`);
md.push(`- Added: **${added.length}**`);
md.push(`- Removed: **${removed.length}**`);
md.push(`- Changed: **${changed.length}**`);
md.push('');
md.push('## Added');
for (const a of added) md.push(`- [${a.Id}] ${summarize(a)}`);
md.push('');
md.push('## Removed');
for (const r of removed) md.push(`- [${r.Id}] ${summarize(r)}`);
md.push('');
md.push('## Changed');
for (const c of changed) {
  md.push(`- [${c.id}] **${c.name}**`);
  for (const [k, v] of Object.entries(c.diffs)) {
    md.push(`  - ${k}: \`${v.old}\` → \`${v.new}\``);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, 'patch-diff-itemdb.md');
fs.writeFileSync(outFile, md.join('\n'));
console.log(`\nWrote ${outFile}`);

// Also a JSON for programmatic follow-up.
fs.writeFileSync(path.join(OUT_DIR, 'patch-diff-itemdb.json'), JSON.stringify({ added, removed, changed }, null, 2));
