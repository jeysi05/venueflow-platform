import fs from "node:fs";
import path from "node:path";

const jsonFiles = [];
const skip = new Set(["node_modules", ".next", ".git", "dist"]);

function walk(directory) {
  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!skip.has(entry)) walk(fullPath);
      continue;
    }
    if (entry.endsWith(".json")) jsonFiles.push(fullPath);
  }
}

walk(process.cwd());
for (const file of jsonFiles) {
  JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`valid json: ${path.relative(process.cwd(), file)}`);
}
