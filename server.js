// ============================================================
// server.js — Cabinet Quoting Web Server
// Serves cabinet-builder.html and handles PDF generation
// Run: node server.js
// Then open: http://localhost:3000
// ============================================================

import express from "express";
import { execSync } from "child_process";
import { writeFileSync, mkdirSync, readFileSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// ── Serve the HTML ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "cabinet-builder.html"));
});

// ── POST /api/generate-pdf ──────────────────────────────────
// Body: { type: "quote"|"cutlist"|"hardware"|"all", payload: { job, cabinets, totals, transport, masterCutList } }
app.post("/api/generate-pdf", (req, res) => {
  const { type = "quote", payload } = req.body;

  if (!payload || !payload.job || !payload.cabinets) {
    return res.status(400).json({ error: "Missing payload data. Run Calculate All first." });
  }

  // Write payload to a temp JSON file
  const id       = randomUUID();
  const jsonPath = join(tmpdir(), `cabinet_job_${id}.json`);
  const pdfPath  = join(tmpdir(), `cabinet_${type}_${id}.pdf`);

  try {
    writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
  } catch (err) {
    return res.status(500).json({ error: "Could not write job data: " + err.message });
  }

  // Determine which python script to call
  // For now all types use generatePDF.py — extend per type if needed
  const scriptPath = join(__dirname, "pdf", "generatePDF.py");

  try {
    execSync(`python "${scriptPath}" "${jsonPath}" "${pdfPath}"`, {
      stdio: "pipe",
      timeout: 30_000,
    });
  } catch (err) {
    cleanup(jsonPath);
    const stderr = err.stderr?.toString() || err.message;
    return res.status(500).json({ error: "PDF generation failed: " + stderr });
  }

  // Stream PDF back to browser as a download
  const clientName = (payload.job.name || "cabinet_quote").replace(/\s+/g, "_");
  const filename   = `${clientName}_${type}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  try {
    const pdfBuffer = readFileSync(pdfPath);
    res.end(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ error: "Could not read generated PDF: " + err.message });
  } finally {
    cleanup(jsonPath);
    cleanup(pdfPath);
  }
});

function cleanup(path) {
  try { unlinkSync(path); } catch {}
}

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Cabinet Quoting Server`);
  console.log(`  ──────────────────────`);
  console.log(`  Open in browser:  http://localhost:${PORT}`);
  console.log(`  Press Ctrl+C to stop\n`);
});
