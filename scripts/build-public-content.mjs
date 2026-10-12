// Builds content/public-content.json from research/protocols.md and research/articles.md.
// Only protocols marked `app: ready` become public activities.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const PILLARS = new Set(["light", "water", "magnetism", "support"]);

function field(entry, name) {
  const match = entry.match(new RegExp(`^- \\*\\*${name}:\\*\\* (.*)$`, "m"));
  return match ? match[1].trim() : null;
}

function idList(value) {
  if (!value || value === "none") return [];
  return value.split(",").map((id) => id.trim()).filter(Boolean);
}

function sourceList(value) {
  return [...(value ?? "").matchAll(/\[([^\]]+)\]\((https:\/\/forum\.jackkruse\.com\/posts\/\d+\/)\)/g)].map(
    ([, label, url]) => ({ label, url }),
  );
}

function entries(doc) {
  return doc.split(/\n(?=### )/).slice(1).map((entry) => {
    const lines = entry.split("\n");
    return { title: lines[0].replace(/^### /, "").trim(), lines, text: entry };
  });
}

const protocols = entries(read("research/protocols.md")).map(({ title, lines, text }) => {
  const steps = [];
  let inSteps = false;
  for (const line of lines) {
    if (/^- \*\*steps:\*\*/.test(line)) inSteps = true;
    else if (/^- \*\*/.test(line)) inSteps = false;
    else if (inSteps) {
      const step = line.match(/^\s+\d+\.\s+(.*)$/);
      if (step) steps.push(step[1].trim());
    }
  }
  return {
    id: field(text, "id"),
    name: title,
    pillar: field(text, "pillar"),
    app: field(text, "app"),
    summary: field(text, "summary"),
    steps,
    equipmentText: field(text, "equipment"),
    cautions: field(text, "cautions"),
    articleIds: idList(field(text, "why")),
    sources: sourceList(field(text, "sources")),
  };
});

const articlesDoc = read("research/articles.md");
const articles = entries(articlesDoc.slice(0, articlesDoc.indexOf("\n## Glossary"))).map(({ title, lines, text }) => {
  const sourcesAt = lines.findIndex((line) => /^- \*\*sources:\*\*/.test(line));
  const bodyLines = lines
    .slice(1, sourcesAt)
    .filter((line) => !/^- \*\*(id|pillar|summary|protocols):\*\*/.test(line) && !/^## /.test(line));
  const sections = [];
  let current = { heading: null, paragraphs: [], buffer: [] };
  const flush = () => {
    if (current.buffer.length) current.paragraphs.push(current.buffer.join(" ").trim());
    current.buffer = [];
  };
  for (const line of bodyLines) {
    const heading = line.match(/^#### (.*)$/);
    if (heading) {
      flush();
      if (current.paragraphs.length) sections.push(current);
      current = { heading: heading[1].trim(), paragraphs: [], buffer: [] };
    } else if (line.trim() === "") flush();
    else current.buffer.push(line.trim());
  }
  flush();
  if (current.paragraphs.length) sections.push(current);
  return {
    id: field(text, "id"),
    title,
    pillar: field(text, "pillar"),
    summary: field(text, "summary"),
    protocolIds: idList(field(text, "protocols")),
    sections: sections.map((section) => ({
      ...(section.heading ? { heading: section.heading } : {}),
      body: section.paragraphs.join("\n\n"),
    })),
    sources: sourceList(field(text, "sources")),
  };
});

// Readers never see internal ids: swap cross-references for display names.
// Some ids name both a protocol and an article; in running text they mean the protocol.
const names = new Map([
  ...articles.map((a) => [a.id, a.title]),
  ...protocols.map((p) => [p.id, p.name]),
]);
const idPattern = new RegExp(
  `(\\()?\\b(see )?(${[...names.keys()]
    .filter((id) => id.includes("-"))
    .sort((a, b) => b.length - a.length)
    .join("|")})(?![\\w-])(\\))?`,
  "g",
);
let crossRefs = 0;
const crossRefLog = process.argv.includes("--log-refs");
function clean(text) {
  if (text == null) return null;
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(idPattern, (match, open, see, id, close) => {
      crossRefs++;
      if (crossRefLog) console.log(`ref ${id}${readyIds.has(id) || articleIds.has(id) ? "" : " (held back)"}: ${match}`);
      const shown = readyIds.has(id) || articleIds.has(id);
      if (!shown) {
        if (open && close) return DROP;
        const name = names.get(id);
        return `${open ?? ""}${see ?? ""}${name[0].toLowerCase()}${name.slice(1)}${close ?? ""}`;
      }
      const ref = `“${names.get(id)}”`;
      if (open && close) return `(see ${ref})`;
      return `${open ?? ""}${see ?? ""}${ref}${close ?? ""}`;
    })
    .replace(new RegExp(`\\s*${DROP}`, "g"), "");
}
const DROP = "\u0000";

function equipmentKind(text) {
  const value = (text ?? "none").toLowerCase();
  if (value.startsWith("none (optional") || value.startsWith("optional")) return "optional";
  if (value.startsWith("none")) return "none";
  return "required";
}

const ready = protocols.filter((p) => p.app === "ready");
const readyIds = new Set(ready.map((p) => p.id));
const articleIds = new Set(articles.map((a) => a.id));
const errors = [];

const bundle = {
  version: 2,
  generatedFrom: ["research/protocols.md", "research/articles.md"],
  activities: ready.map((p) => {
    const equipment = equipmentKind(p.equipmentText);
    return {
      id: p.id,
      name: p.name,
      summary: clean(p.summary),
      pillar: p.pillar,
      steps: p.steps.map(clean),
      equipment,
      equipmentDetail: equipment === "none" && p.equipmentText === "none" ? null : clean(p.equipmentText),
      cautions: clean(p.cautions),
      articleIds: p.articleIds,
      sources: p.sources,
    };
  }),
  articles: articles.map((a) => ({
    id: a.id,
    title: a.title,
    pillar: a.pillar,
    summary: clean(a.summary),
    sections: a.sections.map((s) => ({ ...s, body: clean(s.body) })),
    relatedProtocolIds: a.protocolIds.filter((id) => readyIds.has(id)),
    sources: a.sources,
  })),
};

for (const [kind, items] of [["activity", bundle.activities], ["article", bundle.articles]]) {
  const seen = new Set();
  for (const item of items) {
    if (!item.id || seen.has(item.id)) errors.push(`${kind} id missing or duplicate: ${item.id}`);
    seen.add(item.id);
    if (!PILLARS.has(item.pillar)) errors.push(`${kind} ${item.id}: bad pillar ${item.pillar}`);
    if (!item.summary) errors.push(`${kind} ${item.id}: no summary`);
    if (!item.sources.length) errors.push(`${kind} ${item.id}: no sources`);
  }
}
for (const activity of bundle.activities) {
  if (!activity.steps.length) errors.push(`activity ${activity.id}: no steps`);
  for (const id of activity.articleIds) if (!articleIds.has(id)) errors.push(`activity ${activity.id}: missing article ${id}`);
}
for (const article of bundle.articles) {
  if (!article.sections.length) errors.push(`article ${article.id}: no body`);
  for (const id of article.relatedProtocolIds)
    if (!bundle.activities.find((a) => a.id === id && a.articleIds.includes(article.id)))
      errors.push(`article ${article.id}: one-way link to ${id}`);
}
const leftover = JSON.stringify(bundle).match(/\*\*|^#+ /m);
if (leftover) errors.push(`markdown left in output: ${leftover[0]}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

writeFileSync(path.join(root, "content/public-content.json"), `${JSON.stringify(bundle, null, 2)}\n`);
console.log(
  `activities ${bundle.activities.length} (held back ${protocols.length - ready.length}), articles ${bundle.articles.length}, cross-references named ${crossRefs}`,
);
