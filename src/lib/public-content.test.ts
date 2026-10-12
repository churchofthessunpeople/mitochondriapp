import assert from "node:assert/strict";
import test from "node:test";
import {
  getActivitiesForPillar,
  getPublicActivityById,
  getPublicContent,
  getPublicArticleById,
} from "./public-content";

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
      ...article.sections.map((section) => section.body),
    ]),
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
