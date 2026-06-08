// ============================================================
// database/db.js
// Reads prices from cabinet.db via Python queryDB.py
// Returns live prices into the Node.js engine
// ============================================================

import { execSync } from "child_process";

const DB_SCRIPT = "./database/queryDB.py";

// ---- Run Python query, return parsed JSON ----
function query(table, category = null) {
  try {
    const args    = category ? `${table} --category "${category}"` : table;
    const result  = execSync(`python ${DB_SCRIPT} ${args}`, { encoding: "utf8" });
    return JSON.parse(result.trim());
  } catch (err) {
    console.error(`  DB error querying ${table}:`, err.message);
    return [];
  }
}

// ============================================================
// HARDWARE — returns all items as a lookup map by SKU
// ============================================================
export function loadHardware() {
  const rows = query("hardware");
  const map  = {};
  for (const row of rows) {
    map[row.sku] = {
      id:        row.id,
      category:  row.category,
      name:      row.name,
      sku:       row.sku,
      unitPrice: row.unit_price,
      unit:      row.unit,
      notes:     row.notes,
    };
  }
  return map;
}

// ============================================================
// MATERIALS — returns all boards as a lookup map by code
// ============================================================
export function loadMaterials() {
  const rows = query("materials");
  const map  = {};
  for (const row of rows) {
    map[row.code] = {
      id:           row.id,
      category:     row.category,
      name:         row.name,
      code:         row.code,
      sheetWidth:   row.sheet_width,
      sheetHeight:  row.sheet_height,
      thickness:    row.thickness,
      sheetCost:    row.cost_per_sheet,
      edgingCost:   row.edging_cost,
    };
  }
  return map;
}

// ============================================================
// MATERIAL MENU — returns list for user selection
// ============================================================
export function getMaterialMenu(category) {
  const rows = query("materials", category);
  return rows.map((r, i) => ({
    index:      String(i + 1),
    code:       r.code,
    name:       r.name,
    sheetCost:  r.cost_per_sheet,
    edgingCost: r.edging_cost,
    sheetWidth: r.sheet_width,
    sheetHeight:r.sheet_height,
  }));
}
