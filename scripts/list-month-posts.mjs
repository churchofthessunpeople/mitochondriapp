import fs from "node:fs";

const jsonPath = process.argv[2];
const outPrefix = process.argv[3];
if (!jsonPath || !outPrefix) {
  console.error("Usage: node list-month-posts.mjs <posts.json> <out-prefix>");
  process.exit(1);
}

const j = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
if (!Array.isArray(j)) {
  console.error(j);
  process.exit(1);
}

const ids = j.map((p) => p.id);
fs.writeFileSync(`${outPrefix}-post-ids.txt`, ids.join(",") + "\n");
fs.writeFileSync(`${outPrefix}-done-ids.txt`, "");
console.log("count", j.length);
for (const p of j) {
  const title = String(p.title?.rendered || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&");
  console.log(`${p.id}\t${String(p.date).slice(0, 10)}\t${title}`);
}
