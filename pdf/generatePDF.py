#!/usr/bin/env python3
# ============================================================
# generatePDF.py
# Reads job data from a JSON file, generates a professional PDF.
# Called by Node.js after a job session completes.
# Usage: python3 pdf/generatePDF.py <job.json> <output.pdf>
# ============================================================

import sys
import json
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

# ============================================================
# COLOUR PALETTE
# ============================================================
BLACK      = colors.HexColor("#0f0f0f")
WHITE      = colors.HexColor("#ffffff")
ACCENT     = colors.HexColor("#c8f04a")   # lime green
DARK_GREY  = colors.HexColor("#1e1e1e")
MID_GREY   = colors.HexColor("#444444")
LIGHT_GREY = colors.HexColor("#f5f5f5")
BORDER     = colors.HexColor("#dddddd")
TEXT_MUTED = colors.HexColor("#888888")

W, H = A4        # 210 × 297 mm
USABLE_W = W - 40*mm  # available width after 20mm margins each side

# ============================================================
# STYLES
# ============================================================
def make_styles():
    return {
        "title": ParagraphStyle("title",
            fontName="Helvetica-Bold", fontSize=26,
            textColor=BLACK, leading=30, spaceAfter=2),

        "subtitle": ParagraphStyle("subtitle",
            fontName="Helvetica", fontSize=11,
            textColor=TEXT_MUTED, leading=14, spaceAfter=2),

        "section_heading": ParagraphStyle("section_heading",
            fontName="Helvetica-Bold", fontSize=9,
            textColor=TEXT_MUTED, leading=12,
            spaceBefore=14, spaceAfter=6,
            characterSpacing=2),

        "normal": ParagraphStyle("normal",
            fontName="Helvetica", fontSize=9,
            textColor=BLACK, leading=13),

        "small": ParagraphStyle("small",
            fontName="Helvetica", fontSize=8,
            textColor=TEXT_MUTED, leading=11),

        "mono": ParagraphStyle("mono",
            fontName="Courier", fontSize=8,
            textColor=BLACK, leading=12),

        "total_label": ParagraphStyle("total_label",
            fontName="Helvetica-Bold", fontSize=11,
            textColor=BLACK, leading=14),

        "total_value": ParagraphStyle("total_value",
            fontName="Helvetica-Bold", fontSize=14,
            textColor=BLACK, leading=16, alignment=TA_RIGHT),

        "note": ParagraphStyle("note",
            fontName="Helvetica-Oblique", fontSize=7,
            textColor=TEXT_MUTED, leading=10),
    }

# ============================================================
# HELPERS
# ============================================================
def rand(value):
    """Format a number as South African Rand."""
    return f"R {float(value):,.2f}"

def hr(color=BORDER, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=6, spaceBefore=2)

def spacer(h=4):
    return Spacer(1, h * mm)

# ============================================================
# HEADER BLOCK
# ============================================================
def build_header(job, S):
    date_str = datetime.now().strftime("%d %B %Y")
    ref      = datetime.now().strftime("QT-%Y%m%d")

    header_data = [[
        Paragraph(f"<b>CABINET</b>QUOTE", ParagraphStyle("logo",
            fontName="Helvetica-Bold", fontSize=22, textColor=BLACK, leading=26)),
        Paragraph(f"QUOTATION<br/><font color='#888888' size='8'>{ref} &nbsp;|&nbsp; {date_str}</font>",
            ParagraphStyle("ref", fontName="Helvetica-Bold", fontSize=11,
                textColor=BLACK, leading=16, alignment=TA_RIGHT)),
    ]]

    t = Table(header_data, colWidths=[USABLE_W * 0.60, USABLE_W * 0.40])
    t.setStyle(TableStyle([
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",  (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING",(0,0), (-1,-1),  0),
    ]))

    client_data = [[
        Paragraph(f"<b>CLIENT</b>", S["small"]),
        Paragraph("", S["small"]),
    ],[
        Paragraph(job.get("name", "—"), ParagraphStyle("client_name",
            fontName="Helvetica-Bold", fontSize=14, textColor=BLACK, leading=18)),
        Paragraph("", S["normal"]),
    ]]

    c = Table(client_data, colWidths=[USABLE_W * 0.60, USABLE_W * 0.40])
    c.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 1),
        ("BOTTOMPADDING", (0,0), (-1,-1), 1),
    ]))

    return [t, spacer(3), hr(BLACK, 1.5), spacer(2), c, spacer(4), hr()]

# ============================================================
# CABINET SUMMARY TABLE
# ============================================================
def build_cabinet_table(cabinets, S):
    elements = []
    elements.append(Paragraph("CABINET BREAKDOWN", S["section_heading"]))

    for i, cab in enumerate(cabinets):
        s = cab["quote"]["summary"]
        f = cab["quote"]["formatted"]

        # Cabinet title row
        title_data = [[
            Paragraph(f"<b>{cab['label'].upper()}</b>", ParagraphStyle("cab_title",
                fontName="Helvetica-Bold", fontSize=10, textColor=WHITE)),
            Paragraph(
                f"{cab['widthMM']}W × {cab['depthMM']}D × {cab['heightMM']}H mm  |  ×{cab['numUnits']}",
                ParagraphStyle("cab_dim", fontName="Helvetica", fontSize=8,
                    textColor=colors.HexColor("#cccccc"), alignment=TA_RIGHT)),
        ]]
        tt = Table(title_data, colWidths=[USABLE_W * 0.50, USABLE_W * 0.50])
        tt.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,-1), DARK_GREY),
            ("TOPPADDING",    (0,0), (-1,-1), 6),
            ("BOTTOMPADDING", (0,0), (-1,-1), 6),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
            ("RIGHTPADDING",  (0,0), (-1,-1), 8),
            ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ]))
        elements.append(tt)

        # Cost rows
        rows = [
            ["Board Cost (raw)",       f["boardCostRaw"]],
            ["Board + Wastage (20%)",  f["boardCostWithWastage"]],
            ["Hardware",               f["hardwareCost"]],
            ["Labour",                 f["labourCost"]],
            ["Profit (30%)",           f["profit"]],
            ["Commission (10%)",       f["commission"]],
            ["Other (10%)",            f["other"]],
        ]
        row_data = [[Paragraph(r[0], S["normal"]), Paragraph(r[1], ParagraphStyle("rv",
            fontName="Courier", fontSize=9, textColor=BLACK, alignment=TA_RIGHT))] for r in rows]

        # Total row
        row_data.append([
            Paragraph("<b>Cabinet Total</b>", ParagraphStyle("ct",
                fontName="Helvetica-Bold", fontSize=9, textColor=BLACK)),
            Paragraph(f"<b>{f['grandTotal']}</b>", ParagraphStyle("ctv",
                fontName="Helvetica-Bold", fontSize=9, textColor=BLACK, alignment=TA_RIGHT)),
        ])

        rt = Table(row_data, colWidths=[USABLE_W * 0.60, USABLE_W * 0.40])
        rt.setStyle(TableStyle([
            ("TOPPADDING",    (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
            ("RIGHTPADDING",  (0,0), (-1,-1), 8),
            ("ROWBACKGROUNDS",(0,0), (-1,-2), [WHITE, LIGHT_GREY]),
            ("BACKGROUND",    (0,-1),(-1,-1), colors.HexColor("#e8f5c0")),
            ("LINEBELOW",     (0,-2),(-1,-2), 0.5, BORDER),
        ]))
        elements.append(rt)
        elements.append(spacer(3))

    return elements

# ============================================================
# JOB TOTALS TABLE
# ============================================================
def build_totals_table(totals, transport, S):
    elements = []
    elements.append(hr())
    elements.append(Paragraph("JOB TOTALS", S["section_heading"]))

    rows = [
        ["Total Board Cost (raw)",    rand(totals["boardRaw"])],
        ["Total Board + Wastage 20%", rand(totals["boardWastage"])],
        ["Total Hardware",            rand(totals["hardware"])],
        ["Total Labour",              rand(totals["labour"])],
    ]
    if transport:
        rows.append(["Transport", rand(transport)])

    rows += [
        ["Total Profit (30%)",       rand(totals["profit"])],
        ["Total Commission (10%)",   rand(totals["commission"])],
        ["Total Other (10%)",        rand(totals["other"])],
    ]

    row_data = [[
        Paragraph(r[0], S["normal"]),
        Paragraph(r[1], ParagraphStyle("tv", fontName="Courier", fontSize=9,
            textColor=BLACK, alignment=TA_RIGHT))
    ] for r in rows]

    # Grand total
    row_data.append([
        Paragraph("<b>GRAND TOTAL</b>", ParagraphStyle("gt",
            fontName="Helvetica-Bold", fontSize=12, textColor=WHITE)),
        Paragraph(f"<b>{rand(totals['grandTotal'])}</b>", ParagraphStyle("gtv",
            fontName="Helvetica-Bold", fontSize=12, textColor=WHITE, alignment=TA_RIGHT)),
    ])

    t = Table(row_data, colWidths=[USABLE_W * 0.60, USABLE_W * 0.40])
    t.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,0), (-1,-2), [WHITE, LIGHT_GREY]),
        ("BACKGROUND",    (0,-1),(-1,-1), BLACK),
        ("LINEBELOW",     (0,-2),(-1,-2), 0.5, BORDER),
    ]))
    elements.append(t)
    return elements

# ============================================================
# CUTTING LIST TABLE
# ============================================================
def build_cutting_list(cabinets, master, S):
    elements = []
    elements.append(PageBreak())
    elements.append(Paragraph("CUTTING LIST", ParagraphStyle("cl_title",
        fontName="Helvetica-Bold", fontSize=20, textColor=BLACK,
        leading=24, spaceAfter=4)))
    elements.append(hr(BLACK, 1.5))
    elements.append(spacer(2))

    # Individual cabinet lists
    for cab in cabinets:
        elements.append(Paragraph(
            f"{cab['label'].upper()}  —  ×{cab['numUnits']}  |  {cab['widthMM']}W × {cab['depthMM']}D × {cab['heightMM']}H mm",
            S["section_heading"]))

        headers = [["PANEL", "WIDTH", "HEIGHT", "QTY", "EDGING", "NOTE"]]
        rows = [[
            p["panel"], str(p["width"]), str(p["height"]),
            str(p["qty"]), p["edging"], p.get("note", "")
        ] for p in cab["cutList"]]

        all_rows = headers + rows
        t = Table(all_rows, colWidths=[30*mm, 18*mm, 18*mm, 12*mm, 18*mm, None])
        t.setStyle(TableStyle([
            # Header row
            ("BACKGROUND",    (0,0), (-1,0), DARK_GREY),
            ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
            ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",      (0,0), (-1,-1), 8),
            ("FONTNAME",      (0,1), (-1,-1), "Courier"),
            ("TEXTCOLOR",     (0,1), (-1,-1), BLACK),
            ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GREY]),
            ("TOPPADDING",    (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING",   (0,0), (-1,-1), 6),
            ("RIGHTPADDING",  (0,0), (-1,-1), 6),
            ("ALIGN",         (1,0), (3,-1), "CENTER"),
            ("ALIGN",         (4,0), (4,-1), "CENTER"),
            ("GRID",          (0,0), (-1,-1), 0.3, BORDER),
        ]))
        elements.append(t)
        elements.append(spacer(4))

    # Master combined list
    elements.append(hr(BLACK, 1))
    elements.append(Paragraph("MASTER LIST — ALL PANELS COMBINED", S["section_heading"]))

    total_panels = sum(p["qty"] for p in master)
    elements.append(Paragraph(
        f"Total panels to cut: {total_panels}",
        S["small"]))
    elements.append(spacer(2))

    headers = [["PANEL", "WIDTH", "HEIGHT", "QTY", "EDGING", "CABINETS"]]
    rows = [[
        p["panel"], str(p["width"]), str(p["height"]),
        str(p["qty"]), p["edging"],
        ", ".join(p["cabinets"]) if isinstance(p["cabinets"], list) else p["cabinets"]
    ] for p in master]

    all_rows = headers + rows
    t = Table(all_rows, colWidths=[30*mm, 18*mm, 18*mm, 12*mm, 18*mm, None])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), BLACK),
        ("TEXTCOLOR",     (0,0), (-1,0), ACCENT),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("FONTNAME",      (0,1), (-1,-1), "Courier"),
        ("TEXTCOLOR",     (0,1), (-1,-1), BLACK),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GREY]),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("RIGHTPADDING",  (0,0), (-1,-1), 6),
        ("ALIGN",         (1,0), (3,-1), "CENTER"),
        ("ALIGN",         (4,0), (4,-1), "CENTER"),
        ("GRID",          (0,0), (-1,-1), 0.3, BORDER),
    ]))
    elements.append(t)
    return elements

# ============================================================
# FOOTER
# ============================================================
def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(20*mm, 12*mm, "CABINETQUOTE ENGINE — Confidential")
    canvas.drawRightString(W - 20*mm, 12*mm, f"Page {doc.page}")
    canvas.restoreState()

# ============================================================
# MAIN
# ============================================================
def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generatePDF.py <job.json> <output.pdf>")
        sys.exit(1)

    json_path = sys.argv[1]
    pdf_path  = sys.argv[2]

    with open(json_path, "r") as f:
        data = json.load(f)

    job      = data["job"]
    cabinets = data["cabinets"]
    totals   = data["totals"]
    transport= data.get("transport", None)
    master   = data["masterCutList"]

    S = make_styles()

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=20*mm,  bottomMargin=20*mm,
    )

    story = []
    story += build_header(job, S)
    story += build_cabinet_table(cabinets, S)
    story += build_totals_table(totals, transport, S)
    story += build_cutting_list(cabinets, master, S)

    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"PDF saved: {pdf_path}")

if __name__ == "__main__":
    main()
