#!/usr/bin/env node

const { execSync } = require("node:child_process");

const isVercel = Boolean(process.env.VERCEL);
const skip = isVercel || process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "1";

if (skip) {
  console.log("[postinstall] Skipping Playwright browser install (Vercel env detected).");
  process.exit(0);
}

try {
  execSync("npx playwright install --with-deps", { stdio: "inherit" });
} catch (error) {
  console.error("[postinstall] Failed to install Playwright browsers", error);
  process.exit(1);
}
