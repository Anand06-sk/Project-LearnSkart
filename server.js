"use strict";

const express = require("express");
const path = require("path");

// Existing redirect middleware: /academics/... -> /anna-university-notes/...
const academicsRedirect = require("./scripts/academics-redirect-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Keep redirect middleware FIRST so it runs before static files/routes.
app.use(academicsRedirect());

// 2) Serve website content.
// This project stores pages in repository root (anna-university-notes/, pyq/, assets/, etc.).
// Keep optional public/ support first, then fall back to root.
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.use(express.static(__dirname));

// 3) Example testing route requested.
app.get("/anna-university-notes/ec", (req, res) => {
  res.status(200).send("Example route OK: /anna-university-notes/ec");
});

// Optional local health route.
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "learnskart-server" });
});

// Optional fallback 404 (after static/routes).
app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Redirect test: http://localhost:${PORT}/academics/cse/`);
  console.log(`Expected 301 -> http://localhost:${PORT}/anna-university-notes/cse/`);
});



