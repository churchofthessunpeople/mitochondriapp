// Verifies research/articles.md after folding teachings-new.md.
// Usage: node verify-new.js <path-to-articles-before.md>
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const before = fs.readFileSync(process.argv[2], 'utf8');
const after = fs.readFileSync(path.join(root, 'articles.md'), 'utf8');
const protocols = fs.readFileSync(path.join(root, 'protocols.md'), 'utf8');
const input = fs.readFileSync(path.join(__dirname, 'teachings-new.md'), 'utf8');

const problems = [];
const parse = txt => txt.split(/\n(?=### )/).filter(p => /^- \*\*id:\*\* /m.test(p)).map(p => {
  const f = k => (p.match(new RegExp('^- \\*\\*' + k + ':\\*\\* (.*)$', 'm')) || [])[1];
  const srcLine = f('sources') || '';
  return {
    title: p.split('\n')[0].replace(/^### /, ''), id: f('id'), pillar: f('pillar'), summary: f('summary'),
    protocols: f('protocols'), sourcesLine: srcLine,
    sources: [...srcLine.matchAll(/\/posts\/(\d+)\//g)].map(m => m[1]), text: p,
  };
});
const A = parse(after), B = parse(before);

// 1. fields
for (const a of A) for (const k of ['id', 'pillar', 'summary', 'protocols', 'sourcesLine'])
  if (!a[k]) problems.push(`missing ${k} in "${a.title}"`);
// 2. unique ids
const seen = new Set();
for (const a of A) { if (seen.has(a.id)) problems.push('duplicate id ' + a.id); seen.add(a.id); }
// 3. source counts
for (const a of A) {
  if (a.sources.length < 3 || a.sources.length > 12) problems.push(`${a.id}: ${a.sources.length} sources`);
  if (new Set(a.sources).size !== a.sources.length) problems.push(`${a.id}: duplicate source`);
}
// 4. protocol ids exist
const protoIds = new Set([...protocols.matchAll(/^- \*\*id:\*\* (\S+)/gm)].map(m => m[1]));
for (const a of A) if (a.protocols && a.protocols.trim() !== 'none')
  for (const p of a.protocols.split(',').map(s => s.trim())) if (!protoIds.has(p)) problems.push(`${a.id}: unknown protocol ${p}`);
// 5. cited post ids exist in raw
const posts = {};
for (const f of fs.readdirSync(path.join(root, 'raw')).filter(f => f.endsWith('.json')))
  for (const th of JSON.parse(fs.readFileSync(path.join(root, 'raw', f), 'utf8')))
    for (const p of th.posts || []) posts[String(p.id)] = p.text || '';
const allCited = [...after.matchAll(/\/posts\/(\d+)\//g)].map(m => m[1]);
const missing = [...new Set(allCited)].filter(id => !(id in posts));
if (missing.length) problems.push('post ids not in raw: ' + missing.join(','));
// 5b. newly cited ids must come from the input items
const inputIds = new Set([...input.matchAll(/\/posts\/(\d+)\//g)].map(m => m[1]));
const bMap = Object.fromEntries(B.map(b => [b.id, b]));
const changes = [];
for (const a of A) {
  const b = bMap[a.id];
  const added = a.sources.filter(s => !b || !b.sources.includes(s));
  const removed = b ? b.sources.filter(s => !a.sources.includes(s)) : [];
  for (const s of added) if (!inputIds.has(s)) problems.push(`${a.id}: new source ${s} not from input`);
  const wa = a.text.split(/\s+/).length, wb = b ? b.text.split(/\s+/).length : 0;
  if (!b || wa !== wb || added.length || removed.length)
    changes.push(`${b ? 'changed' : 'NEW'} ${a.id}: words ${wb}->${wa}, sources ${b ? b.sources.length : 0}->${a.sources.length}` +
      (added.length ? ` +[${added}]` : '') + (removed.length ? ` -[${removed}]` : ''));
}
// 6. banned words
const banned = /contradict|inconsisten|no evidence|debunk|incorrect|factual slip/i;
after.split('\n').forEach((l, i) => { if (banned.test(l)) problems.push(`banned word at line ${i + 1}`); });
// 7. index before vs after
const idx = arr => arr.map(x => `${x.title} | ${x.id}`);
const ib = idx(B), ia = idx(A);
const addedIdx = ia.filter(x => !ib.includes(x)), removedIdx = ib.filter(x => !ia.includes(x));
const orderKept = ib.join('\n') === ia.filter(x => ib.includes(x)).join('\n');
if (removedIdx.length) problems.push('index entries removed: ' + removedIdx.join('; '));
if (!orderKept) problems.push('existing article order changed');
// 8. 10-word runs of new text vs raw posts
const norm = s => s.toLowerCase().replace(/[^a-z0-9%+\-'. ]+/g, ' ').replace(/[.']/g, '').replace(/\s+/g, ' ').trim();
const shingles = new Set();
for (const t of Object.values(posts)) {
  const w = norm(t).split(' ');
  for (let i = 0; i + 10 <= w.length; i++) shingles.add(w.slice(i, i + 10).join(' '));
}
const beforeLines = new Set(before.split('\n'));
const newLines = after.split('\n').filter(l => !beforeLines.has(l) && l.trim() && !l.startsWith('- **sources:**'));
let hits = 0;
for (const l of newLines) {
  const w = norm(l).split(' ');
  for (let i = 0; i + 10 <= w.length; i++) {
    const s = w.slice(i, i + 10).join(' ');
    if (shingles.has(s)) { hits++; problems.push('10-word match: "' + s + '"'); }
  }
}
const words = s => s.split(/\s+/).filter(Boolean).length;
console.log('Articles before/after:', B.length, A.length);
console.log('Index entries added:', addedIdx.join('; ') || 'none');
console.log('Existing order preserved:', orderKept);
console.log('Changed articles:\n  ' + changes.join('\n  '));
console.log(`articles.md words: ${words(before)} -> ${words(after)} (+${words(after) - words(before)})`);
console.log('New/changed lines checked for 10-word runs:', newLines.length, 'hits:', hits);
console.log(problems.length ? 'PROBLEMS:\n  ' + problems.join('\n  ') : 'ALL CHECKS PASSED');
