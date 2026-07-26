/**
 * Re-export helper: list article files (articles are edited in place under
 * content/articles/). Kept for docs / package.json convenience.
 *
 *   npm run content:export-articles
 */
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "articles");
if (!existsSync(dir)) {
  console.error("content/articles/ missing — create article JSON files there.");
  process.exit(1);
}
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
console.log(`${files.length} articles in content/articles/`);
for (const f of files.sort()) console.log(`  ${f}`);
