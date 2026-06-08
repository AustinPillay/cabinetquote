// ============================================================
// cuttingList.js
// Generates actual cut sizes for every panel in a cabinet.
// All sizes include board thickness deductions.
// This is what gets handed to the person at the saw.
// ============================================================

// Standard board thickness in mm
export const BOARD_THICKNESS = 16;

// Rail height is always fixed
const RAIL_HEIGHT = 70;

// Door gap allowances (mm)
const DOOR_GAP_SIDE   = 2;   // gap on each side of door opening
const DOOR_GAP_HEIGHT = 2;   // gap top and bottom
const DOOR_MIDDLE_GAP = 3;   // gap between double doors

// Edging codes (matches what the spreadsheet uses)
// 1L  = one long edge
// 1S  = one short edge
// EAR = all 4 edges (doors)
// NONE = no edging
// 1L 2S = one long edge + two short edges (e.g. shelves)
// 1S 2L = one short edge + two long edges (e.g. rails)
// 1L 1S = one long edge + one short edge (e.g. base panel)
// 1S 1L = one short edge + one long edge (e.g. top panel)

// ============================================================
// BASE UNIT CUTTING LIST
// ============================================================
export function baseUnitCutList({
  widthMM,
  depthMM,
  heightMM,
  numberOfShelves = 1,
  numberOfDoors   = 1,
  hasSeenEnd      = false,
  hasMasonite     = true,
  hasBackBoard    = false,
  t               = BOARD_THICKNESS,
}) {
  const panels = [];
  const innerWidth = widthMM - (2 * t);   // width minus 2 side panels
  const innerHeight = heightMM - (2 * t); // height minus top and bottom panels

  // ---- CARCASS ----
  panels.push({
    panel:   "Sides",
    width:   depthMM,
    height:  heightMM,
    qty:     2,
    edging:  "1L",
    note:    "Full depth × full height",
  });

  panels.push({
    panel:   "Base",
    width:   innerWidth,
    height:  depthMM,
    qty:     1,
    edging:  "1L",
    note:    "Width − 2× thickness",
  });

  panels.push({
    panel:   "Rails",
    width:   innerWidth,
    height:  RAIL_HEIGHT,
    qty:     4,
    edging:  "1L",
    note:    "Top front + back, bottom front + back",
  });

  // Shelves
  for (let i = 1; i <= numberOfShelves; i++) {
    panels.push({
      panel:   `Shelf ${i}`,
      width:   innerWidth,
      height:  depthMM - t,    // depth minus back board
      qty:     1,
      edging:  "1L",
      note:    "Width − 2T, Depth − 1T (clears back board)",
    });
  }

  // ---- EXTERNALS ----
  if (numberOfDoors > 0) {
    const totalDoorWidth = widthMM - (2 * DOOR_GAP_SIDE) - ((numberOfDoors - 1) * DOOR_MIDDLE_GAP);
    const doorWidth      = Math.floor(totalDoorWidth / numberOfDoors);
    const doorHeight     = heightMM - (2 * DOOR_GAP_HEIGHT);
    const innerDepth     = depthMM - t; // depth minus back board
    
    panels.push({
      panel:   "Doors",
      width:   doorWidth,
      height:  doorHeight,
      qty:     numberOfDoors,
      edging:  "EAR",
      note:    "(Width − gaps) ÷ doors, Height − gaps",
    });
  }

  if (hasSeenEnd) {
    panels.push({
      panel:   "End Panel",
      width:   depthMM + t,   // depth + one thickness for front overlap
      height:  heightMM,
      qty:     1,
      edging:  "1L",
      note:    "Depth + 1T to overlap front edge",
    });
  }

  if (hasMasonite) {
    panels.push({
      panel:   "Masonite",
      width:   widthMM - 4,   // reduce width by 4mm to fit inside sides
      height:  heightMM - 4,  // reduce height by 4mm to fit inside top/base
      qty:     1,
      edging:  "NONE",
      note:    "Full size, no edging",
    });
  }

  if (hasBackBoard) {
    panels.push({
      panel:   "Back Board",
      width:   innerWidth,
      height:  innerHeight,
      qty:     1,
      edging:  "1S",
      note:    "Width − 2T, Height − 1T (sits on base)",
    });
  }

  return panels;
}

// ============================================================
// WALL UNIT CUTTING LIST
// ============================================================
export function wallUnitCutList({
  widthMM,
  depthMM,
  heightMM,
  numberOfShelves = 1,
  numberOfDoors   = 1,
  hasSeenEnd      = false,
  hasMasonite     = true,
  hasBackBoard    = false,
  t               = BOARD_THICKNESS,
}) {
  const panels = [];
  const innerWidth = widthMM - (2 * t);
  const innerHeight = heightMM - (2 * t);
  const innerDepth = depthMM - t; // depth minus back board
  const doorHeightWithGrip = doorHeight + 18; // add 16mm past carcass for finger grip

  // ---- CARCASS ----
  panels.push({
    panel:  "Sides",
    width:  depthMM,
    height: heightMM,
    qty:    2,
    edging: "1L",
    note:   "Full depth × full height",
  });

  // Wall units have both a top and bottom panel
  panels.push({
    panel:  "Base & Top",
    width:  innerWidth,
    height: depthMM,
    qty:    2,
    edging: "1L",
    note:   "Width − 2T",
  });

  panels.push({
    panel:  "Rails",
    width:  innerWidth,
    height: RAIL_HEIGHT,
    qty:    2,
    edging: "1L",
    note:   "Top front + back rails",
  });

  for (let i = 1; i <= numberOfShelves; i++) {
    panels.push({
      panel:  `Shelf ${i}`,
      width:  innerWidth,
      height: innerDepth,
      qty:    1,
      edging: "1L",
      note:   "Width − 2T, Depth − 1T",
    });
  }

  // ---- EXTERNALS ----
  if (numberOfDoors > 0) {
    const totalDoorWidth = widthMM - (2 * DOOR_GAP_SIDE) - ((numberOfDoors - 1) * DOOR_MIDDLE_GAP);
    const doorWidth      = Math.floor(totalDoorWidth / numberOfDoors);
    const doorHeight     = heightMM - (2 * DOOR_GAP_HEIGHT);
    panels.push({
      panel:  "Doors",
      width:  doorWidth,
      height: doorHeight,
      qty:    numberOfDoors,
      edging: "EAR",
      note:   "(Width − gaps) ÷ doors, Height − gaps",
    });
  }

  if (hasSeenEnd) {
    panels.push({
      panel:  "End Panel",
      width:  depthMM + t,
      height: heightMM,
      qty:    1,
      edging: "1L",
      note:   "Depth + 1T",
    });
  }

  if (hasMasonite) {
    panels.push({
      panel:  "Masonite",
      width:  widthMM - 4,   // reduce width by 4mm to fit inside sides
      height: heightMM - 4,  // reduce height by 4mm to fit inside top/base
      qty:    1,
      edging: "NONE",
      note:   "Full size",
    });
  }

  if (hasBackBoard) {
    panels.push({
      panel:  "Back Board",
      width:  innerWidth,
      height: innerHeight,
      qty:    1,
      edging: "1S",
      note:   "Width − 2T, Height − 1T",
    });
  }

  return panels;
}

// ============================================================
// TALL UNIT CUTTING LIST
// ============================================================
export function tallUnitCutList({
  widthMM,
  depthMM,
  heightMM,
  numberOfShelves = 3,
  numberOfDoors   = 1,
  hasSeenEnd      = false,
  hasMasonite     = false,
  hasBackBoard    = true,
  t               = BOARD_THICKNESS,
}) {
  const panels = [];
  const innerWidth = widthMM - (2 * t);

  panels.push({
    panel:  "Sides",
    width:  depthMM,
    height: heightMM,
    qty:    2,
    edging: "1L",
    note:   "Full depth × full height",
  });

  panels.push({
    panel:  "Base & Top",
    width:  innerWidth,
    height: depthMM,
    qty:    2,
    edging: "1L",
    note:   "Width − 2T",
  });

  panels.push({
    panel:  "Rails",
    width:  innerWidth,
    height: RAIL_HEIGHT,
    qty:    2,
    edging: "1L",
    note:   "Top front + back rails",
  });

  for (let i = 1; i <= numberOfShelves; i++) {
    panels.push({
      panel:  `Shelf ${i}`,
      width:  innerWidth,
      height: depthMM - t,
      qty:    1,
      edging: "1L",
      note:   "Width − 2T, Depth − 1T",
    });
  }

  if (numberOfDoors > 0) {
    const totalDoorWidth = widthMM - (2 * DOOR_GAP_SIDE) - ((numberOfDoors - 1) * DOOR_MIDDLE_GAP);
    const doorWidth      = Math.floor(totalDoorWidth / numberOfDoors);
    const doorHeight     = heightMM - (2 * DOOR_GAP_HEIGHT);
    panels.push({
      panel:  "Doors",
      width:  doorWidth,
      height: doorHeight,
      qty:    numberOfDoors,
      edging: "EAR",
      note:   "(Width − gaps) ÷ doors, Height − gaps",
    });
  }

  if (hasSeenEnd) {
    panels.push({
      panel:  "End Panel",
      width:  depthMM + t,
      height: heightMM,
      qty:    1,
      edging: "1L",
      note:   "Depth + 1T",
    });
  }

  if (hasMasonite) {
    panels.push({
      panel:  "Masonite",
      width:  widthMM,
      height: heightMM,
      qty:    1,
      edging: "NONE",
      note:   "Full size",
    });
  }

  if (hasBackBoard) {
    panels.push({
      panel:  "Back Board",
      width:  innerWidth,
      height: heightMM - t,
      qty:    1,
      edging: "1S",
      note:   "Width − 2T, Height − 1T",
    });
  }

  return panels;
}

// ============================================================
// DISPATCHER — pick the right cut list function by unit type
// ============================================================
export function generateCutList(unitType, cabinetSpec) {
  switch (unitType) {
    case "wall": return wallUnitCutList(cabinetSpec);
    case "tall": return tallUnitCutList(cabinetSpec);
    default:     return baseUnitCutList(cabinetSpec);
  }
}

// ============================================================
// MERGE — combine all cabinets into one master cut list
// Groups identical panel sizes together and sums quantities.
// This is what you hand to the saw operator.
// ============================================================
export function buildMasterCutList(cabinetCutLists) {
  const map = new Map();

  for (const { label, panels } of cabinetCutLists) {
    for (const panel of panels) {
      // Key = panel name + dimensions + edging (groups identical cuts)
      const key = `${panel.panel}|${panel.width}|${panel.height}|${panel.edging}`;

      if (map.has(key)) {
        const existing = map.get(key);
        existing.qty      += panel.qty;
        existing.cabinets.push(label);
      } else {
        map.set(key, {
          panel:    panel.panel,
          width:    panel.width,
          height:   panel.height,
          edging:   panel.edging,
          qty:      panel.qty,
          cabinets: [label],
        });
      }
    }
  }

  // Sort: panel type alphabetically, then by size
  return [...map.values()].sort((a, b) =>
    a.panel.localeCompare(b.panel) || b.width - a.width
  );
}

// ============================================================
// PRINT — formatted cut list for terminal output
// ============================================================
export function printCutList(label, panels) {
  const DIV = "─".repeat(68);
  console.log("\n" + DIV);
  console.log(`  CUTTING LIST — ${label.toUpperCase()}`);
  console.log(DIV);
  console.log(
    `  ${"PANEL".padEnd(14)} ${"WIDTH".padStart(6)} ${"HEIGHT".padStart(7)} ${"QTY".padStart(5)}  ${"EDGING".padEnd(6)}  NOTE`
  );
  console.log(DIV);
  for (const p of panels) {
    console.log(
      `  ${p.panel.padEnd(14)} ${String(p.width).padStart(6)} ${String(p.height).padStart(7)} ${String(p.qty).padStart(5)}  ${p.edging.padEnd(6)}  ${p.note || ""}`
    );
  }
  console.log(DIV);
}

export function printMasterCutList(panels) {
  const DIV = "─".repeat(68);
  console.log("\n" + "═".repeat(68));
  console.log("  MASTER CUTTING LIST — ALL CABINETS COMBINED");
  console.log("═".repeat(68));
  console.log(
    `  ${"PANEL".padEnd(14)} ${"WIDTH".padStart(6)} ${"HEIGHT".padStart(7)} ${"QTY".padStart(5)}  ${"EDGING".padEnd(6)}  CABINETS`
  );
  console.log(DIV);

  let totalPanels = 0;
  for (const p of panels) {
    totalPanels += p.qty;
    console.log(
      `  ${p.panel.padEnd(14)} ${String(p.width).padStart(6)} ${String(p.height).padStart(7)} ${String(p.qty).padStart(5)}  ${p.edging.padEnd(6)}  ${p.cabinets.join(", ")}`
    );
  }

  console.log(DIV);
  console.log(`  Total panels to cut: ${totalPanels}`);
  console.log("═".repeat(68) + "\n");
}
