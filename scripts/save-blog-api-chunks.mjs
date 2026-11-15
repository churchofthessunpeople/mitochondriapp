import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Usage: node scripts/save-blog-api-chunks.mjs <out.json> <chunk0.txt> [chunk1.txt ...]
const [outPath, ...chunks] = process.argv.slice(2);
if (!outPath || chunks.length === 0) {
  console.error("Usage: node save-blog-api-chunks.mjs <out.json> <chunk files...>");
  process.exit(1);
}
const text = chunks.map((f) => fs.readFileSync(f, "utf8")).join("");
const post = JSON.parse(text);
fs.writeFileSync(outPath, JSON.stringify(post));
console.log("wrote", outPath, "id", post.id, "contentLen", post.content?.rendered?.length);
