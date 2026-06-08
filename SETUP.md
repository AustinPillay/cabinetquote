# CABINET QUOTING ENGINE — SETUP GUIDE

---

## WHAT YOU NEED FIRST

Before anything, make sure these are installed on your machine.

### 1. Node.js
- Go to **nodejs.org**
- Download the **LTS version**
- Install it
- Open CMD and check it works:
  ```
  node --version
  ```
  You should see something like `v20.x.x`

### 2. Python
- Go to **python.org**
- Download the latest version
- During install — tick **"Add Python to PATH"** (important)
- Open CMD and check it works:
  ```
  python --version
  ```
  You should see something like `Python 3.x.x`

### 3. VS Code (recommended)
- Go to **code.visualstudio.com**
- Download and install
- Install the **Live Server** extension inside VS Code

---

## FOLDER STRUCTURE

Create this folder structure on your machine.
Every file goes exactly where shown — the imports depend on it.

```
cabinet-engine/
│
├── index.js
├── package.json
│
├── calculator/
│   ├── materials.js
│   ├── formulas.js
│   ├── cabinetRules.js
│   ├── pricing.js
│   ├── cuttingList.js
│   └── hardware.js
│
├── database/
│   ├── setupDB.py
│   ├── priceManager.py
│   └── queryDB.py
│
├── pdf/
│   └── generatePDF.py
│
└── output/
    (this folder is created automatically when you run the engine)
```

---

## STEP 1 — CREATE THE FOLDER

Open CMD and run:

```
cd C:\Users\YourName\Documents
mkdir cabinet-engine
cd cabinet-engine
mkdir calculator
mkdir database
mkdir pdf
```

---

## STEP 2 — COPY ALL THE FILES

Download all the files from Claude and place them in the correct folders as shown in the structure above.

---

## STEP 3 — INSTALL PYTHON LIBRARIES

In CMD, inside the `cabinet-engine` folder, run these one at a time:

```
pip install reportlab
```

Check it worked:
```
python -c "import reportlab; print('reportlab OK')"
```

---

## STEP 4 — SET UP THE DATABASE

Run this once to create the database and load all hardware and material prices:

```
python database/setupDB.py
```

You should see:
```
  Tables created.
  Suppliers seeded.
  Hardware seeded: 38 items.
  Materials seeded: 19 items.
  Database ready.
```

A file called `cabinet.db` will appear inside the `database/` folder.
This is your price database. Do not delete it.

---

## STEP 5 — RUN THE QUOTING ENGINE

```
node index.js
```

The engine will walk you through:

```
1. Job name / client name
2. Labour rate (default R310/m)
3. Transport (yes/no)

Then for each cabinet:
4. Unit type (base / wall / tall)
5. Cabinet label (e.g. "Sink Base")
6. Width, depth, height in mm
7. Number of units
8. Shelves per unit
9. Doors per unit
10. Drawers per unit
11. Carcass material
12. Extras (seen end, capping, skirting, back board, masonite)
13. External / door material
14. Hinge type (soft close / normal)
15. Handle type (196mm / 128mm / Gola / none)

Then:
16. Add another cabinet? (y/n)

At the end:
17. Print cutting list? (y/n)
18. Print hardware lists? (y/n)
19. Export PDF? (y/n)
```

PDF saves to:
```
cabinet-engine/output/ClientName_Quote.pdf
```

---

## STEP 6 — VIEW IN BROWSER (HTML VERSION)

The `index.html` file is a browser version of the engine.

1. Open VS Code
2. Open the `cabinet-engine` folder
3. Right-click `index.html`
4. Click **"Open with Live Server"**

Fill in the form on the left, click **Calculate Quote**, results appear on the right.

---

## UPDATING PRICES

When Gelmar prices change, run:

```
python database/priceManager.py
```

Menu options:
```
1  View all hardware prices
2  View all material prices
3  Update a hardware price
4  Update a material price
5  View price history
6  Search by name
0  Exit
```

Every price change is logged with the date automatically.

---

## QUICK REFERENCE — COMMANDS

| What you want to do           | Command                            |
|-------------------------------|------------------------------------|
| Run the quoting engine        | `node index.js`                    |
| Open price manager            | `python database/priceManager.py`  |
| Rebuild the database          | `python database/setupDB.py`       |
| Open browser version          | Live Server on `index.html`        |

---

## TROUBLESHOOTING

**`node` not recognised**
→ Node.js is not installed or not on PATH. Reinstall from nodejs.org.

**`python` not recognised**
→ Python is not installed or not on PATH. Reinstall from python.org and tick "Add to PATH".

**`pip install reportlab` fails**
→ Try `python -m pip install reportlab` instead.

**PDF generation failed**
→ Make sure reportlab is installed. Check that the `pdf/` folder exists with `generatePDF.py` inside it.

**Database not found error**
→ Run `python database/setupDB.py` first before running `node index.js`.

**Import errors when running node index.js**
→ Check that all files are in exactly the right folders as shown in the structure above.

---

## WHAT EACH FILE DOES

| File                        | Purpose                                      |
|-----------------------------|----------------------------------------------|
| `index.js`                  | Main entry point — runs the job session      |
| `calculator/materials.js`   | Board material prices and properties         |
| `calculator/formulas.js`    | All maths — area, cost, wastage, profit      |
| `calculator/cabinetRules.js`| Generates parts lists per cabinet type       |
| `calculator/pricing.js`     | Assembles full quote from parts              |
| `calculator/cuttingList.js` | Calculates exact cut sizes with deductions   |
| `calculator/hardware.js`    | Hardware rules — hinges, runners, handles    |
| `database/setupDB.py`       | Creates and seeds the SQLite database        |
| `database/priceManager.py`  | Tool to view and update prices               |
| `database/queryDB.py`       | Internal — lets Node.js read from the DB     |
| `pdf/generatePDF.py`        | Generates the quote + cutting list PDF       |
| `index.html`                | Browser-based version of the quoting tool    |
