// ============================================================
// server.js — CabinetQuote Local Server
// Bridges the browser app to the Python PDF generator.
// Run: node server.js
// Then open cabinet-builder.html with Live Server as normal.
// ============================================================

const http     = require("http");
const fs       = require("fs");
const path     = require("path");
const { exec } = require("child_process");

const PORT = 3457;

// ---- Ensure output and jobs folders exist ----
["output", "jobs"].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// ============================================================
// REQUEST HANDLER
// ============================================================
const server = http.createServer((req, res) => {

  // ---- CORS headers (allows browser app to call this server) ----
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204); res.end(); return;
  }

  // ---- HEALTH CHECK ----
  if (req.method === "GET" && req.url === "/ping") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "CabinetQuote server running" }));
    return;
  }

  // ---- GENERATE PDF ----
  if (req.method === "POST" && req.url === "/generate-pdf") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { jobData, type } = JSON.parse(body);
        const clientName = (jobData.job?.name || "Quote").replace(/\s+/g, "_");
        const timestamp  = new Date().toISOString().slice(0,10);
        const jsonPath   = path.join("output", `${clientName}_job_data.json`);
        const pdfPath    = path.join("output", `${clientName}_${type}_${timestamp}.pdf`);

        // Write job data JSON
        fs.writeFileSync(jsonPath, JSON.stringify(jobData, null, 2));

        // Call Python PDF generator
        const cmd = `python pdf/generatePDF.py "${jsonPath}" "${pdfPath}" "${type}"`;
        console.log(`\n  Generating PDF: ${pdfPath}`);
        console.log(`  Command: ${cmd}`);

        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.error("  PDF error:", error.message);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: error.message }));
            return;
          }
          console.log(`  Done: ${pdfPath}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, path: pdfPath, filename: path.basename(pdfPath) }));
        });

      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ---- SAVE JOB ----
  if (req.method === "POST" && req.url === "/save-job") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { jobData, filename } = JSON.parse(body);
        const savePath = path.join("jobs", filename);
        fs.writeFileSync(savePath, JSON.stringify(jobData, null, 2));
        console.log(`  Job saved: ${savePath}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, path: savePath }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ---- LIST SAVED JOBS ----
  if (req.method === "GET" && req.url === "/list-jobs") {
    try {
      const files = fs.readdirSync("jobs")
        .filter(f => f.endsWith(".json"))
        .map(f => ({
          filename: f,
          label:    f.replace(/_cabinet_job\.json$/, "").replace(/_/g, " "),
          modified: fs.statSync(path.join("jobs", f)).mtime,
        }))
        .sort((a, b) => new Date(b.modified) - new Date(a.modified));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, jobs: files }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // ---- LOAD JOB ----
  if (req.method === "GET" && req.url.startsWith("/load-job/")) {
    try {
      const filename = decodeURIComponent(req.url.replace("/load-job/", ""));
      const filePath = path.join("jobs", filename);
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Job not found" }));
        return;
      }
      const data = fs.readFileSync(filePath, "utf8");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, jobData: JSON.parse(data) }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // ---- 404 ----
  res.writeHead(404); res.end("Not found");
});

server.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("  CABINETQUOTE SERVER");
  console.log("=".repeat(50));
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`  PDFs saved to: ./output/`);
  console.log(`  Jobs saved to: ./jobs/`);
  console.log("\n  Open cabinet-builder.html with Live Server.");
  console.log("  Keep this window open while using the app.");
  console.log("=".repeat(50) + "\n");
});
