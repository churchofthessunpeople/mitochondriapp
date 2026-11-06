import assert from "node:assert/strict";
import test from "node:test";
import {
  getActivitiesForPillar,
  getPublicActivityById,
  getPublicContent,
  getPublicArticleById,
} from "./public-content";
import { PLACE_TERMS } from "./place-terms";
import rawDiseaseAllowList from "../../content/disease-allowlist.json";
import { DISEASE_TERMS } from "../../scripts/disease-terms.mjs";

const diseaseAllowList = rawDiseaseAllowList as { id: string; term: string; reason: string }[];

test("every activity has steps, sources and existing articles", () => {
  const content = getPublicContent();

  assert.ok(content.activities.length > 0);
  for (const activity of content.activities) {
    assert.ok(activity.steps.length > 0, activity.id);
    assert.ok(activity.sources.length > 0, activity.id);
    assert.ok(activity.articleIds.length > 0, activity.id);
    for (const articleId of activity.articleIds) {
      assert.ok(getPublicArticleById(articleId), `${activity.id} -> ${articleId}`);
    }
  }
});

test("article and practice links agree both ways", () => {
  for (const article of getPublicContent().articles) {
    assert.ok(article.sections.length > 0, article.id);
    assert.ok(article.sources.length > 0, article.id);
    for (const protocolId of article.relatedProtocolIds) {
      const activity = getPublicActivityById(protocolId);
      assert.ok(activity, `${article.id} -> ${protocolId}`);
      assert.ok(
        activity.articleIds.includes(article.id),
        `${protocolId} should link back to ${article.id}`,
      );
    }
  }
});

test("public text carries no markdown or internal ids", () => {
  const content = getPublicContent();
  const ids = [...content.activities, ...content.articles]
    .map((item) => item.id)
    .filter((id) => id.includes("-"));
  const texts = [
    ...content.activities.flatMap((activity) => [
      activity.summary,
      ...activity.steps,
      activity.cautions ?? "",
    ]),
    ...content.articles.flatMap((article) => [
      article.summary,
      ...article.keyPoints,
      ...article.sections.map((section) => section.body),
    ]),
    ...content.glossary.map((entry) => entry.meaning),
  ];
  for (const text of texts) {
    assert.equal(text.includes("**"), false, text.slice(0, 80));
    for (const id of ids) {
      assert.equal(
        new RegExp(`(^|[^\\w-])${id}(?![\\w-])`).test(text),
        false,
        `${id} in: ${text.slice(0, 80)}`,
      );
    }
  }
});

test("activities remain grouped into the four public pillars", () => {
  const content = getPublicContent();
  const ids = new Set(content.activities.map((activity) => activity.id));

  assert.equal(
    ids.size,
    content.activities.length,
    "activity ids should be stable and unique",
  );
  assert.ok(getActivitiesForPillar("light").length > 0);
  assert.ok(getActivitiesForPillar("water").length > 0);
  assert.ok(getActivitiesForPillar("magnetism").length > 0);
  assert.ok(getActivitiesForPillar("support").length > 0);
});

test("every Support item has a topic group and no other pillar does", () => {
  const content = getPublicContent();
  for (const item of [...content.activities, ...content.articles]) {
    if (item.pillar === "support") assert.ok(item.group, item.id);
    else assert.equal(item.group, null, item.id);
  }
});

test("condition-specific articles stay out of the public app", () => {
  for (const id of [
    "cancer-voltage",
    "diabetes-light-field",
    "heart-and-cholesterol",
    "pregnancy-and-birth",
    "children-and-autism",
  ]) {
    assert.equal(getPublicArticleById(id), undefined, id);
  }
});

test("articles lead with key points and stay within the word budget", () => {
  for (const article of getPublicContent().articles) {
    assert.ok(
      article.keyPoints.length >= 3 && article.keyPoints.length <= 5,
      `${article.id} has ${article.keyPoints.length} key points`,
    );
    const words = article.sections
      .map((section) => section.body)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(words <= 1200, `${article.id} has ${words} words`);
  }
});

test("article terms resolve to glossary entries the app ships", () => {
  const content = getPublicContent();
  const used = new Set(content.articles.flatMap((article) => article.terms));
  const shipped = new Set(content.glossary.map((entry) => entry.term));
  assert.ok(shipped.size > 0);
  for (const term of used) assert.ok(shipped.has(term), term);
  for (const term of shipped) assert.ok(used.has(term), `${term} ships but no article uses it`);
});

test("public text names no diseases outside the allow-list", () => {
  const content = getPublicContent();
  const items: [string, (string | null | undefined)[]][] = [
    ...content.activities.map((a): [string, (string | null)[]] => [
      a.id,
      [a.name, a.summary, ...a.steps, a.equipmentDetail, a.cautions],
    ]),
    ...content.articles.map((a): [string, (string | undefined)[]] => [
      a.id,
      [a.title, a.summary, ...a.keyPoints, ...a.sections.flatMap((s) => [s.heading, s.body])],
    ]),
    ...content.glossary.map((g): [string, string[]] => [`glossary:${g.term}`, [g.term, g.meaning]]),
  ];
  for (const [id, texts] of items) {
    const text = texts.filter(Boolean).join("\n");
    for (const { term, pattern } of DISEASE_TERMS) {
      if (!pattern.test(text)) continue;
      assert.ok(
        diseaseAllowList.some((entry) => entry.id === id && entry.term === term),
        `${id} names ${term}`,
      );
    }
  }
});

test("every place-screen term opens a published article", () => {
  for (const [id, term] of Object.entries(PLACE_TERMS)) {
    assert.ok(getPublicArticleById(term.articleId), `${id} -> ${term.articleId}`);
  }
});

test("public activity fields exclude tracker mechanics", () => {
  const forbidden = new Set([
    "points",
    "durationEnabled",
    "maxDurationMinutes",
    "maxPerDay",
    "permanent",
    "completion",
  ]);

  for (const activity of getPublicContent().activities) {
    for (const key of Object.keys(activity)) {
      assert.equal(forbidden.has(key), false, `${activity.id}.${key}`);
    }
  }
});
