#!/usr/bin/env python3
# ============================================================
# database/setupDB.py
# Creates the SQLite database and seeds it with all items.
# Run once to set up: python3 database/setupDB.py
# Run again to reset prices to defaults.
# ============================================================

import sqlite3
import os
from datetime import datetime

DB_PATH = "./database/cabinet.db"

def create_tables(conn):
    c = conn.cursor()

    # ---- SUPPLIERS ----
    c.execute("""
        CREATE TABLE IF NOT EXISTS suppliers (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            website     TEXT,
            phone       TEXT,
            notes       TEXT,
            created_at  TEXT DEFAULT (datetime('now'))
        )
    """)

    # ---- HARDWARE ----
    c.execute("""
        CREATE TABLE IF NOT EXISTS hardware (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id  INTEGER REFERENCES suppliers(id),
            category     TEXT NOT NULL,
            name         TEXT NOT NULL,
            sku          TEXT,
            unit_price   REAL NOT NULL,
            unit         TEXT NOT NULL,
            notes        TEXT,
            active       INTEGER DEFAULT 1,
            updated_at   TEXT DEFAULT (datetime('now'))
        )
    """)

    # ---- MATERIALS (boards) ----
    c.execute("""
        CREATE TABLE IF NOT EXISTS materials (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id   INTEGER REFERENCES suppliers(id),
            category      TEXT NOT NULL,
            name          TEXT NOT NULL,
            code          TEXT,
            sheet_width   INTEGER NOT NULL,
            sheet_height  INTEGER NOT NULL,
            thickness     INTEGER NOT NULL DEFAULT 16,
            cost_per_sheet REAL NOT NULL,
            edging_cost   REAL NOT NULL DEFAULT 0,
            active        INTEGER DEFAULT 1,
            updated_at    TEXT DEFAULT (datetime('now'))
        )
    """)

    # ---- PRICE HISTORY ----
    c.execute("""
        CREATE TABLE IF NOT EXISTS price_history (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name   TEXT NOT NULL,
            item_id      INTEGER NOT NULL,
            item_name    TEXT NOT NULL,
            old_price    REAL,
            new_price    REAL NOT NULL,
            changed_at   TEXT DEFAULT (datetime('now')),
            notes        TEXT
        )
    """)

    conn.commit()
    print("  Tables created.")

def seed_suppliers(conn):
    c = conn.cursor()
    c.execute("DELETE FROM suppliers")
    suppliers = [
        (1, "Gelmar",       "https://www.gelmar.co.za", None,         "Primary hardware supplier"),
        (2, "PG Bison",     "https://www.pgbison.co.za", None,        "Primary board supplier"),
        (3, "Sonae Arauco", "https://www.sonae-arauco.com", None,     "Board supplier"),
    ]
    c.executemany("""
        INSERT OR REPLACE INTO suppliers (id, name, website, phone, notes)
        VALUES (?, ?, ?, ?, ?)
    """, suppliers)
    conn.commit()
    print("  Suppliers seeded.")

def seed_hardware(conn):
    c = conn.cursor()
    c.execute("DELETE FROM hardware")

    # (supplier_id, category, name, sku, unit_price, unit, notes)
    items = [

        # ---- HINGES ----
        (1, "Hinges", "Gelmar Soft Close Clip Hinge 35mm",   "GEL-SC35",   8.00,  "each",  "Standard cabinet hinge, soft close"),
        (1, "Hinges", "Gelmar Slide On 2-Hole Hinge 35mm",   "GEL-SO2",    5.75,  "each",  "Normal slide-on hinge"),
        (1, "Hinges", "Gelmar Slide On 4-Hole Hinge 35mm",   "GEL-SO4",    6.50,  "each",  "Heavy duty slide-on hinge"),
        (1, "Hinges", "Titus Soft Close Hinge 35mm",         "TIT-SC35",   9.50,  "each",  "Premium soft close"),
        (1, "Hinges", "Titus Clip On Hinge 35mm",            "TIT-CL35",   7.00,  "each",  "Titus clip on"),

        # ---- RUNNERS ----
        (1, "Runners", "Soft Close Runner 300mm Pair",       "RUN-SC300",  65.00, "pair",  "Bottom mount soft close"),
        (1, "Runners", "Soft Close Runner 400mm Pair",       "RUN-SC400",  85.00, "pair",  "Bottom mount soft close"),
        (1, "Runners", "Soft Close Runner 500mm Pair",       "RUN-SC500",  95.00, "pair",  "Bottom mount soft close"),
        (1, "Runners", "Soft Close Runner 600mm Pair",       "RUN-SC600", 100.00, "pair",  "Bottom mount soft close"),
        (1, "Runners", "Ball Bearing Runner 400mm Pair",     "RUN-BB400",  55.00, "pair",  "Standard ball bearing"),
        (1, "Runners", "Ball Bearing Runner 500mm Pair",     "RUN-BB500",  65.00, "pair",  "Standard ball bearing"),
        (1, "Runners", "Ball Bearing Runner 600mm Pair",     "RUN-BB600",  75.00, "pair",  "Standard ball bearing"),
        (1, "Runners", "Undermount Runner 400mm Pair",       "RUN-UM400", 120.00, "pair",  "Undermount soft close"),
        (1, "Runners", "Undermount Runner 500mm Pair",       "RUN-UM500", 135.00, "pair",  "Undermount soft close"),

        # ---- HANDLES ----
        (1, "Handles", "Bar Handle 96mm Chrome",             "HDL-96C",    25.00, "each",  "96mm hole centre"),
        (1, "Handles", "Bar Handle 128mm Chrome",            "HDL-128C",   35.00, "each",  "128mm hole centre"),
        (1, "Handles", "Bar Handle 160mm Chrome",            "HDL-160C",   40.00, "each",  "160mm hole centre"),
        (1, "Handles", "Bar Handle 192mm Chrome",            "HDL-192C",   45.00, "each",  "192mm hole centre"),
        (1, "Handles", "Bar Handle 224mm Chrome",            "HDL-224C",   55.00, "each",  "224mm hole centre"),
        (1, "Handles", "Bar Handle 128mm Matt Black",        "HDL-128B",   40.00, "each",  "128mm matt black"),
        (1, "Handles", "Bar Handle 192mm Matt Black",        "HDL-192B",   50.00, "each",  "192mm matt black"),
        (1, "Handles", "Gola Profile 3m Length",             "GOL-3M",    250.00, "length","3 metre Gola channel"),
        (1, "Handles", "Gola End Cap Pair",                  "GOL-EC",     15.00, "pair",  "Gola end caps"),

        # ---- SHELF SUPPORTS ----
        (1, "Shelf", "Shelf Support Pin 5mm Nickel",         "SHF-PIN5",    2.00, "each",  "Standard shelf pin"),
        (1, "Shelf", "Shelf Support Bracket",                "SHF-BKT",     8.00, "each",  "Heavy duty bracket"),

        # ---- HANGING RAILS ----
        (1, "Rails", "Hanging Rail Chrome per metre",        "RAIL-1M",    55.00, "metre", "Wardrobe hanging rail"),
        (1, "Rails", "Hanging Rail End Bracket",             "RAIL-EB",    15.00, "each",  "End support bracket"),
        (1, "Rails", "Hanging Rail Mid Bracket",             "RAIL-MB",    12.00, "each",  "Mid support bracket"),

        # ---- SCREWS & FASTENERS ----
        (1, "Fasteners", "Cabinet Screw 3.5x16mm Box 200",  "SCR-200",    45.00, "box",   "General cabinet screws"),
        (1, "Fasteners", "Confirmat Screw 7x50mm Box 100",  "CON-100",    35.00, "box",   "Carcass assembly screws"),
        (1, "Fasteners", "Dowel Pin 8x35mm Box 100",        "DWL-100",    25.00, "box",   "Alignment dowels"),
        (1, "Fasteners", "Cam Lock and Bolt Set",           "CAM-SET",     3.50, "set",   "Flat pack cam fitting"),

        # ---- LEGS & PLINTHS ----
        (1, "Legs", "Adjustable Cabinet Leg 100-150mm",     "LEG-ADJ",    12.00, "each",  "Adjustable plastic leg"),
        (1, "Legs", "Adjustable Cabinet Leg 150-200mm",     "LEG-ADJ2",   14.00, "each",  "Tall adjustable leg"),
        (1, "Legs", "Plinth Clip",                          "CLIP-PLN",    3.00, "each",  "Plinth fixing clip"),

        # ---- SOFT CLOSE ----
        (1, "Soft Close", "Soft Close Door Damper",         "DAM-DR",     18.00, "each",  "Retrofit door damper"),
        (1, "Soft Close", "Soft Close Drawer Damper",       "DAM-DRW",    15.00, "each",  "Retrofit drawer damper"),

        # ---- BACK PANELS ----
        (1, "Back Panels", "Back Panel Clip",               "BPK-CLIP",    3.00, "each",  "3mm back panel clip"),
    ]

    c.executemany("""
        INSERT INTO hardware (supplier_id, category, name, sku, unit_price, unit, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, items)
    conn.commit()
    print(f"  Hardware seeded: {len(items)} items.")

def seed_materials(conn):
    c = conn.cursor()
    c.execute("DELETE FROM materials")

    # (supplier_id, category, name, code, width, height, thickness, cost_per_sheet, edging_cost)
    items = [

        # ---- PG BISON CARCASS BOARDS ----
        (2, "Carcass", "White Melamine",                 "PGB-WM",    2750, 1830, 16,  800.00,  10.00),
        (2, "Carcass", "Gloss White (Supagloss)",        "PGB-GW",    2750, 1830, 16, 2700.00,  15.00),
        (2, "Carcass", "Matte White (Supamatt)",         "PGB-MW",    2750, 1830, 16, 2200.00,  15.00),
        (2, "Carcass", "Caraz Matt (Light Grey)",        "PGB-CM",    2750, 1830, 16, 2400.00,  15.00),
        (2, "Carcass", "Napoca SupaTexture (Walnut)",    "PGB-NT",    2750, 1830, 16, 2600.00,  18.00),
        (2, "Carcass", "Melamine Light Oak",             "PGB-LO",    2750, 1830, 16,  950.00,  10.00),
        (2, "Carcass", "Melamine Wenge",                 "PGB-WG",    2750, 1830, 16,  950.00,  10.00),

        # ---- PG BISON EXTERNAL / DOOR BOARDS ----
        (2, "External", "Gloss White External",          "PGB-GWE",   2750, 1830, 16, 3300.00,  25.00),
        (2, "External", "Matte White External",          "PGB-MWE",   2750, 1830, 16, 4000.00,  25.00),
        (2, "External", "Gloss Anthracite",              "PGB-GAE",   2750, 1830, 16, 3500.00,  25.00),
        (2, "External", "Matte Anthracite",              "PGB-MAE",   2750, 1830, 16, 4200.00,  25.00),
        (2, "External", "Gloss Cream",                   "PGB-GCE",   2750, 1830, 16, 3300.00,  25.00),

        # ---- BACK BOARDS ----
        (2, "Back",     "Masonite 3mm",                  "MAS-3MM",   2750, 1830,  3,  300.00,   0.00),
        (2, "Back",     "White Back Board 3mm",          "PGB-BB3",   2750, 1830,  3,  650.00,   0.00),
        (2, "Back",     "White Back Board 6mm",          "PGB-BB6",   2750, 1830,  6,  850.00,   0.00),

        # ---- PLY / SPECIAL ----
        (2, "Ply",      "Melaply 16mm",                  "PGB-MPY",   2750, 1830, 16,  950.00,  12.00),
        (2, "Ply",      "Birch Ply 18mm",                "PLY-BR18",  2440, 1220, 18, 1200.00,   0.00),

        # ---- SONAE ARAUCO ----
        (3, "Carcass",  "Dura White Melamine",           "SON-DW",    2800, 2070, 16,  900.00,  10.00),
        (3, "External", "Dura Gloss White",              "SON-DGW",   2800, 2070, 16, 3100.00,  22.00),
    ]

    c.executemany("""
        INSERT INTO materials (supplier_id, category, name, code, sheet_width, sheet_height, thickness, cost_per_sheet, edging_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, items)
    conn.commit()
    print(f"  Materials seeded: {len(items)} items.")

def main():
    os.makedirs("./database", exist_ok=True)
    print(f"\n  Setting up database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    create_tables(conn)
    seed_suppliers(conn)
    seed_hardware(conn)
    seed_materials(conn)

    # Quick summary
    c = conn.cursor()
    hw_count  = c.execute("SELECT COUNT(*) FROM hardware").fetchone()[0]
    mat_count = c.execute("SELECT COUNT(*) FROM materials").fetchone()[0]
    print(f"\n  Database ready.")
    print(f"  {hw_count} hardware items | {mat_count} material types")
    print(f"  File: {os.path.abspath(DB_PATH)}\n")
    conn.close()

if __name__ == "__main__":
    main()
