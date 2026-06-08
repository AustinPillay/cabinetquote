// ============================================================
// materials.js
// All board materials, sheet sizes, and edging costs.
// To update pricing: change values here only.
// Nothing else in the system needs to change.
// ============================================================

export const SHEET_WIDTH_MM  = 2750;
export const SHEET_HEIGHT_MM = 1830;
export const SHEET_HEIGHT_MELAPLY_MM = 1200; // Melaply sheets are shorter
export const SHEET_WIDTH_MELAPLY_MM = 2400;  // Melaply sheets are narrower

export const materials = {

  // --- CARCASS MATERIALS (inside of cabinets) ---

  whiteMelamine: {
    label:          "White",
    sheetCostRand:  900,         // R per sheet, VAT inclusive
    sheetWidthMM:   SHEET_WIDTH_MM,
    sheetHeightMM:  SHEET_HEIGHT_MM,
    edgingCostRand: 15,           // R per metre of edging tape
  },

  glossWhite: {
    label:          "Gloss White (Carcass)",
    sheetCostRand:  2700,         // R per sheet, VAT inclusive
    sheetWidthMM:   SHEET_WIDTH_MM,
    sheetHeightMM:  SHEET_HEIGHT_MM,
    edgingCostRand: 15,           // R per metre of edging tape
  },

  matteWhite: {
    label:          "Matte White (Carcass)",
    sheetCostRand:  2200,
    sheetWidthMM:   SHEET_WIDTH_MM,
    sheetHeightMM:  SHEET_HEIGHT_MM,
    edgingCostRand: 15,
  },


  // --- EXTERNAL / DOOR MATERIALS (visible faces) ---

  glossWhiteExternal: {
    label:          "Gloss White (External / Doors)",
    sheetCostRand:  3300,         // Pricier — external finish
    sheetWidthMM:   SHEET_WIDTH_MM,
    sheetHeightMM:  SHEET_HEIGHT_MM,
    edgingCostRand: 25,
  },

  matteWhiteExternal: {
    label:          "Matte White (External / Doors)",
    sheetCostRand:  4000,
    sheetWidthMM:   SHEET_WIDTH_MM,
    sheetHeightMM:  SHEET_HEIGHT_MM,
    edgingCostRand: 25,
  },

  // --- BACK / BASE MATERIALS ---

  backBoard: {
    label:          "Back Board (3mm)",
    sheetCostRand:  650,
    sheetWidthMM:   SHEET_WIDTH_MM,
    sheetHeightMM:  SHEET_HEIGHT_MM,
    edgingCostRand: 0,            // Back boards are not edged
  },

  masonite: {
    label:          "Masonite (3mm)",
    sheetCostRand:  300,
    sheetWidthMM:   SHEET_WIDTH_MM,
    sheetHeightMM:  SHEET_HEIGHT_MM,
    edgingCostRand: 0,
  },

};

// Lookup helper — returns material or throws a clear error
export function getMaterial(key) {
  if (!materials[key]) {
    throw new Error(`Material "${key}" not found. Available: ${Object.keys(materials).join(", ")}`);
  }
  return materials[key];
}
