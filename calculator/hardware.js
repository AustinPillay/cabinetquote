// ============================================================
// hardware.js
// Hardware price list and calculation rules.
// Takes cabinet specs, returns itemised hardware list + total.
// ============================================================

// ============================================================
// PRICE LIST
// Update prices here only — nothing else needs to change.
// ============================================================
export const hardwarePrices = {

  // ---- HINGES ----
  hingeSoftClose: {
    label:       "Soft Close Hinge",
    unitPrice:   8,          // R per hinge (R1600 box / 200)
    unit:        "each",
  },
  hingeNormal: {
    label:       "Normal Hinge",
    unitPrice:   5.75,       // R per hinge (R1150 box / 200)
    unit:        "each",
  },

  // ---- DRAWER RUNNERS ----
  runnerSoftClose400: {
    label:       "Soft Close Runner 400mm",
    unitPrice:   85,         // R per pair
    unit:        "pair",
  },
  runnerSoftClose500: {
    label:       "Soft Close Runner 500mm",
    unitPrice:   95,
    unit:        "pair",
  },
  runnerSoftClose600: {
    label:       "Soft Close Runner 600mm",
    unitPrice:   100,
    unit:        "pair",
  },

  // ---- HANDLES ----
  handle196mm: {
    label:       "Handle 196mm",
    unitPrice:   45,
    unit:        "each",
  },
  handle128mm: {
    label:       "Handle 128mm",
    unitPrice:   35,
    unit:        "each",
  },
  handleGola: {
    label:       "Gola Profile (3m length)",
    unitPrice:   250,
    unit:        "length",
    lengthMM:    3000,
  },

  // ---- HANGING RAILS (bedroom/wardrobe) ----
  hangingRail: {
    label:       "Hanging Rail (per metre)",
    unitPrice:   55,
    unit:        "metre",
  },
  hangingRailBracket: {
    label:       "Hanging Rail Bracket",
    unitPrice:   15,
    unit:        "each",
  },

  // ---- SHELF SUPPORTS ----
  shelfPin: {
    label:       "Shelf Support Pin",
    unitPrice:   2,
    unit:        "each",
  },

  // ---- CABINET CONNECTORS ----
  cabinetScrew: {
    label:       "Cabinet Screw (box 200)",
    unitPrice:   45,
    unit:        "box",
  },
  confirmat: {
    label:       "Confirmat Screw (box 100)",
    unitPrice:   35,
    unit:        "box",
  },

  // ---- BACK PANEL ----
  backPanelClip: {
    label:       "Back Panel Clip",
    unitPrice:   3,
    unit:        "each",
  },
};

// ============================================================
// HARDWARE RULES
// These determine how many of each item a cabinet needs.
// ============================================================

// How many hinges per door based on door height
function hingesPerDoor(doorHeightMM) {
  if (doorHeightMM > 1800) return 4;
  if (doorHeightMM > 1200) return 3;
  return 2;
}

// Which runner size fits a given cabinet depth
function runnerKey(depthMM) {
  if (depthMM <= 420) return "runnerSoftClose400";
  if (depthMM <= 520) return "runnerSoftClose500";
  return "runnerSoftClose600";
}

// Gola profile: how many 3m lengths needed for a given total width
function golaLengths(totalWidthMM) {
  return Math.ceil(totalWidthMM / 3000);
}

// ============================================================
// GENERATE HARDWARE LIST FOR ONE CABINET
// ============================================================
export function generateHardware(cabinet) {
  const {
    unitType,
    widthMM,
    depthMM,
    heightMM,
    numUnits        = 1,
    numberOfDoors   = 1,
    numberOfDrawers = 0,
    hingeType       = "softClose",    // "softClose" | "normal"
    handleType      = "handle196mm",  // key from hardwarePrices
    hasHangingRail  = false,
    shelvesPerUnit  = 1,
  } = cabinet;

  const items = [];

  const totalDoors   = numberOfDoors   * numUnits;
  const totalDrawers = numberOfDrawers * numUnits;

  // ---- DOOR HEIGHT (for hinge count) ----
  // Door height = cabinet height - 4mm gap
  const doorHeightMM = heightMM - 4;

  // ---- HINGES ----
  if (totalDoors > 0) {
    const hingeKey   = hingeType === "normal" ? "hingeNormal" : "hingeSoftClose";
    const hingePrice = hardwarePrices[hingeKey];
    const qtyPerDoor = hingesPerDoor(doorHeightMM);
    const totalHinges = qtyPerDoor * totalDoors;

    items.push({
      item:      hingePrice.label,
      qty:       totalHinges,
      unit:      hingePrice.unit,
      unitPrice: hingePrice.unitPrice,
      total:     totalHinges * hingePrice.unitPrice,
      note:      `${qtyPerDoor} per door × ${totalDoors} doors`,
    });
  }

  // ---- DRAWER RUNNERS ----
  if (totalDrawers > 0) {
    const rKey    = runnerKey(depthMM);
    const runner  = hardwarePrices[rKey];
    items.push({
      item:      runner.label,
      qty:       totalDrawers,
      unit:      runner.unit,
      unitPrice: runner.unitPrice,
      total:     totalDrawers * runner.unitPrice,
      note:      `1 pair per drawer × ${totalDrawers} drawers`,
    });
  }

  // ---- HANDLES ----
  const totalHandles = totalDoors + totalDrawers;
  if (totalHandles > 0 && handleType !== "gola") {
    const handle = hardwarePrices[handleType];
    if (handle) {
      items.push({
        item:      handle.label,
        qty:       totalHandles,
        unit:      handle.unit,
        unitPrice: handle.unitPrice,
        total:     totalHandles * handle.unitPrice,
        note:      `${totalDoors} doors + ${totalDrawers} drawers`,
      });
    }
  }

  // ---- GOLA PROFILE (if selected instead of handles) ----
  if (handleType === "gola") {
    const totalWidthMM = widthMM * numUnits;
    const lengths      = golaLengths(totalWidthMM);
    const gola         = hardwarePrices.handleGola;
    items.push({
      item:      gola.label,
      qty:       lengths,
      unit:      gola.unit,
      unitPrice: gola.unitPrice,
      total:     lengths * gola.unitPrice,
      note:      `${(totalWidthMM / 1000).toFixed(2)}m run, ${lengths}× 3m lengths`,
    });
  }

  // ---- SHELF PINS ----
  const totalShelves = shelvesPerUnit * numUnits;
  if (totalShelves > 0) {
    const pinsPerShelf = 4;
    const totalPins    = totalShelves * pinsPerShelf;
    const pin          = hardwarePrices.shelfPin;
    items.push({
      item:      pin.label,
      qty:       totalPins,
      unit:      pin.unit,
      unitPrice: pin.unitPrice,
      total:     totalPins * pin.unitPrice,
      note:      `4 pins per shelf × ${totalShelves} shelves`,
    });
  }

  // ---- HANGING RAIL (wardrobes) ----
  if (hasHangingRail) {
    const totalWidthM  = (widthMM / 1000) * numUnits;
    const rail         = hardwarePrices.hangingRail;
    const bracket      = hardwarePrices.hangingRailBracket;
    const brackets     = numUnits * 2 + Math.floor(numUnits / 2); // 2 end + mid brackets

    items.push({
      item:      rail.label,
      qty:       parseFloat(totalWidthM.toFixed(2)),
      unit:      rail.unit,
      unitPrice: rail.unitPrice,
      total:     totalWidthM * rail.unitPrice,
      note:      `${totalWidthM.toFixed(2)}m total`,
    });
    items.push({
      item:      bracket.label,
      qty:       brackets,
      unit:      bracket.unit,
      unitPrice: bracket.unitPrice,
      total:     brackets * bracket.unitPrice,
      note:      "End + mid supports",
    });
  }

  // ---- SCREWS (1 box per cabinet) ----
  const screw = hardwarePrices.cabinetScrew;
  items.push({
    item:      screw.label,
    qty:       numUnits,
    unit:      screw.unit,
    unitPrice: screw.unitPrice,
    total:     numUnits * screw.unitPrice,
    note:      "1 box per cabinet",
  });

  // ---- GRAND TOTAL ----
  const hardwareTotal = items.reduce((sum, i) => sum + i.total, 0);

  return { items, hardwareTotal };
}

// ============================================================
// PRINT — formatted hardware list for terminal
// ============================================================
export function printHardwareList(label, result) {
  const DIV = "─".repeat(68);
  console.log("\n" + DIV);
  console.log(`  HARDWARE — ${label.toUpperCase()}`);
  console.log(DIV);
  console.log(
    `  ${"ITEM".padEnd(28)} ${"QTY".padStart(5)} ${"UNIT PRICE".padStart(12)} ${"TOTAL".padStart(10)}`
  );
  console.log(DIV);
  for (const i of result.items) {
    console.log(
      `  ${i.item.padEnd(28)} ${String(i.qty).padStart(5)} ` +
      `${"R" + i.unitPrice.toFixed(2).padStart(11)} ` +
      `${"R" + i.total.toFixed(2).padStart(9)}` +
      `  (${i.note})`
    );
  }
  console.log(DIV);
  console.log(`  ${"Hardware Total".padEnd(28)} ${"".padStart(5)} ${"".padStart(12)} ${"R" + result.hardwareTotal.toFixed(2).padStart(9)}`);
  console.log(DIV);
}
