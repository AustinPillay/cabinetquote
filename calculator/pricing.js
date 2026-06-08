// ============================================================
// pricing.js
// Takes a parts list + material + job settings.
// Returns a full itemised cost breakdown.
// ============================================================

import { getMaterial }                        from "./materials.js";
import { calculatePartEdging, generateBackBoard } from "./cabinetRules.js";
import {
  sheetAreaSqm,
  costPerSqm,
  panelAreaSqm,
  boardCost,
  applyWastage,
  edgingCost,
  labourFixedRate,
  transportCost,
  profitAmount,
  commissionAmount,
  otherAmount,
  grandTotal,
  formatRand,
} from "./formulas.js";

// ------------------------------------------------------------
// CALCULATE PARTS COST
// Input:  array of parts, material key (e.g. "glossWhite")
// Output: { boardCostRaw, edgingCostRaw, totalAreaSqm, totalEdgingM, sheetsNeeded }
// ------------------------------------------------------------
export function calculatePartsCost(parts, materialKey) {
  const material      = getMaterial(materialKey);
  const sheetArea     = sheetAreaSqm(material.sheetWidthMM, material.sheetHeightMM);
  const costSqm       = costPerSqm(material.sheetCostRand, sheetArea);

  let totalAreaSqm    = 0;
  let totalEdgingM    = 0;
  const partDetails   = [];

  for (const part of parts) {
    const area         = panelAreaSqm(part.widthMM, part.heightMM);
    const totalArea    = area * part.qty;
    const edging       = calculatePartEdging(part);
    const partCost     = boardCost(totalArea, costSqm);
    const partEdgeCost = edgingCost(edging, material.edgingCostRand);

    totalAreaSqm  += totalArea;
    totalEdgingM  += edging;

    partDetails.push({
      name:          part.name,
      widthMM:       part.widthMM,
      heightMM:      part.heightMM,
      qty:           part.qty,
      areaSqm:       totalArea,
      edgingM:       edging,
      boardCostRand: partCost,
      edgeCostRand:  partEdgeCost,
    });
  }

  const rawBoardCost = boardCost(totalAreaSqm, costSqm);
  const rawEdgeCost  = edgingCost(totalEdgingM, material.edgingCostRand);

  return {
    material:       material.label,
    partDetails,
    totalAreaSqm,
    totalEdgingM,
    sheetsNeeded:   totalAreaSqm / sheetArea,
    boardCostRaw:   rawBoardCost,
    edgingCostRaw:  rawEdgeCost,
    sectionTotal:   rawBoardCost + rawEdgeCost,
  };
}

// ------------------------------------------------------------
// BUILD FULL QUOTE
// Takes everything about a job and returns a complete breakdown.
// ------------------------------------------------------------
export function buildQuote({
  carcassParts,
  externalParts,
  backParts        = [],
  carcassMaterial  = "glossWhite",
  externalMaterial = "glossWhiteExternal",
  backMaterial     = "backBoard",
  hardwareCostRand = 0,
  totalLinearMetres,
  labourRatePerMetre = 310,
  transport        = null,     // pass transport settings or null
  wastageRate      = 0.20,
  profitRate       = 0.30,
  commissionRate   = 0.10,
  otherRate        = 0.10,
}) {
  // --- BOARD COSTS ---
  const carcass  = calculatePartsCost(carcassParts,  carcassMaterial);
  const external = calculatePartsCost(externalParts, externalMaterial);
  const back     = backParts.length > 0
    ? calculatePartsCost(backParts, backMaterial)
    : { sectionTotal: 0, boardCostRaw: 0, edgingCostRaw: 0 };

  const totalBoardCostRaw = carcass.sectionTotal + external.sectionTotal + back.sectionTotal;
  const totalBoardWithWastage = applyWastage(totalBoardCostRaw, wastageRate);

  // --- LABOUR ---
  const labour = labourFixedRate(totalLinearMetres, labourRatePerMetre);

  // --- TRANSPORT ---
  const transport_cost = transport ? transportCost(transport) : 0;

  // --- PROFIT / COMMISSION / OTHER ---
  const profit     = profitAmount(totalBoardWithWastage, profitRate);
  const commission = commissionAmount(totalBoardWithWastage, commissionRate);
  const other      = otherAmount(totalBoardWithWastage, otherRate);

  // --- GRAND TOTAL ---
  const total = grandTotal({
    boardCostWithWastage: totalBoardWithWastage,
    hardwareCost:         hardwareCostRand,
    labourCost:           labour,
    transportCostValue:   transport_cost,
    profit,
    commission,
    other,
  });

  return {
    sections: { carcass, external, back },
    summary: {
      boardCostRaw:           totalBoardCostRaw,
      wastageRate:            `${(wastageRate * 100).toFixed(0)}%`,
      boardCostWithWastage:   totalBoardWithWastage,
      hardwareCost:           hardwareCostRand,
      labourCost:             labour,
      transportCost:          transport_cost,
      profit,
      commission,
      other,
      grandTotal:             total,
    },
    formatted: {
      boardCostRaw:           formatRand(totalBoardCostRaw),
      boardCostWithWastage:   formatRand(totalBoardWithWastage),
      hardwareCost:           formatRand(hardwareCostRand),
      labourCost:             formatRand(labour),
      transportCost:          formatRand(transport_cost),
      profit:                 formatRand(profit),
      commission:             formatRand(commission),
      other:                  formatRand(other),
      grandTotal:             formatRand(total),
    },
  };
}
