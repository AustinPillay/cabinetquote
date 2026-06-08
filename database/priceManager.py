#!/usr/bin/env python3
# ============================================================
# database/priceManager.py
# Tool to view and update hardware and material prices.
# Run: python3 database/priceManager.py
# ============================================================

import sqlite3
import sys
from datetime import datetime

DB_PATH = "./database/cabinet.db"

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def log_price_change(conn, table, item_id, item_name, old_price, new_price, notes=""):
    conn.execute("""
        INSERT INTO price_history (table_name, item_id, item_name, old_price, new_price, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (table, item_id, item_name, old_price, new_price, notes))

# ============================================================
# VIEW
# ============================================================
def view_hardware(conn, category=None):
    query = "SELECT id, category, name, sku, unit_price, unit FROM hardware WHERE active=1"
    params = []
    if category:
        query += " AND LOWER(category) = LOWER(?)"
        params.append(category)
    query += " ORDER BY category, name"
    rows = conn.execute(query, params).fetchall()

    print(f"\n  {'ID':<5} {'CATEGORY':<14} {'NAME':<40} {'SKU':<12} {'PRICE':>10} {'UNIT'}")
    print("  " + "─" * 90)
    current_cat = None
    for r in rows:
        if r["category"] != current_cat:
            current_cat = r["category"]
            print(f"\n  ── {current_cat.upper()} ──")
        print(f"  {r['id']:<5} {r['category']:<14} {r['name']:<40} {str(r['sku'] or ''):<12} {'R '+f'{r[\"unit_price\"]:.2f}':>10}  {r['unit']}")

def view_materials(conn, category=None):
    query = """
        SELECT m.id, m.category, m.name, m.code, m.sheet_width, m.sheet_height,
               m.cost_per_sheet, m.edging_cost, s.name as supplier
        FROM materials m
        LEFT JOIN suppliers s ON m.supplier_id = s.id
        WHERE m.active=1
    """
    params = []
    if category:
        query += " AND LOWER(m.category) = LOWER(?)"
        params.append(category)
    query += " ORDER BY m.category, m.name"
    rows = conn.execute(query, params).fetchall()

    print(f"\n  {'ID':<5} {'CATEGORY':<12} {'NAME':<35} {'SIZE':^14} {'COST/SHEET':>11} {'EDGING':>8}  SUPPLIER")
    print("  " + "─" * 100)
    current_cat = None
    for r in rows:
        if r["category"] != current_cat:
            current_cat = r["category"]
            print(f"\n  ── {current_cat.upper()} ──")
        size = f"{r['sheet_width']}×{r['sheet_height']}"
        print(f"  {r['id']:<5} {r['category']:<12} {r['name']:<35} {size:^14} {'R '+f'{r[\"cost_per_sheet\"]:.2f}':>11} {'R '+f'{r[\"edging_cost\"]:.2f}':>8}  {r['supplier']}")

# ============================================================
# UPDATE
# ============================================================
def update_hardware_price(conn, item_id, new_price, notes=""):
    row = conn.execute("SELECT name, unit_price FROM hardware WHERE id=?", (item_id,)).fetchone()
    if not row:
        print(f"  No hardware item with ID {item_id}")
        return False
    old_price = row["unit_price"]
    conn.execute("""
        UPDATE hardware SET unit_price=?, updated_at=datetime('now') WHERE id=?
    """, (new_price, item_id))
    log_price_change(conn, "hardware", item_id, row["name"], old_price, new_price, notes)
    conn.commit()
    print(f"  Updated: {row['name']}  R{old_price:.2f} → R{new_price:.2f}")
    return True

def update_material_price(conn, item_id, new_sheet_cost=None, new_edging_cost=None, notes=""):
    row = conn.execute("SELECT name, cost_per_sheet, edging_cost FROM materials WHERE id=?", (item_id,)).fetchone()
    if not row:
        print(f"  No material with ID {item_id}")
        return False

    if new_sheet_cost is not None:
        conn.execute("UPDATE materials SET cost_per_sheet=?, updated_at=datetime('now') WHERE id=?", (new_sheet_cost, item_id))
        log_price_change(conn, "materials", item_id, row["name"], row["cost_per_sheet"], new_sheet_cost, notes)
        print(f"  Updated board: {row['name']}  R{row['cost_per_sheet']:.2f} → R{new_sheet_cost:.2f}")

    if new_edging_cost is not None:
        conn.execute("UPDATE materials SET edging_cost=?, updated_at=datetime('now') WHERE id=?", (new_edging_cost, item_id))
        log_price_change(conn, "materials", item_id, row["name"] + " (edging)", row["edging_cost"], new_edging_cost, notes)
        print(f"  Updated edging: {row['name']}  R{row['edging_cost']:.2f}/m → R{new_edging_cost:.2f}/m")

    conn.commit()
    return True

def view_price_history(conn, limit=20):
    rows = conn.execute("""
        SELECT item_name, old_price, new_price, changed_at, notes
        FROM price_history ORDER BY changed_at DESC LIMIT ?
    """, (limit,)).fetchall()
    print(f"\n  PRICE HISTORY (last {limit} changes)")
    print("  " + "─" * 75)
    print(f"  {'ITEM':<38} {'OLD PRICE':>10} {'NEW PRICE':>10}  DATE")
    print("  " + "─" * 75)
    for r in rows:
        old = f"R{r['old_price']:.2f}" if r["old_price"] else "—"
        print(f"  {r['item_name']:<38} {old:>10} {'R'+f'{r[\"new_price\"]:.2f}':>10}  {r['changed_at'][:10]}")

# ============================================================
# INTERACTIVE MENU
# ============================================================
def menu():
    conn = connect()
    while True:
        print("\n" + "═" * 50)
        print("  PRICE MANAGER")
        print("═" * 50)
        print("  1  View all hardware prices")
        print("  2  View all material prices")
        print("  3  Update a hardware price")
        print("  4  Update a material price")
        print("  5  View price history")
        print("  6  Search by name")
        print("  0  Exit")
        print()
        choice = input("  Select: ").strip()

        if choice == "1":
            view_hardware(conn)

        elif choice == "2":
            view_materials(conn)

        elif choice == "3":
            view_hardware(conn)
            print()
            try:
                item_id   = int(input("  Enter hardware ID to update: "))
                new_price = float(input("  Enter new price (R): "))
                notes     = input("  Notes (e.g. 'Gelmar price increase May 2026'): ")
                update_hardware_price(conn, item_id, new_price, notes)
            except ValueError:
                print("  Invalid input.")

        elif choice == "4":
            view_materials(conn)
            print()
            try:
                item_id   = int(input("  Enter material ID to update: "))
                sc_input  = input("  New cost per sheet (R) — Enter to skip: ").strip()
                ec_input  = input("  New edging cost (R/m) — Enter to skip: ").strip()
                notes     = input("  Notes: ")
                sc = float(sc_input) if sc_input else None
                ec = float(ec_input) if ec_input else None
                update_material_price(conn, item_id, sc, ec, notes)
            except ValueError:
                print("  Invalid input.")

        elif choice == "5":
            view_price_history(conn)

        elif choice == "6":
            term = input("  Search term: ").strip()
            rows_hw  = conn.execute("SELECT id, category, name, unit_price, unit FROM hardware WHERE name LIKE ? AND active=1", (f"%{term}%",)).fetchall()
            rows_mat = conn.execute("SELECT id, category, name, cost_per_sheet FROM materials WHERE name LIKE ? AND active=1", (f"%{term}%",)).fetchall()
            if rows_hw:
                print("\n  HARDWARE MATCHES:")
                for r in rows_hw:
                    print(f"  [{r['id']}] {r['category']} — {r['name']}  R{r['unit_price']:.2f}/{r['unit']}")
            if rows_mat:
                print("\n  MATERIAL MATCHES:")
                for r in rows_mat:
                    print(f"  [{r['id']}] {r['category']} — {r['name']}  R{r['cost_per_sheet']:.2f}/sheet")
            if not rows_hw and not rows_mat:
                print("  No results found.")

        elif choice == "0":
            print("  Goodbye.\n")
            break
        else:
            print("  Invalid choice.")

    conn.close()

if __name__ == "__main__":
    menu()
