// Parse the playtest client's ItemDatabase MonoBehaviour into a structured
// JSON master list. Cross-reference with Items_en.txt to identify the
// "obtainable" subset (items that have a player-facing localized name).
//
// Read-only — does NOT touch Sanity. Outputs to wip/tmp/.
//
// Usage:
//   node scripts/parse-itemdb.js

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const ITEMDB = 'E:/Website Stuff/Datamining/output/monobehaviours_json/ItemDatabase.txt';
const EN_PATH = 'E:/Website Stuff/Datamining/output/addressables_data_json/Assets/_Project/Data/Localization/Tables/Items/Items_en/Items_en.txt';
const SHARED_PATH = 'E:/Website Stuff/Datamining/output/addressables_data_json/Assets/_Project/Data/Localization/Tables/Items/Items Shared Data/Items Shared Data.txt';
const OUT_DIR = path.join(__dirname, '..', 'tmp');

// ---- Enum maps (resolved from il2cpp dump.cs) ----
const ITEM_TYPE = ['None', 'Material', 'Equipment', 'Consumable', 'Valuables', 'Currencies', 'Booster', 'MountEquipment', 'Quest'];
const RARITY = ['None', 'Common', 'Rare', 'Epic', 'Legendary', 'Currency', 'Junk', 'Quests', 'Set'];
const SLOT_TYPE = [
  'None', 'Helmet', 'Chest Piece', 'Gloves', 'Shoulder Pads', 'Belt', 'Cape', 'Pants', 'Boots',
  'Ring', 'Amulet', 'Main Hand', 'Off Hand',
  'Mining Tool', 'Woodcutting Tool', 'Gardening Tool', 'Carving Tool', 'Fishing Tool', 'Potion',
];
const STAT = [
  'None', 'Vitality', 'Spirit', 'Endurance', 'Mind', 'Strength', 'Dexterity', 'Intelligence',
  'Armor', 'Armor Penetration', 'Magic Defence', 'Magic Penetration', 'Crit Chance', 'Crit Hit Damage',
  'Health Regeneration', 'Healing Increase', 'Haste', 'Cooldown Reduction', 'Movement Speed',
  'Weapon Damage Min', 'Weapon Damage Max',
  'Fire Resistance', 'Fire Penetration', 'Frost Resistance', 'Frost Penetration',
  'Healing Reduction', 'Barrier', 'Mana Regeneration', 'Energy Regeneration',
  'Flat Health', 'Flat Mana', 'Flat Energy',
];
const MODIF_TYPE = ['Flat', 'Percent']; // 0=Flat, 1=Percent (best guess; matches BeastBurst convention)

// ---- Indent-aware section parser ----
// Records are at indent depth 3 (`\t\t\t[N]` / `\t\t\t<Type> data`).
// Leaf fields are at depth 4. Inner arrays (statModifIds) appear at depth 4
// for the array header and depth 6 for elements; we extract those by name.
function parseSection(text, sectionHeader, recordType) {
  const lines = text.split(/\r?\n/);
  const headerRe = new RegExp(`^\\tList\`1 ${sectionHeader}$`);
  const sizeRe = /^\t\tint size = (\d+)$/;

  let i = 0;
  while (i < lines.length && !headerRe.test(lines[i])) i++;
  if (i >= lines.length) return [];
  // Skip `\t\tArray Array` and `\t\tint size = N`
  i++;
  if (i >= lines.length || !/^\t\tArray Array$/.test(lines[i])) return [];
  i++;
  const sm = i < lines.length ? lines[i].match(sizeRe) : null;
  const expectedSize = sm ? parseInt(sm[1], 10) : 0;
  i++;

  const records = [];
  const indexRe = /^\t\t\t\[\d+\]$/;
  const typeRe = new RegExp(`^\t\t\t${recordType} data$`);
  const fieldRe = /^\t\t\t\t([\w<>\[\]]+?)(?:[\w<>\[\]]+)?\s*=\s*(.*)$/;
  // Robuster field parser: capture the LAST identifier on the line followed by ` = value`.
  const fieldRe2 = /^\t\t\t\t(?:[\w<>`\[\] ]+? )?(\w+(?:<\w+>k__BackingField)?)\s*=\s*(.*)$/;

  while (i < lines.length) {
    const line = lines[i];
    // End conditions: next sibling section header (1 tab) or EOF.
    if (/^\tList`1 |^\tDictionary/.test(line)) break;
    if (!indexRe.test(line)) { i++; continue; }
    i++;
    if (i >= lines.length || !typeRe.test(lines[i])) {
      i++;
      continue;
    }
    i++;
    const obj = {};
    while (i < lines.length) {
      const fl = lines[i];
      if (indexRe.test(fl) || /^\tList`1 |^\tDictionary/.test(fl)) break;
      // Detect nested statModifIds array: `\t\t\t\tUInt32[] statModifIds`
      if (/^\t{4}UInt32\[\] statModifIds$/.test(fl)) {
        i++;
        // Expect Array Array + int size = N at depth 5
        if (i < lines.length && /^\t{5}Array Array$/.test(lines[i])) i++;
        let innerSize = 0;
        const isz = i < lines.length ? lines[i].match(/^\t{5}int size = (\d+)$/) : null;
        if (isz) { innerSize = parseInt(isz[1], 10); i++; }
        const ids = [];
        for (let k = 0; k < innerSize; k++) {
          // `\t{6}[N]` then `\t{6}UInt32 data = X`
          if (i < lines.length && /^\t{6}\[\d+\]$/.test(lines[i])) i++;
          const dm = i < lines.length ? lines[i].match(/^\t{6}UInt32 data = (\d+)$/) : null;
          if (dm) {
            const v = parseInt(dm[1], 10);
            if (v !== 0) ids.push(v);
            i++;
          } else { break; }
        }
        obj.statModifIds = ids;
        continue;
      }
      // Skip other depth >= 5 lines (inner arrays we don't need, e.g. gatheringResourceTypes empty list).
      if (/^\t{5,}/.test(fl)) { i++; continue; }
      // Parse leaf at depth 4. Format: `\t{4}<Type> <FieldName> = <Value>`
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
        else if (/^-?\d*\.\d+$/.test(v)) v = parseFloat(v);
        else if (v === 'True') v = true;
        else if (v === 'False') v = false;
        obj[key] = v;
      }
      i++;
    }
    records.push(obj);
  }
  if (records.length !== expectedSize) {
    console.warn(`  WARN ${sectionHeader}: parsed ${records.length}, expected ${expectedSize}`);
  }
  return records;
}

// ---- Items_en.txt + Items Shared Data parser ----
function parseEnNames(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const out = new Set();
  const re = /m_Localized\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(txt))) out.add(m[1]);
  return out;
}
function parseEnIdToLocalized(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const out = new Map();
  const re = /TableEntryData data[\s\S]*?m_Id\s*=\s*(-?\d+)[\s\S]*?m_Localized\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(txt))) out.set(m[1], m[2]);
  return out;
}
function parseSharedKeyToId(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const out = new Map();
  const re = /SharedTableEntry data[\s\S]*?m_Id\s*=\s*(-?\d+)[\s\S]*?m_Key\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(txt))) out.set(m[2], m[1]);
  return out;
}
function looksLikeKey(name) {
  return typeof name === 'string' && /Key$/.test(name) && !/\s/.test(name);
}

(async () => {
  console.log('Reading ItemDatabase.txt...');
  const text = fs.readFileSync(ITEMDB, 'utf8');

  console.log('Parsing sections...');
  const items = parseSection(text, 'Items', 'ItemTemplate');
  console.log(`  Items: ${items.length}`);
  const equipables = parseSection(text, 'ItemEquipableComponentDatas', 'ItemEquipableComponentData');
  console.log(`  ItemEquipableComponentDatas: ${equipables.length}`);
  const statComps = parseSection(text, 'ItemStatComponentDatas', 'ItemStatComponentData');
  console.log(`  ItemStatComponentDatas: ${statComps.length}`);
  const statMods = parseSection(text, 'ItemStatModifications', 'ItemStatModification');
  console.log(`  ItemStatModifications: ${statMods.length}`);
  const statLists = parseSection(text, 'ItemStatModificationLists', 'ItemStatModificationList');
  console.log(`  ItemStatModificationLists: ${statLists.length}`);
  const visuals = parseSection(text, 'ItemVisualComponentDatas', 'ItemVisualComponentData');
  console.log(`  ItemVisualComponentDatas: ${visuals.length}`);
  const consumables = parseSection(text, 'ItemConsumableComponentDatas', 'ItemConsumableComponentData');
  console.log(`  ItemConsumableComponentDatas: ${consumables.length}`);
  const activatables = parseSection(text, 'ItemActivatableComponentDatas', 'ItemActivatableComponentData');
  console.log(`  ItemActivatableComponentDatas: ${activatables.length}`);
  const mounts = parseSection(text, 'ItemMountComponentDatas', 'ItemMountComponentData');
  console.log(`  ItemMountComponentDatas: ${mounts.length}`);

  // Build lookup tables.
  const equipById = new Map();
  for (const e of equipables) equipById.set(e.itemTemplateId, e);
  const statCompById = new Map();
  for (const s of statComps) statCompById.set(s.itemTemplateId, s);
  const statModById = new Map();
  for (const m of statMods) statModById.set(m.id, m);
  const statListById = new Map();
  for (const l of statLists) statListById.set(l.id, l);
  const visualById = new Map();
  for (const v of visuals) visualById.set(v.itemTemplateId, v);
  const consumableById = new Map();
  for (const c of consumables) consumableById.set(c.itemTemplateId, c);
  const mountById = new Map();
  for (const m of mounts) mountById.set(m.itemTemplateId, m);

  // Resolve a stat list id → array of modifications with names + values.
  function resolveStatList(listId) {
    if (!listId) return null;
    const list = statListById.get(listId);
    if (!list || !list.statModifIds || !list.statModifIds.length) return null;
    const mods = [];
    for (const modId of list.statModifIds) {
      const m = statModById.get(modId);
      if (!m) continue;
      mods.push({
        stat: STAT[m.stat] || `Unknown(${m.stat})`,
        modifType: MODIF_TYPE[m.modifType] || `Unknown(${m.modifType})`,
        modifWeight: m.modifWeight,
        modifMinValue: m.modifMinValue,
        modifMaxValue: m.modifMaxValue,
      });
    }
    return {
      id: list.id,
      minStatCount: list.minStatCount,
      maxStatCount: list.maxStatCount,
      modifications: mods,
    };
  }

  // Build the unified item records.
  console.log('\nBuilding unified records...');
  const built = items.map((it) => {
    const out = {
      id: it.Id,
      name: it.Name,
      itemType: ITEM_TYPE[it.ItemType] || `Unknown(${it.ItemType})`,
      rarity: RARITY[it.Rarity] || `Unknown(${it.Rarity})`,
      slotType: SLOT_TYPE[it.EquipmentSlotType] || `Unknown(${it.EquipmentSlotType})`,
      stackSize: it.StackSize,
      isDestructible: it.IsDestructible,
      sellValue: it.SellValue,
      iconId: it.IconId,
      dropVisualId: it.DropVisualId,
      descriptionId: it.Description,
    };
    const e = equipById.get(it.Id);
    if (e) {
      out.equipable = {
        equipmentType: e.equipmentType,
        armorType: e.armorType,
        weaponType: e.weaponType,
        gatheringToolType: e.gatheringToolType,
        weaponHoldingType: e.weaponHoldingType,
        gameClass: e.gameClass,
        gameSubclass: e.gameSubclass,
        gameRace: e.gameRace,
        level: e.level,
        durability: e.durability,
        efficiency: e.efficiency,
      };
    }
    const sc = statCompById.get(it.Id);
    if (sc) {
      out.stats = {
        base: resolveStatList(sc.baseStatList),
        primary: resolveStatList(sc.primaryStatList),
        secondary: resolveStatList(sc.secondaryStatList),
      };
    }
    const v = visualById.get(it.Id);
    if (v) out.visual = { modelId: v.modelId, vfxId: v.vfxId };
    const c = consumableById.get(it.Id);
    if (c) out.consumable = c;
    const mt = mountById.get(it.Id);
    if (mt) out.mount = mt;
    return out;
  });

  // ---- Obtainable filter ----
  console.log('\nBuilding key → English name bridge...');
  const enNames = parseEnNames(EN_PATH);
  const idToLocal = parseEnIdToLocalized(EN_PATH);
  const keyToId = parseSharedKeyToId(SHARED_PATH);
  const keyToLocal = new Map();
  for (const [key, id] of keyToId) {
    const loc = idToLocal.get(id);
    if (loc) keyToLocal.set(key, loc);
  }
  console.log(`  Items_en unique names: ${enNames.size}`);
  console.log(`  keyToLocal entries: ${keyToLocal.size}`);

  // Resolve each built item's display name: key → English, or use Name as-is.
  for (const item of built) {
    item.rawName = item.name;
    if (looksLikeKey(item.name)) {
      const resolved = keyToLocal.get(item.name);
      if (resolved) {
        item.name = resolved;
        item.resolvedFromKey = true;
      } else {
        item.unresolvedKey = true;
      }
    }
  }

  // Heuristic filters for non-obtainable / dev items.
  const DEV_NAME_PATTERNS = [
    /^Test\s/i,
    /\bTest\s+(Bow|Sword|Axe|Staff|Mace|Hammer|Wand|Shield|Dagger|Amulet|Ring|Helmet|Chest|Cape|Belt|Pants|Boots|Gloves)\b/i,
    /\b(Insta\s*Kill|InstaKill|GodMode)\b/i,
    /placeholder/i,
    /^debug/i,
    /\bSeventh Staff of Seven\b/i, // Known one-off dev item
  ];
  // Internal SKU/template names: "Weapon Axe 2H T1 EXC", "Armor Light T3",
  // "Citizen_DOM_F_1", "Vendor_SOR_U_4", etc.
  const INTERNAL_SKU_PATTERNS = [
    /^(Weapon|Armor|Body|Helmet|Cape|Belt|Boots|Pants|Gloves|Shoulder|Ring|Amulet|Cloth|Leather|Plate|Mail|Chest|Robe|NPC)\s/i,
    /\sT\d+(\s|EXC|$)/i,    // Tier markers
    /\sEXC\s*$/i,
    /\sBas\s|\sBasT|\sBas$/, // Base/Bas variant suffixes
    /_/,                     // NPC outfit IDs and snake_case internal names always contain underscores
    /\b(Dzho|Tzetzo)\b/i,    // Known dev item authors
    /\s-\s.*\bVITAL\b/i,     // Mount-equipment stat-encoded SKUs: "ALL - EPIC - 60 VITAL - 7 INTEL"
    /\s-\s.*\bINTEL\b/i,
  ];
  function isLikelyDev(name) {
    return DEV_NAME_PATTERNS.some((re) => re.test(name));
  }
  function looksLikeInternalSku(name) {
    return INTERNAL_SKU_PATTERNS.some((re) => re.test(name));
  }

  const obtainable = [];
  const nonLocalized = [];
  const dev = [];
  const internal = [];
  for (const item of built) {
    if (isLikelyDev(item.rawName) || isLikelyDev(item.name)) {
      dev.push(item);
      continue;
    }
    if (item.resolvedFromKey) {
      obtainable.push(item);
      continue;
    }
    // Plain-English Name (not a key). Filter out internal SKU/template names.
    if (!looksLikeKey(item.rawName)) {
      if (looksLikeInternalSku(item.name)) {
        internal.push(item);
      } else {
        obtainable.push(item);
      }
      continue;
    }
    // Key-shaped but didn't resolve → cut/internal content.
    nonLocalized.push(item);
  }

  console.log(`\nObtainable (player-facing in playtest): ${obtainable.length}`);
  console.log(`Non-localized (key-shaped, no English): ${nonLocalized.length}`);
  console.log(`Internal SKU/template names: ${internal.length}`);
  console.log(`Dev/test (heuristic filter): ${dev.length}`);

  // ---- Diff vs Sanity + icon lookup ----
  console.log('\nDiffing vs current Sanity items...');
  const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false,
  });
  const sanityItems = await sanityClient.fetch(
    '*[_type == "item"]{ externalId, name, slotType, rarity, itemType, icon, "slug": slug.current }',
  );
  const sanityNames = new Set();
  const sanityByName = new Map();
  for (const s of sanityItems) {
    sanityNames.add(s.name);
    if (!sanityByName.has(s.name)) sanityByName.set(s.name, s);
  }

  // Tag obtainable items with the current playtest patch + lookup icon/slug
  // from existing Sanity records (BeastBurst-imported) where the name matches.
  const PATCH_TAG = 'Spring 2026 Playtest';

  // Build a recursive index of every PNG in the datamine sprite directories,
  // so we can resolve filenames inside the Assets/_Project/_Settings/ subtree
  // (the existing mirror script only walked the top level).
  const SPRITE_DIRS = [
    'E:/Website Stuff/Datamining/output/sprites_data_unity3d',
    'E:/Website Stuff/Datamining/output/addressables_sprites',
    'E:/Website Stuff/Datamining/output/sprites_inventory_full',
  ];
  // PathID-named extraction (filename IS the m_PathID). Authoritative source
  // for resolving each ItemTemplate's IconId → IconsDatabase.PathID → file.
  const PATHID_DIR = 'E:/Website Stuff/Datamining/output/sprites_pathid';
  const ICONS_DB_PATH = 'E:/Website Stuff/Datamining/output/addressables_data_json/Assets/_Project/_Settings/UiSceneDesktopSettings/IconsDatabase.txt';
  const ITEMS_OUT_DIR = path.join(__dirname, '..', 'public', 'Icons', 'items');
  function walkPngs(root, out) {
    if (!fs.existsSync(root)) return;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) { stack.push(full); continue; }
        if (!e.name.toLowerCase().endsWith('.png')) continue;
        // Prefer non-suffixed names (`X.png` over `X_#12345.png` duplicates).
        if (out.has(e.name)) continue;
        out.set(e.name, full);
      }
    }
  }
  const spriteIndex = new Map();
  for (const d of SPRITE_DIRS) walkPngs(d, spriteIndex);
  console.log(`  Indexed ${spriteIndex.size} sprite PNGs (recursive).`);

  // Build IconId → m_PathID map from IconsDatabase (ItemIcons array).
  // Format: blocks of `ItemIcons data` with `unsigned int Id = N` then
  // `PPtr<$Sprite> Icon` containing `SInt64 m_PathID = X`.
  function parseIconsDatabase(file) {
    if (!fs.existsSync(file)) return new Map();
    const txt = fs.readFileSync(file, 'utf8');
    const lines = txt.split(/\r?\n/);
    const out = new Map();
    let inItemIcons = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\tItemIcons ItemIcons$/.test(line)) inItemIcons = true;
      else if (/^\tItemIcons \w+$/.test(line) && inItemIcons) break; // next sibling array
      if (!inItemIcons) continue;
      const idMatch = line.match(/^\t{4}unsigned int Id = (\d+)$/);
      if (!idMatch) continue;
      // PathID is two lines below (after `PPtr<$Sprite> Icon` and `int m_FileID = N`).
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const pm = lines[j].match(/^\t+SInt64 m_PathID = (-?\d+)$/);
        if (pm) {
          const pathId = pm[1];
          if (pathId !== '0') out.set(parseInt(idMatch[1], 10), pathId);
          break;
        }
      }
    }
    return out;
  }
  const iconIdToPathId = parseIconsDatabase(ICONS_DB_PATH);
  console.log(`  Parsed IconsDatabase: ${iconIdToPathId.size} ItemIcons iconId → PathID entries.`);

  // PathID-named extraction index (filename = `<PathID>.png`).
  const pathIdIndex = new Map(); // PathID string → absolute path
  if (fs.existsSync(PATHID_DIR)) {
    for (const name of fs.readdirSync(PATHID_DIR)) {
      if (!name.toLowerCase().endsWith('.png')) continue;
      const stem = name.replace(/\.png$/i, '');
      pathIdIndex.set(stem, path.join(PATHID_DIR, name));
    }
  }
  console.log(`  Indexed ${pathIdIndex.size} PathID-named PNGs.`);

  fs.mkdirSync(ITEMS_OUT_DIR, { recursive: true });
  function resolveFromCdnUrl(cdnUrl) {
    if (!cdnUrl) return null;
    const fn = decodeURIComponent(cdnUrl.split('/').pop().split('?')[0] || '');
    if (!fn || fn === '40x40' || fn.includes('placehold')) return null;
    // Direct hit.
    if (spriteIndex.has(fn)) return fn;
    // Strip BunnyCDN's `_<id>.png` suffix.
    const stripped = fn.replace(/_\d+(\.png)$/i, '$1');
    if (stripped !== fn && spriteIndex.has(stripped)) return stripped;
    // Common typo in BeastBurst's filenames: `IconsInventory_` vs `IconInventory_`.
    const altS = fn.replace(/^IconsInventory_/i, 'IconInventory_');
    if (altS !== fn && spriteIndex.has(altS)) return altS;
    const altSStripped = stripped.replace(/^IconsInventory_/i, 'IconInventory_');
    if (altSStripped !== stripped && spriteIndex.has(altSStripped)) return altSStripped;
    return null;
  }
  function copyToMirror(filename) {
    const src = spriteIndex.get(filename);
    if (!src) return false;
    const dest = path.join(ITEMS_OUT_DIR, filename);
    if (!fs.existsSync(dest)) {
      try { fs.copyFileSync(src, dest); } catch { return false; }
    }
    return true;
  }

  let withIcon = 0;
  let viaPathId = 0;
  let viaSanity = 0;
  let mirroredFromCdn = 0;
  let stillBroken = 0;
  const stillBrokenSamples = [];
  for (const item of obtainable) {
    item.addedInPatch = PATCH_TAG;
    const match = sanityByName.get(item.name);
    if (match) {
      if (match.slug) item.slug = match.slug;
      if (match.externalId) item.beastBurstId = match.externalId;
    }

    // 1) Authoritative: IconId → IconsDatabase.PathID → file.
    if (item.iconId) {
      const pathId = iconIdToPathId.get(item.iconId);
      if (pathId && pathIdIndex.has(pathId)) {
        const src = pathIdIndex.get(pathId);
        const destName = `pathid_${pathId}.png`;
        const dest = path.join(ITEMS_OUT_DIR, destName);
        try {
          if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
          item.icon = `/Icons/items/${destName}`;
          item.iconSource = 'pathid';
          viaPathId++;
          withIcon++;
          continue;
        } catch { /* fall through */ }
      }
    }

    // 2) Sanity has a local /Icons/items/ path already mirrored.
    if (match && match.icon && match.icon.startsWith('/Icons/items/')) {
      item.icon = match.icon;
      item.iconSource = 'sanity-local';
      viaSanity++;
      withIcon++;
      continue;
    }
    // 3) Sanity has a CDN URL → try to resolve filename in the recursive sprite index.
    if (match && match.icon) {
      const filename = resolveFromCdnUrl(match.icon);
      if (filename && copyToMirror(filename)) {
        item.icon = `/Icons/items/${filename}`;
        item.iconSource = 'cdn-mirror';
        mirroredFromCdn++;
        withIcon++;
        continue;
      }
    }
    stillBroken++;
    if (stillBrokenSamples.length < 10) stillBrokenSamples.push({ name: item.name, iconId: item.iconId, cdn: match?.icon });
  }
  console.log(`  Obtainable with icon: ${withIcon}/${obtainable.length}`);
  console.log(`    via PathID (canonical): ${viaPathId}`);
  console.log(`    via Sanity local mirror: ${viaSanity}`);
  console.log(`    via CDN-name datamine match: ${mirroredFromCdn}`);
  console.log(`    still broken: ${stillBroken}`);
  if (stillBrokenSamples.length) {
    console.log(`    sample still-broken:`);
    for (const s of stillBrokenSamples) console.log(`      ${s.name}  iconId=${s.iconId}  cdn=${s.cdn || 'none'}`);
  }

  const obtainableNames = new Set(obtainable.map((i) => i.name));
  const inBoth = obtainable.filter((i) => sanityNames.has(i.name));
  const datamineOnly = obtainable.filter((i) => !sanityNames.has(i.name));
  const sanityOnly = sanityItems.filter((s) => !obtainableNames.has(s.name));

  console.log(`  In both (datamine obtainable ∩ Sanity): ${inBoth.length}`);
  console.log(`  Datamine obtainable, NOT in Sanity: ${datamineOnly.length}`);
  console.log(`  Sanity items NOT in datamine obtainable: ${sanityOnly.length}`);

  // Stats coverage check.
  const obtainableWithStats = obtainable.filter((i) => i.stats && (i.stats.base || i.stats.primary));
  console.log(`  Obtainable with stats: ${obtainableWithStats.length}/${obtainable.length}`);

  // ---- Write outputs ----
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const fullPath = path.join(OUT_DIR, 'playtest-items.json');
  fs.writeFileSync(fullPath, JSON.stringify({
    summary: {
      itemDatabaseTotal: items.length,
      obtainable: obtainable.length,
      nonLocalized: nonLocalized.length,
      dev: dev.length,
      sanityTotal: sanityItems.length,
      inBoth: inBoth.length,
      datamineOnly: datamineOnly.length,
      sanityOnly: sanityOnly.length,
      obtainableWithStats: obtainableWithStats.length,
    },
    obtainable,
  }, null, 2));

  // Markdown diff report.
  const md = [];
  md.push('# Playtest item database — parse + diff');
  md.push('');
  md.push('## Source');
  md.push('- ItemDatabase.txt (data.unity3d MonoBehaviour dump)');
  md.push('- Items_en.txt (English localization table)');
  md.push('');
  md.push('## Counts');
  md.push(`- ItemDatabase total: **${items.length}**`);
  md.push(`- Obtainable (in Items_en, non-dev): **${obtainable.length}**`);
  md.push(`- Obtainable with stats: ${obtainableWithStats.length}`);
  md.push(`- Non-localized (in DB but not Items_en): ${nonLocalized.length}`);
  md.push(`- Dev/test (heuristic): ${dev.length}`);
  md.push('');
  md.push('## Diff vs Sanity (BeastBurst-imported)');
  md.push(`- Sanity total: ${sanityItems.length}`);
  md.push(`- In both: **${inBoth.length}**`);
  md.push(`- Datamine obtainable, NOT in Sanity: **${datamineOnly.length}**`);
  md.push(`- Sanity items NOT in datamine obtainable: **${sanityOnly.length}** (these would be dropped)`);
  md.push('');
  md.push('## Sample obtainable items (with parsed stats)');
  for (const item of obtainable.slice(0, 8)) {
    md.push(`### ${item.name}`);
    md.push(`- id: ${item.id} | ${item.rarity} ${item.itemType} ${item.slotType} | sell ${item.sellValue}`);
    if (item.stats) {
      for (const pool of ['base', 'primary', 'secondary']) {
        const p = item.stats[pool];
        if (!p) continue;
        md.push(`- **${pool}** (${p.minStatCount}-${p.maxStatCount} of):`);
        for (const m of p.modifications) {
          const range = m.modifMinValue === m.modifMaxValue ? `${m.modifMinValue}` : `${m.modifMinValue}–${m.modifMaxValue}`;
          md.push(`  - ${m.stat}: ${range} (${m.modifType}, w${m.modifWeight})`);
        }
      }
    }
    md.push('');
  }
  md.push('## Sample dev/test items dropped');
  for (const item of dev.slice(0, 15)) md.push(`- ${item.name} *(${item.rarity} ${item.slotType})*`);
  md.push('');
  md.push('## Sample non-localized items (in DB, no English string — not user facing)');
  for (const item of nonLocalized.slice(0, 30)) md.push(`- ${item.name} *(${item.rarity} ${item.slotType})*`);
  md.push('');
  md.push('## Sample datamine-only obtainable (would be NEW to Sanity)');
  for (const item of datamineOnly.slice(0, 30)) md.push(`- ${item.name} *(${item.rarity} ${item.slotType})*`);
  md.push('');
  md.push('## Sample Sanity-only (would be REMOVED — not in playtest)');
  for (const s of sanityOnly.slice(0, 30)) md.push(`- ${s.name} *(${s.rarity || '?'} ${s.slotType || s.itemType || '?'})*`);

  const mdPath = path.join(OUT_DIR, 'playtest-items.md');
  fs.writeFileSync(mdPath, md.join('\n'));

  console.log(`\nWrote ${fullPath}`);
  console.log(`Wrote ${mdPath}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
