"use strict";

/**
 * Express middleware for permanent redirects from /academics to /anna-university-notes.
 *
 * Usage:
 * const express = require("express");
 * const academicsRedirect = require("./scripts/academics-redirect-middleware");
 * const app = express();
 *
 * app.use(academicsRedirect());
 * // ...other routes/static middleware
 */
function academicsRedirect(options = {}) {
  const fromBase = normalizeBase(options.fromBase || "/academics");
  const toBase = normalizeBase(options.toBase || "/anna-university-notes");
  const statusCode = Number(options.statusCode) || 301;

  return function academicsRedirectMiddleware(req, res, next) {
    const originalPath = req.path || "/";

    // Match only /academics or /academics/... (case-insensitive)
    const isMatch = new RegExp(`^${escapeRegExp(fromBase)}(?:$|/)`, "i").test(originalPath);
    if (!isMatch) {
      return next();
    }

    // Preserve trailing path after /academics
    const remainingPath = originalPath.slice(fromBase.length);

    // Avoid accidental double slash when joining
    const redirectedPath = `${toBase}${remainingPath}`.replace(/\/\/{2,}/g, "/");

    // Preserve query string exactly as sent
    const queryIndex = req.originalUrl ? req.originalUrl.indexOf("?") : -1;
    const queryString = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";

    return res.redirect(statusCode, `${redirectedPath}${queryString}`);
  };
}

function normalizeBase(basePath) {
  const p = String(basePath || "").trim();
  if (!p) return "/";
  const withLeadingSlash = p.startsWith("/") ? p : `/${p}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = academicsRedirect;
