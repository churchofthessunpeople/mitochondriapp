import fs from "node:fs";
import path from "node:path";

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: node extract-blog-from-json.mjs <post.json>");
  process.exit(1);
}

const post = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const html = post.content?.rendered ?? "";
const plain = html
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/p>/gi, "\n\n")
  .replace(/<\/h[1-6]>/gi, "\n\n")
  .replace(/<li>/gi, "- ")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const outDir = path.resolve("research/raw");
fs.mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, `blog-${post.id}`);

const meta = [
  `id: ${post.id}`,
  `slug: ${post.slug}`,
  `title: ${post.title.rendered}`,
  `date: ${post.date}`,
  `url: ${post.link}`,
  `source: optimalklubs.com WordPress REST`,
  `wordCountApprox: ${plain.split(/\s+/).filter(Boolean).length}`,
  `fetched: ${new Date().toISOString()}`,
  "",
].join("\n");

fs.writeFileSync(`${base}.meta.txt`, meta);
fs.writeFileSync(`${base}.html`, html);
fs.writeFileSync(`${base}.plain.txt`, plain);

console.log(
  JSON.stringify(
    {
      id: post.id,
      title: post.title.rendered,
      words: plain.split(/\s+/).filter(Boolean).length,
      files: [`${base}.meta.txt`, `${base}.html`, `${base}.plain.txt`],
    },
    null,
    2,
  ),
);
