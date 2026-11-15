// Builds content/public-content.json from research/protocols.md and research/articles.md.
// Only protocols marked `app: ready` become public activities; articles marked `app: hold` stay out.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { DISEASE_TERMS } from "./disease-terms.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const PILLARS = new Set(["light", "water", "magnetism", "support"]);
// Must match SUPPORT_GROUPS in src/lib/public-content.ts.
const SUPPORT_GROUPS = new Set(["food", "vagus-sound", "breathing", "sleep-cold-movement", "body-model", "other"]);
// Body words per public article; each research pass rebalances within this instead of only adding.
const ARTICLE_WORDS = { min: 800, max: 1200 };
const KEY_POINTS = { min: 3, max: 5 };

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
    group: field(text, "group"),
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
const glossaryAt = articlesDoc.indexOf("\n## Glossary");
const articles = entries(articlesDoc.slice(0, glossaryAt)).map(({ title, lines, text }) => {
  const sourcesAt = lines.findIndex((line) => /^- \*\*sources:\*\*/.test(line));
  const keyPoints = [];
  let inKeyPoints = false;
  const bodyLines = lines.slice(1, sourcesAt).filter((line) => {
    if (/^- \*\*key points:\*\*/.test(line)) return !(inKeyPoints = true);
    if (inKeyPoints) {
      const point = line.match(/^\s+- (.*)$/);
      if (point) return !keyPoints.push(point[1].trim());
      if (line.trim() === "") return false;
      inKeyPoints = false;
    }
    return !/^- \*\*(id|pillar|group|app|summary|protocols):\*\*/.test(line) && !/^## /.test(line);
  });
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
    group: field(text, "group"),
    app: field(text, "app"),
    summary: field(text, "summary"),
    keyPoints,
    protocolIds: idList(field(text, "protocols")),
    sections: sections.map((section) => ({
      ...(section.heading ? { heading: section.heading } : {}),
      body: section.paragraphs.join("\n\n"),
    })),
    sources: sourceList(field(text, "sources")),
  };
});

// Glossary rows are `| Term | Plain meaning |`. A term matches on its name before any trailing
// "(...)", and each side of "A / B". Names with inner capitals (ATP, ApoB) match case-sensitively.
const glossary = articlesDoc
  .slice(glossaryAt)
  .split("\n")
  .filter((line) => /^\| /.test(line))
  .slice(1)
  .map((line) => line.split("|").map((cell) => cell.trim()))
  .map(([, term, meaning]) => ({ term, meaning: meaning.replace(/([.!?]["”])\.$/, "$1") }));
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function termPatterns(term) {
  return term
    .replace(/\s*\([^)]*\)\s*$/, "")
    .split(/\s+\/\s+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => {
      const caseSensitive = /[A-Z]/.test(name.slice(1)) || /^[A-Z]{2,}/.test(name);
      return new RegExp(`(?<![\\w-])${escapeRegex(name)}(?:s|es)?(?![\\w-])`, caseSensitive ? "" : "i");
    });
}
const glossaryPatterns = glossary.map((entry) => ({ ...entry, patterns: termPatterns(entry.term) }));
const termsIn = (text) =>
  glossaryPatterns.filter(({ patterns }) => patterns.some((pattern) => pattern.test(text))).map(({ term }) => term);

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
const shownArticles = articles.filter((a) => a.app !== "hold");
const articleIds = new Set(shownArticles.map((a) => a.id));
const allArticleIds = new Set(articles.map((a) => a.id));
const errors = [];

for (const p of ready)
  for (const id of p.articleIds) if (!allArticleIds.has(id)) errors.push(`activity ${p.id}: missing article ${id}`);
for (const a of articles)
  if (a.app != null && a.app !== "hold") errors.push(`article ${a.id}: unknown app value ${a.app}`);

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
      group: p.group,
      steps: p.steps.map(clean),
      equipment,
      equipmentDetail: equipment === "none" && p.equipmentText === "none" ? null : clean(p.equipmentText),
      cautions: clean(p.cautions),
      articleIds: p.articleIds.filter((id) => articleIds.has(id)),
      sources: p.sources,
    };
  }),
  articles: shownArticles.map((a) => {
    const summary = clean(a.summary);
    const keyPoints = a.keyPoints.map(clean);
    const sections = a.sections.map((s) => ({ ...s, body: clean(s.body) }));
    return {
      id: a.id,
      title: a.title,
      pillar: a.pillar,
      group: a.group,
      summary,
      keyPoints,
      sections,
      terms: termsIn([summary, ...keyPoints, ...sections.map((s) => s.body)].join("\n")),
      relatedProtocolIds: a.protocolIds.filter((id) => readyIds.has(id)),
      sources: a.sources,
    };
  }),
};
const usedTerms = new Set(bundle.articles.flatMap((a) => a.terms));
bundle.glossary = glossary
  .filter(({ term }) => usedTerms.has(term))
  .map(({ term, meaning }) => ({ term, meaning: clean(meaning) }));

for (const [kind, items] of [["activity", bundle.activities], ["article", bundle.articles]]) {
  const seen = new Set();
  for (const item of items) {
    if (!item.id || seen.has(item.id)) errors.push(`${kind} id missing or duplicate: ${item.id}`);
    seen.add(item.id);
    if (!PILLARS.has(item.pillar)) errors.push(`${kind} ${item.id}: bad pillar ${item.pillar}`);
    if (item.pillar === "support" && !SUPPORT_GROUPS.has(item.group))
      errors.push(`${kind} ${item.id}: support needs a known group, got ${item.group}`);
    if (item.pillar !== "support" && item.group != null) errors.push(`${kind} ${item.id}: group outside support`);
    if (!item.summary) errors.push(`${kind} ${item.id}: no summary`);
    if (!item.sources.length) errors.push(`${kind} ${item.id}: no sources`);
  }
}
for (const activity of bundle.activities) {
  if (!activity.steps.length) errors.push(`activity ${activity.id}: no steps`);
  if (!activity.articleIds.length) errors.push(`activity ${activity.id}: every linked article is held back`);
}
const warnings = [];
for (const article of bundle.articles) {
  if (!article.sections.length) errors.push(`article ${article.id}: no body`);
  const words = article.sections.reduce((sum, s) => sum + s.body.split(/\s+/).filter(Boolean).length, 0);
  if (words > ARTICLE_WORDS.max) errors.push(`article ${article.id}: ${words} words, over the ${ARTICLE_WORDS.max} budget`);
  if (words < ARTICLE_WORDS.min) warnings.push(`article ${article.id}: ${words} words, under ${ARTICLE_WORDS.min}`);
  if (article.keyPoints.length < KEY_POINTS.min || article.keyPoints.length > KEY_POINTS.max)
    errors.push(`article ${article.id}: ${article.keyPoints.length} key points, needs ${KEY_POINTS.min}-${KEY_POINTS.max}`);
  for (const id of article.relatedProtocolIds)
    if (!bundle.activities.find((a) => a.id === id && a.articleIds.includes(article.id)))
      errors.push(`article ${article.id}: one-way link to ${id}`);
}
const leftover = JSON.stringify(bundle).match(/\*\*|^#+ /m);
if (leftover) errors.push(`markdown left in output: ${leftover[0]}`);

// Public text explains the model; it never names diseases or diagnoses.
const allowed = JSON.parse(read("content/disease-allowlist.json"));
const allowUsed = new Set();
const publicTexts = [
  ...bundle.activities.map((a) => [`activity ${a.id}`, a.id, [a.name, a.summary, ...a.steps, a.equipmentDetail, a.cautions]]),
  ...bundle.articles.map((a) => [`article ${a.id}`, a.id, [a.title, a.summary, ...a.keyPoints, ...a.sections.flatMap((s) => [s.heading, s.body])]]),
  ...bundle.glossary.map((g) => [`glossary ${g.term}`, `glossary:${g.term}`, [g.term, g.meaning]]),
];
for (const [label, id, texts] of publicTexts) {
  const text = texts.filter(Boolean).join("\n");
  for (const { term, pattern } of DISEASE_TERMS) {
    const match = text.match(pattern);
    if (!match) continue;
    const allow = allowed.findIndex((entry) => entry.id === id && entry.term === term);
    if (allow >= 0) {
      allowUsed.add(allow);
      continue;
    }
    const snippet = text.slice(Math.max(0, match.index - 60), match.index + match[0].length + 60).replace(/\s+/g, " ");
    errors.push(`${label}: names "${term}" in "…${snippet}…"`);
  }
}
allowed.forEach((entry, index) => {
  if (!allowUsed.has(index)) warnings.push(`disease allow-list entry no longer needed: ${entry.id} ${entry.term}`);
});

if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

writeFileSync(path.join(root, "content/public-content.json"), `${JSON.stringify(bundle, null, 2)}\n`);
console.log(
  `activities ${bundle.activities.length} (held back ${protocols.length - ready.length}), articles ${bundle.articles.length} (held back ${articles.length - shownArticles.length}), cross-references named ${crossRefs}`,
);
