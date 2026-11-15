import fs from "node:fs";
import path from "node:path";

// Usage: node scripts/write-blog-raw.mjs <meta.json> [html-file]
// meta.json: { id, slug, title, date, url, plain }
const metaPath = process.argv[2];
const htmlPath = process.argv[3];
if (!metaPath) {
  console.error("Usage: node write-blog-raw.mjs <meta.json> [html-file]");
  process.exit(1);
}

const metaIn = JSON.parse(fs.readFileSync(metaPath, "utf8"));
const html = htmlPath ? fs.readFileSync(htmlPath, "utf8") : "";
const plain = (metaIn.plain || "").trim();
const outDir = path.resolve("research/raw");
fs.mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, `blog-${metaIn.id}`);

const meta = [
  `id: ${metaIn.id}`,
  `slug: ${metaIn.slug}`,
  `title: ${metaIn.title}`,
  `date: ${metaIn.date}`,
  `url: ${metaIn.url}`,
  `source: optimalklubs.com WordPress REST / page`,
  `wordCountApprox: ${plain.split(/\s+/).filter(Boolean).length}`,
  `fetched: ${new Date().toISOString()}`,
  "",
].join("\n");

fs.writeFileSync(`${base}.meta.txt`, meta);
fs.writeFileSync(`${base}.plain.txt`, plain);
if (html) fs.writeFileSync(`${base}.html`, html);

console.log(
  JSON.stringify(
    {
      id: metaIn.id,
      words: plain.split(/\s+/).filter(Boolean).length,
      files: [`${base}.meta.txt`, `${base}.plain.txt`, html ? `${base}.html` : null].filter(Boolean),
    },
    null,
    2,
  ),
);
