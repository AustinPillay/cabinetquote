# CabinetQuote

A full-stack quoting and job management system built for a real cabinetry business. Replaces manual spreadsheet quoting with a structured, database-backed workflow that generates professional PDF quotes.

---

## The Problem

Running a custom cabinetry business means quoting dozens of jobs a month. Each quote involves calculating materials, labour, hardware, and markup — then formatting it all into something you can send to a client. Done manually, this is slow, error-prone, and inconsistent.

CabinetQuote solves all of that.

---

## Features

- **Browser-based UI** — build and manage quotes through a clean web interface
- - **Node.js CLI** — run quote generation from the terminal for power users
  - - **SQLite database** — persistent storage for jobs, products, and pricing data
    - - **PDF generation** — Python + ReportLab produces a professional, branded quote PDF ready to send to clients
     
      - ---

      ## Tech Stack

      | Layer | Technology |
      |-------|------------|
      | Frontend | HTML5, JavaScript |
      | Backend | Node.js |
      | Database | SQLite |
      | PDF Engine | Python, ReportLab |

      ---

      ## How It Works

      1. Enter job details (client, dimensions, materials, hardware)
      2. 2. System calculates pricing based on stored product data
         3. 3. Generate a PDF quote with a single command
            4. 4. Store the job in the database for future reference
              
               5. ---
              
               6. ## Why I Built This
              
               7. This was my own business problem. I needed a faster, more reliable quoting system — so I built one. In the process I went from knowing nothing about full-stack development to shipping a working product used in real jobs.
              
               8. ---
              
               9. ## Status
              
               10. Working — used in production for real client quotes
