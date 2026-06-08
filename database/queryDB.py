#!/usr/bin/env python3
# ============================================================
# database/queryDB.py
# Called by Node.js to fetch prices from the database.
# Returns JSON to stdout.
# Usage: python3 database/queryDB.py hardware
#        python3 database/queryDB.py materials
#        python3 database/queryDB.py hardware --category Hinges
# ============================================================

import sqlite3
import json
import sys

DB_PATH = "./database/cabinet.db"

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No table specified"}))
        sys.exit(1)

    table    = sys.argv[1]
    category = None

    if "--category" in sys.argv:
        idx      = sys.argv.index("--category")
        category = sys.argv[idx + 1]

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    if table == "hardware":
        query  = "SELECT * FROM hardware WHERE active=1"
        params = []
        if category:
            query += " AND LOWER(category) = LOWER(?)"
            params.append(category)
        query += " ORDER BY category, name"
        rows = conn.execute(query, params).fetchall()
        print(json.dumps([dict(r) for r in rows]))

    elif table == "materials":
        query  = "SELECT * FROM materials WHERE active=1"
        params = []
        if category:
            query += " AND LOWER(category) = LOWER(?)"
            params.append(category)
        query += " ORDER BY category, name"
        rows = conn.execute(query, params).fetchall()
        print(json.dumps([dict(r) for r in rows]))

    elif table == "suppliers":
        rows = conn.execute("SELECT * FROM suppliers").fetchall()
        print(json.dumps([dict(r) for r in rows]))

    else:
        print(json.dumps({"error": f"Unknown table: {table}"}))

    conn.close()

if __name__ == "__main__":
    main()
