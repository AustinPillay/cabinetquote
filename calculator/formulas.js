// ============================================================
// formulas.js
// Pure calculation functions.
// No business logic. No rules. Just math.
// Every formula here maps directly to a cell in the spreadsheet.
// ============================================================

// ------------------------------------------------------------
// SHEET & MATERIAL COST
// ------------------------------------------------------------

/**
 * Calculate the area of one sheet in square metres.
 * Spreadsheet: AREA OF SHEET = (2750 * 1830) / 1,000,000
 */
export function sheetAreaSqm(widthMM, heightMM) {
  return (widthMM * heightMM) / 1_000_000;
}

/**
 * Cost per square metre for a given material.
 * Spreadsheet: COST PER SQ METER = COST PER SHEET / AREA OF SHEET
 */
export function costPerSqm(sheetCostRand, sheetAreaSqmValue) {
  return sheetCostRand / sheetAreaSqmValue;
}

/**
 * Number of sheets needed for a given total area.
 * Spreadsheet: # OF SHEETS = TOTAL AREA / AREA OF SHEET
 */
export function sheetsNeeded(totalAreaSqm, sheetAreaSqmValue) {
  return totalAreaSqm / sheetAreaSqmValue;
}

/**
 * Raw board cost before wastage.
 * Spreadsheet: COST = TOTAL AREA * COST PER SQ METER
 */
export function boardCost(totalAreaSqm, costPerSqmValue) {
  return totalAreaSqm * costPerSqmValue;
}

// ------------------------------------------------------------
// WASTAGE
// ------------------------------------------------------------

/**
 * Apply wastage percentage to a cost.
 * Spreadsheet: PLUS WASTAGE = BOARD TOTAL COST * (1 + 0.20)
 * Default wastage is 20%.
 */
export function applyWastage(cost, wastageRate = 0.20) {
  return cost * (1 + wastageRate);
}

// ------------------------------------------------------------
// EDGING
// ------------------------------------------------------------

/**
 * Total edging cost for a set of parts.
 * Spreadsheet: EDGING COST = TOTAL EDGING (metres) * EDGING COST PER METRE
 */
export function edgingCost(totalEdgingMetres, edgingCostPerMetre) {
  return totalEdgingMetres * edgingCostPerMetre;
}

// ------------------------------------------------------------
// PART AREA
// ------------------------------------------------------------

/**
 * Area of a single rectangular panel in square metres.
 * Used for sides, bases, doors, shelves, etc.
 */
export function panelAreaSqm(widthMM, heightMM) {
  return (widthMM * heightMM) / 1_000_000;
}

/**
 * Total area for a quantity of identical panels.
 */
export function totalPanelArea(panelAreaSqmValue, quantity) {
  return panelAreaSqmValue * quantity;
}

// ------------------------------------------------------------
// LABOUR
// ------------------------------------------------------------

/**
 * Labour cost using fixed rate per linear metre of cabinet.
 * Spreadsheet: FIXED RATE PER METER = R310/m
 */
export function labourFixedRate(totalLinearMetres, ratePerMetre = 310) {
  return totalLinearMetres * ratePerMetre;
}

/**
 * Labour cost using time-based calculation.
 * Spreadsheet: LABOUR COST = TOTAL TIME * HOURLY RATE * NUMBER OF PEOPLE
 */
export function labourTimeBased(totalHours, hourlyRate, numberOfPeople) {
  return totalHours * hourlyRate * numberOfPeople;
}

// ------------------------------------------------------------
// TRANSPORT
// ------------------------------------------------------------

/**
 * Total fuel cost for delivery.
 * Spreadsheet:
 *   TOTAL DISTANCE = DISTANCE * NUMBER OF TRIPS * 2 (there and back)
 *   COMBINED CONSUMPTION = AVERAGE CONSUMPTION * NUMBER OF VEHICLES
 *   TOTAL FUEL COST = (TOTAL DISTANCE / 100) * COMBINED CONSUMPTION * FUEL PRICE
 */
export function transportCost({
  distanceKm,
  numberOfVehicles,
  numberOfTrips,
  avgConsumptionLitersPer100Km = 20,
  fuelPriceRandPerLiter = 25,
}) {
  const totalDistanceKm         = distanceKm * numberOfTrips * 2;
  const combinedConsumption     = avgConsumptionLitersPer100Km * numberOfVehicles;
  const totalFuelCost           = (totalDistanceKm / 100) * combinedConsumption * fuelPriceRandPerLiter;
  return totalFuelCost;
}

// ------------------------------------------------------------
// PROFIT, COMMISSION, OTHER
// ------------------------------------------------------------

/**
 * Profit markup on board cost (after wastage).
 * Spreadsheet: PROFIT = BOARD TOTAL (with wastage) * 0.30
 */
export function profitAmount(boardCostWithWastage, profitRate = 0.30) {
  return boardCostWithWastage * profitRate;
}

/**
 * Commission on board cost (after wastage).
 * Spreadsheet: COMMISSION = BOARD TOTAL (with wastage) * 0.10
 */
export function commissionAmount(boardCostWithWastage, commissionRate = 0.10) {
  return boardCostWithWastage * commissionRate;
}

/**
 * Other costs (default = same rate as commission).
 * Spreadsheet: OTHER = BOARD TOTAL (with wastage) * 0.10
 */
export function otherAmount(boardCostWithWastage, otherRate = 0.10) {
  return boardCostWithWastage * otherRate;
}

// ------------------------------------------------------------
// GRAND TOTAL
// ------------------------------------------------------------

/**
 * Final quotation total.
 * Spreadsheet: TOTAL = board(wastage) + hardware + labour + consumables
 *                    + transport + profit + commission + other
 */
export function grandTotal({
  boardCostWithWastage,
  hardwareCost,
  labourCost,
  consumablesCost = 0,
  transportCostValue = 0,
  profit,
  commission,
  other,
}) {
  return (
    boardCostWithWastage +
    hardwareCost +
    labourCost +
    consumablesCost +
    transportCostValue +
    profit +
    commission +
    other
  );
}

// ------------------------------------------------------------
// FORMATTING HELPER
// ------------------------------------------------------------

/**
 * Format a number as South African Rand.
 */
export function formatRand(amount) {
  return `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
