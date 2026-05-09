import fs from "node:fs";
import path from "node:path";

const bad = ["<".repeat(7), "=".repeat(7), ">".repeat(7)];
const skip = new Set(["node_modules", ".next", ".git", "dist"]);
let failed = false;

function walk(directory) {
  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!skip.has(entry)) walk(fullPath);
      continue;
    }
    const text = fs.readFileSync(fullPath, "utf8");
    for (const marker of bad) {
      if (text.includes(marker)) {
        console.error(`Conflict marker found: ${fullPath} ${marker}`);
        failed = true;
      }
    }
  }
}

walk(process.cwd());
if (failed) process.exit(1);
console.log("No conflict markers found.");
