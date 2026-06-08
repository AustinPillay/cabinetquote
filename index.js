// ============================================================
// index.js — Cabinet Quoting CLI
// Multi-cabinet job session + hardware + cutting list + PDF
// Run: node index.js
// ============================================================

import * as readline from "readline";
import { execSync }           from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import {
  generateBaseUnitParts, generateWallUnitParts,
  generateTallUnitParts, generateExternalParts, generateBackBoard,
} from "./calculator/cabinetRules.js";
import { buildQuote }              from "./calculator/pricing.js";
import { formatRand }              from "./calculator/formulas.js";
import { generateCutList, buildMasterCutList, printCutList, printMasterCutList } from "./calculator/cuttingList.js";
import { generateHardware, printHardwareList } from "./calculator/hardware.js";

// ---- READLINE HELPERS ----
const rl     = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask    = q      => new Promise(r => rl.question(q, a => r(a.trim())));
const askNum = (q, d) => new Promise(r => rl.question(q, a => { const n = parseFloat(a); r(isNaN(n) ? d : n); }));
const askYN  = q      => new Promise(r => rl.question(q + " (y/n): ", a => r(a.trim().toLowerCase() === "y")));

// ---- MENUS ----
const UNIT_TYPES = { "1":"base", "2":"wall", "3":"tall" };

const CARCASS_MATERIALS = {
  "1": { key:"glossWhite", label:"Gloss White  — R2700/sheet" },
  "2": { key:"matteWhite", label:"Matte White  — R2200/sheet" },
  "3": { key:"melamine",   label:"Melamine     — R800/sheet"  },
};
const EXTERNAL_MATERIALS = {
  "1": { key:"glossWhiteExternal", label:"Gloss White  — R3300/sheet" },
  "2": { key:"matteWhiteExternal", label:"Matte White  — R4000/sheet" },
};
const HANDLE_TYPES = {
  "1": { key:"handle196mm", label:'Handle 196mm  — R45 each' },
  "2": { key:"handle128mm", label:'Handle 128mm  — R35 each' },
  "3": { key:"gola",        label:'Gola Profile  — R250/3m length' },
  "4": { key:"none",        label:'No handles' },
};
const HINGE_TYPES = {
  "1": { key:"softClose", label:"Soft Close — R8 each" },
  "2": { key:"normal",    label:"Normal     — R5.75 each" },
};

const DIV  = "─".repeat(60);
const DIV2 = "═".repeat(60);

// ---- JOB STATE ----
const job = { name:"", cabinets:[] };

// ============================================================
// JOB SETTINGS
// ============================================================
async function collectJobSettings() {
  console.log("\n" + DIV2);
  console.log("  JOB SETTINGS");
  console.log(DIV2);

  job.name = await ask("  Job name / client: ");

  const labourRate    = await askNum("  Labour rate per metre (default R310): ", 310);
  const inclTransport = await askYN("  Include transport cost?");
  let transport = null;
  if (inclTransport) {
    const distanceKm       = await askNum("    Distance one way (km): ", 25);
    const numberOfVehicles = await askNum("    Number of vehicles: ",     1);
    const numberOfTrips    = await askNum("    Number of trips: ",        1);
    const fuelPrice        = await askNum("    Fuel price (R/litre): ",  25);
    transport = { distanceKm, numberOfVehicles, numberOfTrips, fuelPriceRandPerLiter: fuelPrice };
  }

  return { labourRate, transport };
}

// ============================================================
// COLLECT ONE CABINET
// ============================================================
async function collectCabinet(jobSettings, num) {
  console.log("\n" + DIV2);
  console.log(`  CABINET ${num}`);
  console.log(DIV2);

  // Type + label
  console.log("\n  Unit Type:  1-Base  2-Wall  3-Tall");
  const unitType = UNIT_TYPES[await ask("  Select (1/2/3): ")] || "base";
  const label    = await ask(`  Label (e.g. "Sink Base") or Enter to skip: `);

  // Dimensions
  console.log("\n  Dimensions (mm):");
  const widthMM    = await askNum("    Width:  ", 600);
  const depthMM    = await askNum("    Depth:  ", unitType === "wall" ? 300 : 560);
  const heightMM   = await askNum("    Height: ", unitType === "wall" ? 700 : 720);
  const numUnits   = await askNum("    Number of units: ", 1);
  const numShelves = await askNum("    Shelves per unit: ", 1);
  const numDoors   = await askNum("    Doors per unit: ",   1);
  const numDrawers = await askNum("    Drawers per unit: ", 0);

  // Carcass material
  console.log("\n  Carcass Material:");
  Object.entries(CARCASS_MATERIALS).forEach(([k,v]) => console.log(`    ${k} — ${v.label}`));
  const carcassMaterial = CARCASS_MATERIALS[await ask("  Select (1/2/3): ")]?.key || "glossWhite";

  // Extras
  console.log("\n  Extras:");
  const hasSeenEnd   = await askYN("    Seen end?");
  const hasCapping   = await askYN("    Capping?");
  const hasSkirting  = unitType === "base" ? await askYN("    Skirting?") : false;
  const hasBackBoard = await askYN("    Back board?");
  const hasMasonite  = await askYN("    Masonite?");
  const hasHangingRail = unitType === "tall" ? await askYN("    Hanging rail?") : false;

  // External material
  console.log("\n  External / Door Material:");
  Object.entries(EXTERNAL_MATERIALS).forEach(([k,v]) => console.log(`    ${k} — ${v.label}`));
  const externalMaterial = EXTERNAL_MATERIALS[await ask("  Select (1/2): ")]?.key || "glossWhiteExternal";

  // Hardware
  console.log("\n  Hinge Type:");
  Object.entries(HINGE_TYPES).forEach(([k,v]) => console.log(`    ${k} — ${v.label}`));
  const hingeType = HINGE_TYPES[await ask("  Select (1/2): ")]?.key || "softClose";

  console.log("\n  Handle Type:");
  Object.entries(HANDLE_TYPES).forEach(([k,v]) => console.log(`    ${k} — ${v.label}`));
  const handleType = HANDLE_TYPES[await ask("  Select (1/2/3/4): ")]?.key || "handle196mm";

  // ---- HARDWARE CALCULATION ----
  const hardwareResult = generateHardware({
    unitType, widthMM, depthMM, heightMM,
    numUnits, numberOfDoors:numDoors, numberOfDrawers:numDrawers,
    hingeType, handleType, hasHangingRail, shelvesPerUnit:numShelves,
  });

  // Show hardware breakdown immediately
  const displayLabel = label || `${unitType.charAt(0).toUpperCase() + unitType.slice(1)} Unit`;
  printHardwareList(displayLabel, hardwareResult);

  // ---- BOARD PARTS ----
  const spec      = { widthMM, depthMM, heightMM, numberOfShelves:numShelves };
  const rawParts  = unitType === "wall" ? generateWallUnitParts(spec)
                  : unitType === "tall" ? generateTallUnitParts(spec)
                  :                       generateBaseUnitParts(spec);

  const carcassParts  = rawParts.map(p => ({ ...p, qty: p.qty * numUnits }));
  const externalParts = generateExternalParts({ ...spec, numberOfDoors:numDoors*numUnits, hasSeenEnd, hasCapping, hasSkirting });
  const backParts     = hasBackBoard ? generateBackBoard(spec).map(p => ({ ...p, qty:p.qty*numUnits })) : [];

  const quote = buildQuote({
    carcassParts, externalParts, backParts,
    carcassMaterial, externalMaterial,
    hardwareCostRand:   hardwareResult.hardwareTotal,   // ← auto-calculated now
    totalLinearMetres:  (widthMM / 1000) * numUnits,
    labourRatePerMetre: jobSettings.labourRate,
    transport:          null,
  });

  // ---- CUT LIST ----
  const singleCut = generateCutList(unitType, { widthMM, depthMM, heightMM, numberOfShelves:numShelves, numberOfDoors:numDoors, hasSeenEnd, hasMasonite, hasBackBoard });
  const cutList   = singleCut.map(p => ({ ...p, qty: p.qty * numUnits }));

  return {
    label: displayLabel, unitType, numUnits,
    widthMM, depthMM, heightMM,
    quote, cutList,
    hardware: hardwareResult,
  };
}

// ============================================================
// PRINT HELPERS
// ============================================================
function printCabinetSummary(cab, index) {
  const s = cab.quote.summary;
  console.log(`\n  [${index}] ${cab.label.toUpperCase()} — ×${cab.numUnits}  ${cab.widthMM}×${cab.depthMM}×${cab.heightMM}mm`);
  console.log(`      Board (raw):     ${formatRand(s.boardCostRaw)}`);
  console.log(`      Board +Wastage:  ${formatRand(s.boardCostWithWastage)}`);
  console.log(`      Hardware:        ${formatRand(s.hardwareCost)}  ← auto-calculated`);
  console.log(`      Labour:          ${formatRand(s.labourCost)}`);
  console.log(`      Profit:          ${formatRand(s.profit)}`);
  console.log(`      Commission:      ${formatRand(s.commission)}`);
  console.log(`      Other:           ${formatRand(s.other)}`);
  console.log(`      ── Cabinet Total: ${formatRand(s.grandTotal)}`);
}

function calcTransport(t) {
  return (t.distanceKm * t.numberOfTrips * 2 / 100) * (20 * t.numberOfVehicles) * t.fuelPriceRandPerLiter;
}

function buildTotals(jobSettings) {
  const totals = job.cabinets.reduce((acc, cab) => {
    const s = cab.quote.summary;
    acc.boardRaw     += s.boardCostRaw;
    acc.boardWastage += s.boardCostWithWastage;
    acc.hardware     += s.hardwareCost;
    acc.labour       += s.labourCost;
    acc.profit       += s.profit;
    acc.commission   += s.commission;
    acc.other        += s.other;
    acc.grandTotal   += s.grandTotal;
    return acc;
  }, { boardRaw:0, boardWastage:0, hardware:0, labour:0, profit:0, commission:0, other:0, grandTotal:0 });

  let transportCost = 0;
  if (jobSettings.transport) {
    transportCost = calcTransport(jobSettings.transport);
    totals.grandTotal += transportCost;
  }
  return { totals, transportCost };
}

function printJobSummary(jobSettings) {
  const { totals, transportCost } = buildTotals(jobSettings);
  console.log("\n\n" + DIV2);
  console.log(`  QUOTATION — ${job.name.toUpperCase()}`);
  console.log(DIV2);
  job.cabinets.forEach((c, i) => printCabinetSummary(c, i + 1));
  console.log("\n" + DIV2);
  console.log("  JOB TOTALS");
  console.log(DIV2);
  console.log(`\n  Cabinets             : ${job.cabinets.length}`);
  console.log(`  Board Cost (raw)     : ${formatRand(totals.boardRaw)}`);
  console.log(`  Board + Wastage 20%  : ${formatRand(totals.boardWastage)}`);
  console.log(`  Hardware             : ${formatRand(totals.hardware)}`);
  console.log(`  Labour               : ${formatRand(totals.labour)}`);
  if (jobSettings.transport) console.log(`  Transport            : ${formatRand(transportCost)}`);
  console.log(`  Profit  (30%)        : ${formatRand(totals.profit)}`);
  console.log(`  Commission (10%)     : ${formatRand(totals.commission)}`);
  console.log(`  Other   (10%)        : ${formatRand(totals.other)}`);
  console.log("\n  " + DIV);
  console.log(`  GRAND TOTAL          : ${formatRand(totals.grandTotal)}`);
  console.log(DIV2);
}

// ============================================================
// PDF EXPORT
// ============================================================
function exportPDF(jobSettings) {
  const { totals, transportCost } = buildTotals(jobSettings);
  const masterPanels = buildMasterCutList(job.cabinets.map(c => ({ label:c.label, panels:c.cutList })));

  const payload = {
    job:           { name: job.name },
    cabinets:      job.cabinets,
    totals,
    transport:     jobSettings.transport ? transportCost : null,
    masterCutList: masterPanels,
  };

  mkdirSync("./output", { recursive:true });
  const jsonPath = "./output/job_data.json";
  const pdfPath  = `./output/${job.name.replace(/\s+/g, "_")}_Quote.pdf`;
  writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

  console.log("\n  Generating PDF...");
  try {
    execSync(`python pdf/generatePDF.py "${jsonPath}" "${pdfPath}"`, { stdio:"inherit" });
    console.log(`\n  PDF saved: ${pdfPath}`);
  } catch (err) {
    console.error("  PDF generation failed:", err.message);
  }
}

// ============================================================
// MAIN LOOP
// ============================================================
async function main() {
  console.clear();
  console.log(DIV2);
  console.log("       CABINET QUOTING ENGINE — JOB SESSION");
  console.log(DIV2);

  const jobSettings = await collectJobSettings();
  let num = 1;

  while (true) {
    const cabinet = await collectCabinet(jobSettings, num);
    job.cabinets.push(cabinet);

    console.log("\n" + DIV);
    console.log(`  Cabinet ${num} added — ${cabinet.label}`);
    console.log(`  Cabinet total: ${formatRand(cabinet.quote.summary.grandTotal)}`);
    console.log(DIV);

    const running = job.cabinets.reduce((s, c) => s + c.quote.summary.grandTotal, 0);
    console.log(`\n  Running total (${job.cabinets.length} cabinet${job.cabinets.length > 1 ? "s" : ""}): ${formatRand(running)}`);

    if (!await askYN("\n  Add another cabinet?")) break;
    num++;
  }

  printJobSummary(jobSettings);

  if (await askYN("\n  Print cutting list?"))    {
    for (const cab of job.cabinets) printCutList(`${cab.label} ×${cab.numUnits}`, cab.cutList);
    printMasterCutList(buildMasterCutList(job.cabinets.map(c => ({ label:c.label, panels:c.cutList }))));
  }
  if (await askYN("  Print hardware lists?"))   job.cabinets.forEach(c => printHardwareList(c.label, c.hardware));
  if (await askYN("  Export PDF?"))              exportPDF(jobSettings);

  console.log("\n  Done.\n");
  rl.close();
}

main().catch(err => { console.error("\nError:", err.message); rl.close(); });
