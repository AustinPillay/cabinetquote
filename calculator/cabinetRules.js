// ============================================================
// cabinetRules.js
// Manufacturing intelligence.
// Each function takes cabinet dimensions and returns a parts list.
// Parts list feeds directly into the calculation engine.
// ============================================================

// ------------------------------------------------------------
// STANDARD RAIL HEIGHT
// Used for top and bottom rails inside all cabinet types.
// ------------------------------------------------------------
const RAIL_HEIGHT_MM = 70;

// ------------------------------------------------------------
// BASE UNIT
// Standard floor-standing kitchen/bedroom cabinet.
// Parts: 2x sides, 1x bottom, 4x rails (top), 1x shelf (optional)
// ------------------------------------------------------------
export function generateBaseUnitParts(cabinet) {
  const { widthMM, depthMM, heightMM, numberOfShelves = 1 } = cabinet;

  const parts = [
    {
      name:     "Side",
      widthMM:  depthMM,
      heightMM: heightMM,
      qty:      2,
      edgeType: "front",       // Edge the front-facing long edge
    },
    {
      name:     "Bottom Panel",
      widthMM:  widthMM,
      heightMM: depthMM,
      qty:      1,
      edgeType: "front",
    },
    {
      name:     "Top Rail",
      widthMM:  widthMM,
      heightMM: RAIL_HEIGHT_MM,
      qty:      2,
      edgeType: "front",
    },
    {
      name:     "Back Rail",
      widthMM:  widthMM,
      heightMM: RAIL_HEIGHT_MM,
      qty:      2,
      edgeType: "none",        // Back rail not visible, no edging
    },
  ];

  // Add shelves
  for (let i = 0; i < numberOfShelves; i++) {
    parts.push({
      name:     `Shelf ${i + 1}`,
      widthMM:  widthMM,
      heightMM: depthMM,
      qty:      1,
      edgeType: "front",
    });
  }

  return parts;
}

// ------------------------------------------------------------
// WALL UNIT
// Wall-mounted cabinet. No kickplate. Has top and bottom panels.
// Parts: 2x sides, 1x top, 1x bottom, 2x rails, shelves
// ------------------------------------------------------------
export function generateWallUnitParts(cabinet) {
  const { widthMM, depthMM, heightMM, numberOfShelves = 1 } = cabinet;

  const parts = [
    {
      name:     "Side",
      widthMM:  depthMM,
      heightMM: heightMM,
      qty:      2,
      edgeType: "front",
    },
    {
      name:     "Bottom Panel",
      widthMM:  widthMM,
      heightMM: depthMM,
      qty:      1,
      edgeType: "front",
    },
    {
      name:     "Top Panel",
      widthMM:  widthMM,
      heightMM: depthMM,
      qty:      1,
      edgeType: "front",
    },
    {
      name:     "Top Rail",
      widthMM:  widthMM,
      heightMM: RAIL_HEIGHT_MM,
      qty:      1,
      edgeType: "front",
    },
    {
      name:     "Back Rail",
      widthMM:  widthMM,
      heightMM: RAIL_HEIGHT_MM,
      qty:      1,
      edgeType: "none",
    },
  ];

  for (let i = 0; i < numberOfShelves; i++) {
    parts.push({
      name:     `Shelf ${i + 1}`,
      widthMM:  widthMM,
      heightMM: depthMM,
      qty:      1,
      edgeType: "front",
    });
  }

  return parts;
}

// ------------------------------------------------------------
// TALL UNIT
// Floor-to-ceiling cabinet (pantry, broom cupboard, etc.)
// Taller than base, full height, multiple shelves.
// ------------------------------------------------------------
export function generateTallUnitParts(cabinet) {
  const { widthMM, depthMM, heightMM, numberOfShelves = 3 } = cabinet;

  const parts = [
    {
      name:     "Side",
      widthMM:  depthMM,
      heightMM: heightMM,
      qty:      2,
      edgeType: "front",
    },
    {
      name:     "Bottom Panel",
      widthMM:  widthMM,
      heightMM: depthMM,
      qty:      1,
      edgeType: "front",
    },
    {
      name:     "Top Panel",
      widthMM:  widthMM,
      heightMM: depthMM,
      qty:      1,
      edgeType: "front",
    },
    {
      name:     "Top Rail",
      widthMM:  widthMM,
      heightMM: RAIL_HEIGHT_MM,
      qty:      1,
      edgeType: "front",
    },
    {
      name:     "Back Rail",
      widthMM:  widthMM,
      heightMM: RAIL_HEIGHT_MM,
      qty:      1,
      edgeType: "none",
    },
  ];

  for (let i = 0; i < numberOfShelves; i++) {
    parts.push({
      name:     `Shelf ${i + 1}`,
      widthMM:  widthMM,
      heightMM: depthMM,
      qty:      1,
      edgeType: "front",
    });
  }

  return parts;
}

// ------------------------------------------------------------
// EXTERNAL PARTS
// Doors, seen ends, capping, skirting — uses external material.
// These are calculated separately from carcass.
// ------------------------------------------------------------
export function generateExternalParts(cabinet) {
  const {
    widthMM,
    depthMM,
    heightMM,
    numberOfDoors    = 1,
    hasSeenEnd       = false,
    hasCapping       = false,
    hasSkirting      = false,
    cappingHeightMM  = 100,
    skirtingHeightMM = 100,
  } = cabinet;

  const parts = [];

  // Doors: split width evenly across number of doors
  if (numberOfDoors > 0) {
    const doorWidthMM = widthMM / numberOfDoors;
    parts.push({
      name:     "Door",
      widthMM:  doorWidthMM,
      heightMM: heightMM,
      qty:      numberOfDoors,
      edgeType: "all",         // Doors are edged on all 4 sides
    });
  }

  // Seen end: the visible side panel (external face)
  if (hasSeenEnd) {
    parts.push({
      name:     "Seen End",
      widthMM:  depthMM,
      heightMM: heightMM,
      qty:      1,
      edgeType: "front",
    });
  }

  // Capping: top strip above wall units
  if (hasCapping) {
    parts.push({
      name:     "Capping",
      widthMM:  widthMM,
      heightMM: cappingHeightMM,
      qty:      1,
      edgeType: "front",
    });
  }

  // Skirting: bottom strip below base units
  if (hasSkirting) {
    parts.push({
      name:     "Skirting",
      widthMM:  widthMM,
      heightMM: skirtingHeightMM,
      qty:      1,
      edgeType: "front",
    });
  }

  return parts;
}

// ------------------------------------------------------------
// BACK BOARD
// Optional. Adds a back panel to any cabinet.
// Uses back board material (cheaper, thinner).
// ------------------------------------------------------------
export function generateBackBoard(cabinet) {
  const { widthMM, heightMM } = cabinet;

  return [
    {
      name:     "Back Board",
      widthMM:  widthMM,
      heightMM: heightMM,
      qty:      1,
      edgeType: "none",
    },
  ];
}

// ------------------------------------------------------------
// EDGING CALCULATOR
// Given a part and the cabinet dimensions, returns edging in metres.
// "front"  = one long edge only (front-facing)
// "all"    = all 4 edges (doors)
// "none"   = no edging
// ------------------------------------------------------------
export function calculatePartEdging(part) {
  const { widthMM, heightMM, qty, edgeType } = part;
  const widthM  = widthMM  / 1000;
  const heightM = heightMM / 1000;

  let edgingPerPart = 0;

  switch (edgeType) {
    case "front":
      // Edge only the front-facing dimension
      // For vertical parts (sides): front edge = height
      // For horizontal parts (base, shelf, rail): front edge = width
      edgingPerPart = widthM > heightM ? widthM : heightM;
      break;

    case "all":
      // All 4 edges (doors)
      edgingPerPart = 2 * (widthM + heightM);
      break;

    case "none":
    default:
      edgingPerPart = 0;
  }

  return edgingPerPart * qty;
}
