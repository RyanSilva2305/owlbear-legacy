// Arquivo: owlbear-legacy/src/database.ts

import Dexie, { DexieOptions } from "dexie";
import { v4 as uuid } from "uuid";
import { loadVersions, UpgradeEventHandler } from "./upgrade";
import { getDefaultMaps } from "./maps";
import { getDefaultTokens } from "./tokens";
import { getRandomMonster } from "./helpers/monsters";

function populate(db: Dexie) {
  db.on("populate", () => {
    // ========== PRIORIDADE 1: Usar dados do Laravel ==========
    const laravelUserId = localStorage.getItem('owlbear_user_id');
    const laravelName = localStorage.getItem('owlbear_user_name');
    
    const userId = laravelUserId || uuid();
    const nickname = laravelName || getRandomMonster();
    
    console.log("🎨 Populando database com:", { userId, nickname, fromLaravel: !!laravelName });
    
    db.table("user").add({ key: "userId", value: userId });
    db.table("user").add({ key: "nickname", value: nickname });
    
    const { maps, mapStates } = getDefaultMaps(userId);
    db.table("maps").bulkAdd(maps);
    db.table("states").bulkAdd(mapStates);
    const tokens = getDefaultTokens(userId);
    db.table("tokens").bulkAdd(tokens);
    db.table("groups").bulkAdd([
      { id: "maps", items: maps.map((map) => ({ id: map.id, type: "item" })) },
      { id: "tokens", items: tokens.map((token) => ({ id: token.id, type: "item" })) },
    ]);
  });
}

export function getDatabase(
  options: DexieOptions,
  name: string | undefined = "OwlbearRodeoDB",
  versionNumber: number | undefined = undefined,
  populateData: boolean | undefined = true,
  onUpgrade: UpgradeEventHandler | undefined = undefined
): Dexie {
  const db = new Dexie(name, options);
  loadVersions(db, versionNumber, onUpgrade);

  // Integração com Laravel removida do database.ts para evitar conflitos com Web Workers
  // Os dados serão salvos localmente no IndexedDB do navegador
  // Para integração futura, use as APIs REST diretamente nos componentes React
  
  if (populateData) {
    populate(db);
  }
  
  return db;
}