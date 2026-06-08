# CABINET BUILDER — FILE BREAKDOWN GUIDE

---

## WHERE TO SAVE IT

Save the file exactly here:

```
cabinet-engine/
    cabinet-builder.html    ← save here
    index.js
    package.json
    calculator/
        materials.js
        formulas.js
        cabinetRules.js
        pricing.js
        cuttingList.js
        hardware.js
    database/
        setupDB.py
        priceManager.py
        queryDB.py
        db.js
        cabinet.db
    pdf/
        generatePDF.py
    output/
```

To open it: right-click `cabinet-builder.html` in VS Code → Open with Live Server.

---

## HOW THE FILE IS STRUCTURED

The file has three main sections in this order:

```
1. <head>          ← fonts and styles (CSS)
2. <body>          ← the actual HTML layout
3. <script>        ← the logic and calculations (JavaScript)
```

Never move these around. Edit within each section only.

---

## SECTION 1 — FONTS

**Location:** Inside `<head>`, first few lines

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans..." rel="stylesheet"/>
```

**What it does:** Loads three fonts from Google:
- `Bebas Neue` — used for all big titles and headings
- `DM Mono` — used for all numbers, codes, labels
- `DM Sans` — used for body text and form fields

**To change a font:**
1. Go to fonts.google.com
2. Pick a font, click "Get font" → "Get embed code"
3. Replace the font name in the link above
4. Also update the CSS variable below (see Colours section)

---

## SECTION 2 — CSS VARIABLES (COLOURS & FONTS)

**Location:** Inside `<style>`, at the very top inside `:root { }`

```css
:root {
  --bg:#0c0c0c;       /* Main background — near black        */
  --s1:#141414;       /* Surface 1 — sidebar, cards          */
  --s2:#1a1a1a;       /* Surface 2 — inputs, darker panels   */
  --s3:#222;          /* Surface 3 — deepest panels          */
  --b1:#1f1f1f;       /* Border 1 — subtle dividers          */
  --b2:#2a2a2a;       /* Border 2 — form borders             */
  --b3:#333;          /* Border 3 — stronger borders         */
  --acc:#c8f04a;      /* ACCENT — lime green (main colour)   */
  --acc2:#f0a84a;     /* ACCENT 2 — amber/orange             */
  --acc3:#4ac8f0;     /* ACCENT 3 — blue                     */
  --red:#f05a4a;      /* Red — delete buttons, errors        */
  --grn:#4af07a;      /* Green — success states              */
  --t1:#ebebeb;       /* Text 1 — main readable text         */
  --t2:#999;          /* Text 2 — secondary text             */
  --t3:#555;          /* Text 3 — muted/placeholder text     */
  --ff:'DM Sans',sans-serif;     /* Body font    */
  --fm:'DM Mono',monospace;      /* Mono font    */
  --fd:'Bebas Neue',sans-serif;  /* Display font */
}
```

**To change the colour scheme:**
Just replace the hex codes. Every colour in the app references these variables — change one here and it updates everywhere.

**Example — change accent from lime green to orange:**
```css
--acc:#f0a84a;
```

**Example — make it a light/white theme:**
```css
--bg:#f5f5f5;
--s1:#ffffff;
--s2:#f0f0f0;
--t1:#111111;
--t2:#555;
--t3:#999;
```

---

## SECTION 3 — SIDEBAR

**Location:** Inside `<body>`, `<div class="sidebar">`

### Logo / Business Name
```html
<div class="sb-logo-text">CABINET<span>QUOTE</span></div>
<div class="sb-logo-sub">JOB BUILDER v1.0</div>
```
Change `CABINETQUOTE` to your business name.
Change `JOB BUILDER v1.0` to any subtitle you want.

### Sidebar Navigation Items
The sidebar nav items are generated automatically by the JavaScript — you don't need to edit them manually.

### Calculate Button
```html
<button class="sb-calc-btn" onclick="calculateAll()">CALCULATE JOB</button>
```
Change the button text if you want. Don't change `onclick="calculateAll()"`.

---

## SECTION 4 — PAGES

Each page is a `<div class="page" id="page-XXX">`. Only one shows at a time.

| Page ID           | What it is              |
|-------------------|-------------------------|
| `page-job`        | Job Details / Client    |
| `page-addroom`    | Add / Edit Room         |
| `page-wall`       | Wall & Cabinet Builder  |
| `page-quote`      | Quotation Results       |
| `page-cutlist`    | Cutting List            |
| `page-hardware`   | Hardware List           |
| `page-export`     | Export PDF              |

---

### PAGE: JOB DETAILS (`page-job`)

**Client fields — safe to edit labels:**
```html
<div class="label">Client Name</div>
<div class="label">Phone</div>
<div class="label">Email</div>
<div class="label">Address</div>
<div class="label">Reference / Job No.</div>
```

**Job settings — safe to edit labels and default values:**
```html
<input class="input" id="labourRate" value="310" type="number"/>
<input class="input" id="wastageRate" value="20" type="number"/>
<input class="input" id="profitRate" value="30" type="number"/>
<input class="input" id="commRate" value="10" type="number"/>
```
Change the `value="310"` etc. to set your own defaults.

**⚠ Do not change the `id=""` attributes** — the calculation engine reads these by ID.

---

### PAGE: ADD ROOM (`page-addroom`)

**Room dimension defaults — safe to change:**
```html
<input class="input" id="rCeiling"   value="2400" .../>
<input class="input" id="rPlinth"    value="100"  .../>
<input class="input" id="rBaseTotal" value="880"  .../>
<input class="input" id="rCounter"   value="20"   .../>
<input class="input" id="rWallSpace" value="600"  .../>
<input class="input" id="rCapping"   value="100"  .../>
<input class="input" id="rBaseDepth" value="560"  .../>
<input class="input" id="rWallDepth" value="300"  .../>
```
Change `value="..."` to your most common room dimensions — saves you time on every job.

**⚠ Do not change the `id=""` attributes.**

---

### PAGE: WALL / CABINET BUILDER (`page-wall`)

**Cabinet form — material dropdowns:**
```html
<select class="select" id="cabCarcass">
  <option value="PGB-GW">Gloss White — R2700/sheet</option>
  <option value="PGB-MW">Matte White — R2200/sheet</option>
  ...
```

**To add a new carcass material:**
```html
<option value="YOUR-CODE">Your Material Name — RXX/sheet</option>
```
Then add the matching entry in the JavaScript MATERIALS object (see Section 6 below).

**To change displayed prices in dropdowns:**
Just edit the text after the `—`. The actual price used in calculations comes from the MATERIALS object in the script, not the dropdown text.

**Hinge options:**
```html
<select class="select" id="cabHinge">
  <option value="softClose">Soft Close — R8 each</option>
  <option value="normal">Normal — R5.75 each</option>
</select>
```

**Handle options:**
```html
<select class="select" id="cabHandle">
  <option value="handle192mm">192mm Chrome — R45</option>
  <option value="handle128mm">128mm Chrome — R35</option>
  <option value="handle192mm-blk">192mm Matt Black — R50</option>
  <option value="gola">Gola Profile — R250/3m</option>
  <option value="none">No Handles</option>
</select>
```
Add new options the same way. Update the price in `HANDLE_PRICES` in the script too.

---

### PAGE: EXPORT (`page-export`)

**Export card text — safe to edit:**
```html
<div class="export-title">QUOTATION</div>
<div class="export-desc">Full price breakdown by room...</div>
<div class="export-recipient">Client</div>
```
Change any of this text to match your workflow.

---

## SECTION 5 — CSS STYLES

**Location:** Everything inside `<style>` tags

This controls how every element looks. The classes are named clearly:

| Class             | What it styles                        |
|-------------------|---------------------------------------|
| `.sidebar`        | Left navigation panel                 |
| `.sb-item`        | Sidebar navigation buttons            |
| `.sb-item.active` | Currently selected nav item           |
| `.page`           | Each full page area                   |
| `.card`           | White-bordered content cards          |
| `.btn`            | All buttons                           |
| `.btn.pri`        | Primary (green) buttons               |
| `.btn.danger`     | Red delete buttons                    |
| `.input`          | All text input fields                 |
| `.select`         | All dropdown menus                    |
| `.tog`            | Toggle options (Yes/No etc.)          |
| `.tog.on`         | Selected toggle state                 |
| `.cab-card`       | Cabinet list items                    |
| `.type-badge`     | Base / Wall / Tall coloured tags      |
| `.hchip`          | Height chip display                   |
| `.tbl`            | Tables (cutting list, hardware)       |
| `.grand-total-bar`| The big total strip on quote page     |
| `.export-card`    | The three export option cards         |

**To change button size:**
```css
.btn { padding: 8px 16px; font-size: 10px; }
```

**To change card background:**
```css
.card { background: var(--s1); }
```

**To change sidebar width:**
```css
.sidebar { width: 230px; }
```

---

## SECTION 6 — JAVASCRIPT: PRICES

**Location:** Inside `<script>`, near the top

### MATERIALS object
```javascript
const MATERIALS = {
  'PGB-GW':  { name:'Gloss White (Supagloss)',    cost:2700, ew:2750, eh:1830, edging:15 },
  'PGB-MW':  { name:'Matte White (Supamatt)',      cost:2200, ew:2750, eh:1830, edging:15 },
  ...
};
```

| Property | What it is                          |
|----------|-------------------------------------|
| `name`   | Display name in results             |
| `cost`   | Cost per sheet in Rand              |
| `ew`     | Sheet width in mm (2750)            |
| `eh`     | Sheet height in mm (1830)           |
| `edging` | Edging tape cost per metre in Rand  |

**To add a new material:**
```javascript
'YOUR-CODE': { name:'Your Material Name', cost:1500, ew:2750, eh:1830, edging:12 },
```
Then add the matching `<option>` in the dropdown above.

**To update a price:**
Just change the `cost:` number.

### HINGE_PRICES object
```javascript
const HINGE_PRICES = { softClose:8, normal:5.75 };
```
Change the numbers to update hinge prices per unit.

### HANDLE_PRICES object
```javascript
const HANDLE_PRICES = {
  'handle192mm':     45,
  'handle128mm':     35,
  'handle192mm-blk': 50,
  'gola':            250,
  'none':            0,
};
```
Change the numbers to update handle prices per unit.

---

## SECTION 7 — JAVASCRIPT: FORMULAS

**Location:** Inside `<script>`, inside `calcCabinet()` function

**⚠ Only edit these if you know what you're changing.**

### Wastage, Profit, Commission
These read from the Job Details page inputs automatically:
```javascript
const wastage = +(document.getElementById('wastageRate')?.value || 20)/100;
const profit  = +(document.getElementById('profitRate')?.value  || 30)/100;
const comm    = +(document.getElementById('commRate')?.value    || 10)/100;
```
You set these on the Job Details page — no need to edit here.

### Board thickness
```javascript
const BOARD_T = 16;
```
Change this if you're working with different thickness boards.

### Rail height
```javascript
const RAIL_H = 70;
```
Change this if your rail height is different.

### Door gaps
```javascript
const DOOR_GAP = 4;
```
The total gap allowance around doors (2mm top + 2mm bottom).

---

## SECTION 8 — SAVE AND LOAD

The Save button exports your entire job as a `.json` file.
The Load button reads it back in.

**The JSON file contains:**
- All client details
- All job settings
- All rooms → walls → cabinets with full specs

**You can open the JSON file in any text editor** to see or manually edit the raw data.

Save your job files alongside the app:
```
cabinet-engine/
    cabinet-builder.html
    jobs/
        Smith_Kitchen.json
        Jones_Bedroom.json
        ...
```

---

## QUICK EDIT REFERENCE

| What you want to change        | Where to find it                          |
|--------------------------------|-------------------------------------------|
| Business name / logo           | Search for `CABINET<span>QUOTE</span>`    |
| Accent colour                  | `:root` → `--acc:`                        |
| Background colour              | `:root` → `--bg:`                         |
| Default labour rate            | `id="labourRate"` → `value="310"`         |
| Default room dimensions        | `id="rCeiling"`, `id="rPlinth"` etc.      |
| Board prices                   | `const MATERIALS = {` in script           |
| Hinge prices                   | `const HINGE_PRICES = {` in script        |
| Handle prices                  | `const HANDLE_PRICES = {` in script       |
| Add a material option          | Add to dropdown AND to MATERIALS object   |
| Sidebar width                  | `.sidebar { width: 230px; }`              |
| Button colours                 | `.btn.pri { background: var(--acc); }`    |
| Font                           | Google Fonts link + `--ff`, `--fm`, `--fd`|

---

## THINGS NOT TO TOUCH

| What                          | Why                                      |
|-------------------------------|------------------------------------------|
| Any `id=""` on inputs         | JavaScript reads values using these IDs  |
| `onclick="functionName()"`    | These trigger the calculation logic      |
| The `calcCabinet()` function  | Core calculation engine                  |
| The `state` object            | Holds all job data in memory             |
| `autoHeights()` function      | The room height formula logic            |
| `buildMasterCutList()`        | Cutting list merge logic                 |

If you're unsure whether something is safe to change — change the text or colour only, never the `id`, `class` used in JS, or `onclick` values.
