import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

describe("Mitoversity articles on disk", () => {
  it("every article file is flat format with sections", () => {
    assert.ok(existsSync(ARTICLES_DIR), "content/articles/ missing");
    const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json"));
    assert.ok(files.length >= 35, `expected many articles, got ${files.length}`);

    for (const file of files) {
      const raw = JSON.parse(
        readFileSync(path.join(ARTICLES_DIR, file), "utf8"),
      ) as {
        id?: string;
        title?: string;
        flatArticle?: boolean;
        sections?: { heading: string; body: string }[];
        readingLevels?: unknown;
      };
      const id = file.replace(/\.json$/, "");
      assert.equal(raw.id, id, `${file} id mismatch`);
      assert.ok(raw.title && raw.title.length > 3, `${file} missing title`);
      assert.equal(raw.flatArticle, true, `${file} must be flatArticle`);
      assert.ok(
        Array.isArray(raw.sections) && raw.sections.length >= 3,
        `${file} needs ≥3 sections`,
      );
      assert.equal(
        raw.readingLevels,
        undefined,
        `${file} must not include readingLevels`,
      );
    }
  });
});
