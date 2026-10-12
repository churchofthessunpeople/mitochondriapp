import rawContent from "../../content/public-content.json";

export type PublicPillar = "light" | "water" | "magnetism" | "support";
export type PublicEquipment = "none" | "optional" | "required";
export type SupportGroup =
  | "food"
  | "vagus-sound"
  | "breathing"
  | "sleep-cold-movement"
  | "body-model"
  | "other";

export type PublicSource = {
  label: string;
  url: string;
};

export type PublicActivity = {
  id: string;
  name: string;
  summary: string;
  pillar: PublicPillar;
  group: SupportGroup | null;
  steps: string[];
  equipment: PublicEquipment;
  equipmentDetail: string | null;
  cautions: string | null;
  articleIds: string[];
  sources: PublicSource[];
};

export type PublicArticleSection = {
  heading?: string;
  body: string;
};

export type PublicArticle = {
  id: string;
  title: string;
  pillar: PublicPillar;
  group: SupportGroup | null;
  summary: string;
  sections: PublicArticleSection[];
  relatedProtocolIds: string[];
  sources: PublicSource[];
};

export type PublicContentBundle = {
  activities: PublicActivity[];
  articles: PublicArticle[];
};

export const PUBLIC_PILLARS: readonly {
  id: PublicPillar;
  label: string;
  blurb: string;
}[] = [
  {
    id: "light",
    label: "Light",
    blurb: "Morning light, outdoor spectrum, and darkness after sunset.",
  },
  {
    id: "water",
    label: "Water",
    blurb: "Hydration, minerals, deuterium, and the water around ATP.",
  },
  {
    id: "magnetism",
    label: "Magnetism",
    blurb: "Earth contact, field context, and quieter spaces.",
  },
  {
    id: "support",
    label: "Support",
    blurb: "Food, breath, sound, sleep, cold, and the ideas that tie it together.",
  },
] as const;

// Order here is the order of the Support filter buttons.
export const SUPPORT_GROUPS: readonly { id: SupportGroup; label: string }[] = [
  { id: "food", label: "Food and fasting" },
  { id: "vagus-sound", label: "Vagus and sound" },
  { id: "breathing", label: "Breathing" },
  { id: "sleep-cold-movement", label: "Sleep, cold and movement" },
  { id: "body-model", label: "How the body works" },
  { id: "other", label: "Other" },
] as const;

const PILLAR_IDS = new Set<PublicPillar>(
  PUBLIC_PILLARS.map((pillar) => pillar.id),
);
const GROUP_IDS = new Set<SupportGroup>(SUPPORT_GROUPS.map((group) => group.id));
const EQUIPMENT_IDS = new Set<PublicEquipment>([
  "none",
  "optional",
  "required",
]);
const FORUM_POST_URL = /^https:\/\/forum\.jackkruse\.com\/posts\/\d+\/$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(
  value: unknown,
  field: string,
  context: string,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid public content: ${context}.${field}`);
  }
  return value.trim();
}

function optionalString(
  value: unknown,
  field: string,
  context: string,
): string | null {
  return value == null ? null : requiredString(value, field, context);
}

function pillarOf(value: unknown, context: string): PublicPillar {
  if (typeof value !== "string" || !PILLAR_IDS.has(value as PublicPillar)) {
    throw new Error(`Invalid public pillar: ${context}`);
  }
  return value as PublicPillar;
}

function groupOf(
  value: unknown,
  pillar: PublicPillar,
  context: string,
): SupportGroup | null {
  if (pillar !== "support") {
    if (value != null) throw new Error(`Group outside Support: ${context}`);
    return null;
  }
  if (typeof value !== "string" || !GROUP_IDS.has(value as SupportGroup)) {
    throw new Error(`Invalid Support group: ${context}`);
  }
  return value as SupportGroup;
}

function idList(value: unknown, context: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid public content: ${context} is not a list`);
  }
  return value.map((id, index) => requiredString(id, `[${index}]`, context));
}

function sourceList(value: unknown, context: string): PublicSource[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Public content has no sources: ${context}`);
  }
  return value.map((rawSource, index) => {
    if (!isRecord(rawSource)) {
      throw new Error(`Invalid source in public content: ${context}`);
    }
    const url = requiredString(rawSource.url, "url", `${context}.sources[${index}]`);
    if (!FORUM_POST_URL.test(url)) {
      throw new Error(`Source is not a forum post link: ${context} ${url}`);
    }
    return {
      label: requiredString(rawSource.label, "label", `${context}.sources[${index}]`),
      url,
    };
  });
}

function parseContent(value: unknown): PublicContentBundle {
  if (
    !isRecord(value) ||
    !Array.isArray(value.activities) ||
    !Array.isArray(value.articles)
  ) {
    throw new Error("Invalid public content bundle.");
  }

  const articles = value.articles.map((rawArticle, index): PublicArticle => {
    if (!isRecord(rawArticle)) {
      throw new Error(`Invalid public article at index ${index}.`);
    }
    const id = requiredString(rawArticle.id, "id", `article[${index}]`);
    if (!Array.isArray(rawArticle.sections) || rawArticle.sections.length === 0) {
      throw new Error(`Public article has no sections: ${id}`);
    }
    const sections = rawArticle.sections.map((rawSection, sectionIndex) => {
      if (!isRecord(rawSection)) {
        throw new Error(`Invalid section in public article: ${id}`);
      }
      const context = `${id}.sections[${sectionIndex}]`;
      const heading = optionalString(rawSection.heading, "heading", context);
      return {
        ...(heading ? { heading } : {}),
        body: requiredString(rawSection.body, "body", context),
      };
    });

    const pillar = pillarOf(rawArticle.pillar, id);
    return {
      id,
      title: requiredString(rawArticle.title, "title", id),
      pillar,
      group: groupOf(rawArticle.group, pillar, id),
      summary: requiredString(rawArticle.summary, "summary", id),
      sections,
      relatedProtocolIds: idList(rawArticle.relatedProtocolIds, `${id}.relatedProtocolIds`),
      sources: sourceList(rawArticle.sources, id),
    };
  });

  const activities = value.activities.map((rawActivity, index): PublicActivity => {
    if (!isRecord(rawActivity)) {
      throw new Error(`Invalid public activity at index ${index}.`);
    }
    const id = requiredString(rawActivity.id, "id", `activity[${index}]`);
    const equipment = rawActivity.equipment;
    if (
      typeof equipment !== "string" ||
      !EQUIPMENT_IDS.has(equipment as PublicEquipment)
    ) {
      throw new Error(`Invalid public activity equipment: ${id}`);
    }
    if (!Array.isArray(rawActivity.steps) || rawActivity.steps.length === 0) {
      throw new Error(`Public activity has no steps: ${id}`);
    }

    const pillar = pillarOf(rawActivity.pillar, id);
    return {
      id,
      name: requiredString(rawActivity.name, "name", id),
      summary: requiredString(rawActivity.summary, "summary", id),
      pillar,
      group: groupOf(rawActivity.group, pillar, id),
      steps: rawActivity.steps.map((step, stepIndex) =>
        requiredString(step, `steps[${stepIndex}]`, id),
      ),
      equipment: equipment as PublicEquipment,
      equipmentDetail: optionalString(rawActivity.equipmentDetail, "equipmentDetail", id),
      cautions: optionalString(rawActivity.cautions, "cautions", id),
      articleIds: idList(rawActivity.articleIds, `${id}.articleIds`),
      sources: sourceList(rawActivity.sources, id),
    };
  });

  const articleIds = new Set(articles.map((article) => article.id));
  const activityIds = new Set(activities.map((activity) => activity.id));
  for (const activity of activities) {
    for (const articleId of activity.articleIds) {
      if (!articleIds.has(articleId)) {
        throw new Error(`Missing article ${articleId} for activity ${activity.id}`);
      }
    }
  }
  for (const article of articles) {
    for (const protocolId of article.relatedProtocolIds) {
      if (!activityIds.has(protocolId)) {
        throw new Error(`Missing activity ${protocolId} for article ${article.id}`);
      }
    }
  }

  return { activities, articles };
}

const PUBLIC_CONTENT = parseContent(rawContent);

export function getPublicContent(): PublicContentBundle {
  return PUBLIC_CONTENT;
}

export function getPublicActivityById(
  id: string,
): PublicActivity | undefined {
  return PUBLIC_CONTENT.activities.find((activity) => activity.id === id);
}

export function getPublicArticleById(id: string): PublicArticle | undefined {
  return PUBLIC_CONTENT.articles.find((article) => article.id === id);
}

export function getActivitiesForPillar(
  pillar: PublicPillar,
): PublicActivity[] {
  return PUBLIC_CONTENT.activities.filter(
    (activity) => activity.pillar === pillar,
  );
}
