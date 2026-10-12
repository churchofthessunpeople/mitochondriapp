"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ChevronRight,
  Droplets,
  Feather,
  MapPin,
  Magnet,
  Sun,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  PUBLIC_PILLARS,
  SUPPORT_GROUPS,
  type PublicActivity,
  type PublicArticle,
  type PublicContentBundle,
  type PublicPillar,
  type PublicSource,
  type SupportGroup,
} from "@/lib/public-content";
import { PLACE_TERMS, type PlaceTermId } from "@/lib/place-terms";
import {
  formatPublicPlaceLabel,
  type PublicPlaceResult,
} from "@/lib/public-place";
import {
  isSolarActivity,
  kpLabel,
  radioBlackoutLevel,
  type SolarActivity,
  type SolarFlare,
} from "@/lib/solar-activity";
import { isSunlitAt } from "@/lib/sun";
import type { SunPhaseWindow, UvbSeason } from "@/lib/sun-phases";

type Icon = LucideIcon;
type OpenPanel = PublicPillar | "place" | null;
type SolarState = { data: SolarActivity; receivedAt: number };
type ListTab = "practices" | "articles";
type DialogView =
  | { kind: "list" }
  | { kind: "practice"; activity: PublicActivity }
  | { kind: "article"; article: PublicArticle };
type DetailView = Exclude<DialogView, { kind: "list" }>;
type OpenView = (view: DetailView) => void;
type OpenTerm = (term: PlaceTermId) => void;

const SOLAR_REFRESH_MS = 10 * 60 * 1000;
/** NOAA G1 (minor) geomagnetic storm threshold. */
const STORM_KP = 5;

function stormKp(solar: SolarActivity): number | null {
  const kp = Math.max(solar.kp?.value ?? 0, solar.maxKp24h ?? 0);
  return kp >= STORM_KP ? kp : null;
}

const ORBIT_CONTROLS: {
  id: Exclude<PublicPillar, "support">;
  icon: Icon;
  className: string;
}[] = [
  { id: "light", icon: Sun, className: "orbit-control--light" },
  { id: "water", icon: Droplets, className: "orbit-control--water" },
  { id: "magnetism", icon: Magnet, className: "orbit-control--magnetism" },
];

const PILLAR_LABELS: Record<PublicPillar, string> = {
  light: "Light",
  water: "Water",
  magnetism: "Magnetism",
  support: "Support",
};

function equipmentLabel(equipment: PublicActivity["equipment"]): string {
  if (equipment === "required") return "Needs gear";
  if (equipment === "optional") return "Gear optional";
  return "No gear";
}

function readingTimeLabel(article: PublicArticle): string {
  const words = [article.summary, ...article.sections.map((s) => s.body)]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function pickById<T extends { id: string }>(items: T[], ids: string[]): T[] {
  return ids
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is T => item !== undefined);
}

function InlineText({ text }: { text: string }) {
  return text.split(/(\*[^*\s][^*]*\*)/).map((part, index) =>
    /^\*[^*\s][^*]*\*$/.test(part) ? (
      <em key={index}>{part.slice(1, -1)}</em>
    ) : (
      part
    ),
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="dialog-copy">
      {text.split(/\n{2,}/).map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 18)}`}>
          <InlineText text={paragraph} />
        </p>
      ))}
    </div>
  );
}

function SourceList({ sources }: { sources: PublicSource[] }) {
  return (
    <section className="source-list" aria-label="Sources">
      <p className="eyebrow">Sources</p>
      <p className="dialog-note">
        Dr. Kruse&apos;s posts on forum.jackkruse.com, paraphrased here. The
        forum is free to join.
      </p>
      <ul>
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              Post {source.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PlaceContext({
  place,
  pillar,
}: {
  place: PublicPlaceResult;
  pillar: Exclude<PublicPillar, "support">;
}) {
  const isLight = pillar === "light";
  const { geomag, bedrock, dipZone } = place.factors;
  const uvb = place.sunPhases?.uvbWindow;

  const lightLine = `Sunrise ${formatClock(place.sun.sunrise, place.timezone)} · ${
    uvb
      ? `UV-B window ${formatWindow(uvb, place.timezone)}`
      : "no UV-B window today"
  } · sunset ${formatClock(place.sun.sunset, place.timezone)}.`;
  const magnetismLine = [
    geomag ? `${geomag.summaryLine}.` : "Magnetic field detail is temporarily unavailable.",
    bedrock ? `Bedrock: ${bedrock.rockLabel}.` : null,
    dipZone?.zone
      ? `Inside Kruse's dip-change zone #${dipZone.zone.rank} (${dipZone.zone.name}).`
      : dipZone?.inCorridor
        ? "Inside Kruse's fastest-falling dip corridor."
        : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="place-context" aria-label={`${PILLAR_LABELS[pillar]} place context`}>
      <div className="place-context__heading">
        <MapPin aria-hidden="true" size={14} strokeWidth={1.8} />
        <span>{formatPublicPlaceLabel(place)}</span>
      </div>
      <p>{isLight ? lightLine : magnetismLine}</p>
    </div>
  );
}

function formatClock(value: string | null, timeZone: string): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

function formatWindow(window: SunPhaseWindow, timeZone: string): string {
  return `${formatClock(window.start, timeZone)} – ${formatClock(window.end, timeZone)}`;
}

/** `YYYY-MM-DD` (+ day offset) → "Oct 23". */
function formatCalendarDay(isoDay: string, offsetDays = 0): string {
  const date = new Date(`${isoDay}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  }).format(date);
}

function uvbSeasonLine(season: UvbSeason): string {
  switch (season.kind) {
    case "ends":
      return `Until ~${formatCalendarDay(season.date, -1)}`;
    case "returns":
      return `Returns ~${formatCalendarDay(season.date)}`;
    case "all-year":
      return "All year";
    case "never":
      return "Never here";
  }
}

function PlaceTermLabel({ term, onOpen }: { term: PlaceTermId; onOpen: OpenTerm }) {
  const tipId = useId();
  const { label, tip } = PLACE_TERMS[term];
  return (
    <>
      <button
        type="button"
        className="place-term"
        aria-describedby={tipId}
        onClick={() => onOpen(term)}
      >
        {label}
      </button>
      <span role="tooltip" id={tipId} className="place-term__tip">
        {tip}
      </span>
    </>
  );
}

function formatAgo(iso: string, referenceMs: number): string {
  const minutes = Math.max(
    0,
    Math.round((referenceMs - new Date(iso).getTime()) / 60_000),
  );
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

function formatFlareTime(iso: string, timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function describeFlareTiming(flare: SolarFlare, receivedAt: number): string {
  return flare.ongoing
    ? "in progress"
    : `peaked ${formatAgo(flare.peakTime, receivedAt)}`;
}

function SolarFlareAlert({
  flare,
  receivedAt,
  onOpen,
}: {
  flare: SolarFlare;
  receivedAt: number;
  onOpen: () => void;
}) {
  const timing = describeFlareTiming(flare, receivedAt);
  return (
    <div className="solar-alert" role="status">
      <button
        type="button"
        className="solar-alert__button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`Large solar flare alert: ${flare.flareClass} flare ${timing}. Open recent solar activity.`}
      >
        <Zap aria-hidden="true" size={14} strokeWidth={2} />
        <span>
          {flare.flareClass} solar flare · {timing}
        </span>
      </button>
    </div>
  );
}

function StormAlert({ kp, onOpen }: { kp: number; onOpen: () => void }) {
  return (
    <div className="solar-alert" role="status">
      <button
        type="button"
        className="solar-alert__button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={`Geomagnetic storm: Kp ${kp.toFixed(1)}. Open recent solar activity.`}
      >
        <Zap aria-hidden="true" size={14} strokeWidth={2} />
        <span>Geomagnetic storm · Kp {kp.toFixed(1)}</span>
      </button>
    </div>
  );
}

function SolarActivitySection({
  solar,
  unavailable,
  place,
  onTerm,
}: {
  solar: SolarState | null;
  unavailable: boolean;
  place: PublicPlaceResult | null;
  onTerm: OpenTerm;
}) {
  if (!solar) {
    return (
      <section className="place-result__section solar-section" id="solar-activity">
        <p className="eyebrow">
          <PlaceTermLabel term="solar" onOpen={onTerm} />
        </p>
        <p className="place-result__detail">
          {unavailable
            ? "Solar activity is temporarily unavailable."
            : "Reading recent solar activity…"}
        </p>
      </section>
    );
  }

  const { data, receivedAt } = solar;
  const timeZone = place?.timezone;
  const largest = data.largestFlare24h;
  const storm = stormKp(data);
  const isStormDay = storm != null || data.alertFlare != null;
  const blackout = largest ? radioBlackoutLevel(largest.peakFlux) : null;
  const placeLabel = place ? formatPublicPlaceLabel(place) : null;
  const sunlitAtPeak =
    place && largest && blackout
      ? isSunlitAt(new Date(largest.peakTime), place.latitude, place.longitude)
      : null;

  return (
    <section
      className="place-result__section solar-section"
      id="solar-activity"
      aria-label="Recent solar activity"
    >
      <p className="eyebrow">
        <PlaceTermLabel term="solar" onOpen={onTerm} />
      </p>
      {data.alertFlare ? (
        <p className="solar-section__alert">
          Large flare: {data.alertFlare.flareClass}{" "}
          {describeFlareTiming(data.alertFlare, receivedAt)}
        </p>
      ) : null}
      {isStormDay ? (
        <div className="storm-day">
          <p className="storm-day__title">
            {storm != null
              ? `Geomagnetic storm: Kp ${storm.toFixed(1)} in the past 24 hours`
              : "Large flare in the past 24 hours"}
          </p>
          <p>
            Treat today as a space-weather day: ground longer than your usual
            20–60 minutes and keep morning sun strict. After a big flare, the
            next 48 hours count too.
          </p>
        </div>
      ) : null}
      <div className="place-data-grid">
        <div>
          <span>Largest · 24 h</span>
          <strong>{largest?.flareClass ?? "None"}</strong>
        </div>
        <div>
          <span>Largest · 7 d</span>
          <strong>{data.largestFlare7d?.flareClass ?? "None"}</strong>
        </div>
        <div>
          <span>M/X flares · 7 d</span>
          <strong>{data.significantFlareCount7d}</strong>
        </div>
        <div>
          <span>Kp now</span>
          <strong>{data.kp ? data.kp.value.toFixed(1) : "—"}</strong>
        </div>
      </div>
      <p>
        {largest
          ? `${largest.flareClass} ${largest.ongoing ? "in progress" : "peaked"} ${formatFlareTime(largest.peakTime, timeZone)}${blackout ? ` · ${blackout.scale} ${blackout.label} radio blackout` : ""}`
          : "No flares recorded in the past 24 hours."}
      </p>
      {data.kp ? (
        <p>
          Geomagnetic field: {kpLabel(data.kp.value)}
          {data.maxKp24h != null
            ? ` · 24 h max Kp ${data.maxKp24h.toFixed(1)}`
            : ""}
        </p>
      ) : null}
      {blackout ? (
        <p className="place-result__detail">
          {sunlitAtPeak == null
            ? "Enter a ZIP code to see whether your location was in daylight at the flare peak."
            : sunlitAtPeak
              ? `${placeLabel} was on the sunlit side at the flare peak, where flare X-rays disturb the upper atmosphere.`
              : `${placeLabel} was on the night side at the flare peak, shielded from its direct X-ray effects.`}
        </p>
      ) : null}
      <p className="place-result__detail">
        Flare X-rays arrive in about 8 minutes. A related geomagnetic storm, if
        any, usually follows 1–3 days later. Data: NOAA SWPC.
      </p>
    </section>
  );
}

function isPublicPlaceResult(value: unknown): value is PublicPlaceResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "postalCode" in value &&
    typeof value.postalCode === "string" &&
    "placeName" in value &&
    typeof value.placeName === "string" &&
    "sun" in value &&
    typeof value.sun === "object" &&
    value.sun !== null &&
    "factors" in value &&
    typeof value.factors === "object" &&
    value.factors !== null
  );
}

function ActivityDialog({
  pillar,
  activities,
  allActivities,
  articles,
  place,
  onClose,
}: {
  pillar: PublicPillar;
  activities: PublicActivity[];
  allActivities: PublicActivity[];
  articles: PublicArticle[];
  place: PublicPlaceResult | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ListTab>("practices");
  const [history, setHistory] = useState<DialogView[]>([{ kind: "list" }]);
  const view = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : null;
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPlaceAware = pillar === "light" || pillar === "magnetism";
  const groupRank = (item: { group: SupportGroup | null }) =>
    SUPPORT_GROUPS.findIndex((entry) => entry.id === item.group);
  const pillarArticles = articles
    .filter((article) => article.pillar === pillar)
    .sort(
      (a, b) => groupRank(a) - groupRank(b) || a.title.localeCompare(b.title),
    );
  const pillarActivities = [...activities].sort(
    (a, b) => groupRank(a) - groupRank(b),
  );
  const [group, setGroup] = useState<SupportGroup | "all">("all");
  const tabItems: { group: SupportGroup | null }[] =
    tab === "practices" ? activities : pillarArticles;
  const groupsOnTab =
    pillar === "support"
      ? SUPPORT_GROUPS.map((item) => ({
          ...item,
          count: tabItems.filter((entry) => entry.group === item.id).length,
        })).filter((item) => item.count > 0)
      : [];
  const activeGroup = groupsOnTab.some((item) => item.id === group)
    ? group
    : "all";
  const inGroup = (item: { group: SupportGroup | null }) =>
    activeGroup === "all" || item.group === activeGroup;

  function showView(update: (current: DialogView[]) => DialogView[]) {
    setHistory(update);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("[data-dialog-focus]")
        ?.focus();
    });
  }

  function navigate(next: DialogView) {
    showView((current) => [...current, next]);
  }

  function goBack() {
    showView((current) =>
      current.length > 1 ? current.slice(0, -1) : current,
    );
  }

  const backLabel =
    previous?.kind === "practice"
      ? `Back to ${previous.activity.name}`
      : previous?.kind === "article"
        ? `Back to ${previous.article.title}`
        : `Back to ${PILLAR_LABELS[pillar]} ${tab}`;
  const title =
    view.kind === "practice"
      ? view.activity.name
      : view.kind === "article"
        ? view.article.title
        : tab === "practices"
          ? "Choose a practice"
          : "Read an article";

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        ref={panelRef}
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`dialog-title-${pillar}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          {view.kind !== "list" ? (
            <button
              type="button"
              className="dialog-icon-button"
              onClick={goBack}
              aria-label={backLabel}
              data-dialog-focus
            >
              <ArrowLeft aria-hidden="true" size={18} />
            </button>
          ) : (
            <span className="dialog-pillar-mark" aria-hidden="true">
              {pillar === "light" ? (
                <Sun size={18} />
              ) : pillar === "water" ? (
                <Droplets size={18} />
              ) : pillar === "magnetism" ? (
                <Magnet size={18} />
              ) : (
                <Feather size={18} />
              )}
            </span>
          )}
          <div className="dialog-header__copy">
            <p className="eyebrow">{PILLAR_LABELS[pillar]}</p>
            <h2 id={`dialog-title-${pillar}`}>{title}</h2>
          </div>
          <button
            type="button"
            className="dialog-icon-button"
            onClick={onClose}
            aria-label="Close dialog"
            data-dialog-focus={view.kind === "list" ? true : undefined}
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <div className="dialog-scroll" ref={scrollRef}>
          {view.kind === "practice" ? (
            <PracticeDetail
              activity={view.activity}
              articles={pickById(articles, view.activity.articleIds)}
              onOpenArticle={(article) => navigate({ kind: "article", article })}
            />
          ) : view.kind === "article" ? (
            <ArticleDetail
              article={view.article}
              practices={pickById(
                allActivities,
                view.article.relatedProtocolIds,
              )}
              onOpenPractice={(activity) =>
                navigate({ kind: "practice", activity })
              }
            />
          ) : (
            <>
              <div
                className="dialog-tabs"
                role="group"
                aria-label={`${PILLAR_LABELS[pillar]} sections`}
              >
                <button
                  type="button"
                  aria-pressed={tab === "practices"}
                  onClick={() => setTab("practices")}
                >
                  Practices
                  <span aria-hidden="true">{activities.length}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={tab === "articles"}
                  onClick={() => setTab("articles")}
                >
                  Articles
                  <span aria-hidden="true">{pillarArticles.length}</span>
                </button>
              </div>
              <p className="dialog-intro">
                {PUBLIC_PILLARS.find((item) => item.id === pillar)?.blurb}
              </p>
              {groupsOnTab.length > 1 ? (
                <div
                  className="dialog-groups"
                  role="group"
                  aria-label={`${PILLAR_LABELS[pillar]} topics`}
                >
                  <button
                    type="button"
                    aria-pressed={activeGroup === "all"}
                    onClick={() => setGroup("all")}
                  >
                    All
                  </button>
                  {groupsOnTab.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={activeGroup === item.id}
                      onClick={() => setGroup(item.id)}
                    >
                      {item.label}
                      <span aria-hidden="true">{item.count}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {tab === "articles" ? (
                <div className="activity-list">
                  {pillarArticles.filter(inGroup).map((article) => (
                    <ChoiceButton
                      key={article.id}
                      name={article.title}
                      description={article.summary}
                      meta={readingTimeLabel(article)}
                      onClick={() =>
                        navigate({ kind: "article", article })
                      }
                    />
                  ))}
                </div>
              ) : (
                <>
                  {place && isPlaceAware ? (
                    <PlaceContext
                      place={place}
                      pillar={pillar as Exclude<PublicPillar, "support">}
                    />
                  ) : null}
                  <div className="activity-list">
                    {pillarActivities.filter(inGroup).map((activity) => (
                      <ChoiceButton
                        key={activity.id}
                        name={activity.name}
                        description={activity.summary}
                        meta={`${equipmentLabel(activity.equipment)} · ${
                          activity.steps.length
                        } ${activity.steps.length === 1 ? "step" : "steps"}`}
                        onClick={() => navigate({ kind: "practice", activity })}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ChoiceButton({
  name,
  description,
  meta,
  onClick,
}: {
  name: string;
  description: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="activity-choice" onClick={onClick}>
      <span className="activity-choice__copy">
        <span className="activity-choice__name">{name}</span>
        <span className="activity-choice__description">{description}</span>
        <span className="activity-choice__meta">{meta}</span>
      </span>
      <ChevronRight
        className="activity-choice__arrow"
        aria-hidden="true"
        size={18}
      />
    </button>
  );
}

function PracticeDetail({
  activity,
  articles,
  onOpenArticle,
}: {
  activity: PublicActivity;
  articles: PublicArticle[];
  onOpenArticle: (article: PublicArticle) => void;
}) {
  return (
    <article className="activity-detail">
      <p className="article-summary">{activity.summary}</p>

      <section className="how-to-section">
        <p className="eyebrow">How to do it</p>
        <ol className="step-list">
          {activity.steps.map((step, index) => (
            <li key={`${index}-${step.slice(0, 18)}`}>
              <span className="step-list__number" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                <InlineText text={step} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      {activity.equipmentDetail ? (
        <section className="option-list" aria-label="What you need">
          <div className="option-row">
            <strong>What you need</strong>
            <span>{activity.equipmentDetail}</span>
          </div>
        </section>
      ) : null}

      {activity.cautions ? (
        <section className="option-list" aria-label="Cautions">
          <div className="option-row option-row--caution">
            <strong>Cautions</strong>
            <span>
              <InlineText text={activity.cautions} />
            </span>
          </div>
        </section>
      ) : null}

      {articles.length ? (
        <section className="practice-reading" aria-label="Why he recommends it">
          <p className="eyebrow">Why he recommends it</p>
          {articles.map((article) => (
            <ChoiceButton
              key={article.id}
              name={article.title}
              description={article.summary}
              meta={readingTimeLabel(article)}
              onClick={() => onOpenArticle(article)}
            />
          ))}
        </section>
      ) : null}

      <SourceList sources={activity.sources} />
    </article>
  );
}

function ArticleDetail({
  article,
  practices,
  onOpenPractice,
}: {
  article: PublicArticle;
  practices: PublicActivity[];
  onOpenPractice: (activity: PublicActivity) => void;
}) {
  return (
    <article className="article-detail">
      <p className="article-summary">{article.summary}</p>
      <p className="activity-choice__meta">{readingTimeLabel(article)}</p>
      <div className="article-sections">
        {article.sections.map((section, index) => (
          <section key={`${index}-${section.heading ?? "intro"}`}>
            {section.heading ? <h3>{section.heading}</h3> : null}
            <Paragraphs text={section.body} />
          </section>
        ))}
      </div>

      {practices.length ? (
        <section className="practice-reading" aria-label="Related practices">
          <p className="eyebrow">Put it into practice</p>
          {practices.map((activity) => (
            <ChoiceButton
              key={activity.id}
              name={activity.name}
              description={activity.summary}
              meta={`${PILLAR_LABELS[activity.pillar]} · ${equipmentLabel(
                activity.equipment,
              )}`}
              onClick={() => onOpenPractice(activity)}
            />
          ))}
        </section>
      ) : null}

      <SourceList sources={article.sources} />
    </article>
  );
}

function PlaceDialog({
  place,
  initialZip,
  solar,
  solarUnavailable,
  scrollToSolar,
  activities,
  articles,
  onResolved,
  onClose,
}: {
  place: PublicPlaceResult | null;
  initialZip: string;
  solar: SolarState | null;
  solarUnavailable: boolean;
  scrollToSolar: boolean;
  activities: PublicActivity[];
  articles: PublicArticle[];
  onResolved: (place: PublicPlaceResult) => void;
  onClose: () => void;
}) {
  const [zip, setZip] = useState(initialZip);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DetailView[]>([]);
  const view = history.at(-1) ?? null;
  const previous = history.at(-2) ?? null;
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  function showView(update: (current: DetailView[]) => DetailView[]) {
    setHistory(update);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("[data-dialog-focus]")
        ?.focus();
    });
  }
  const openView: OpenView = (next) => showView((current) => [...current, next]);
  const openTerm: OpenTerm = (term) => {
    const article = articles.find((item) => item.id === PLACE_TERMS[term].articleId);
    if (article) openView({ kind: "article", article });
  };
  const goBack = () => showView((current) => current.slice(0, -1));
  const backLabel =
    previous?.kind === "practice"
      ? `Back to ${previous.activity.name}`
      : previous?.kind === "article"
        ? `Back to ${previous.article.title}`
        : "Back to Where you are";

  useEffect(() => {
    if (!scrollToSolar) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById("solar-activity")
        ?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollToSolar]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip }),
      });
      const data = (await response.json()) as unknown;
      if (!response.ok || !isPublicPlaceResult(data)) {
        const errorMessage =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "We could not resolve that ZIP code.";
        throw new Error(
          errorMessage,
        );
      }
      onResolved(data);
      try {
        window.localStorage.setItem("mito-place-zip", data.postalCode);
      } catch {
        // Private browsing and blocked storage are both fine.
      }
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "We could not resolve that ZIP code.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        ref={panelRef}
        className="dialog-panel dialog-panel--place"
        role="dialog"
        aria-modal="true"
        aria-label="Where you are"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          {view ? (
            <button
              type="button"
              className="dialog-icon-button"
              onClick={goBack}
              aria-label={backLabel}
              data-dialog-focus
            >
              <ArrowLeft aria-hidden="true" size={18} />
            </button>
          ) : (
            <span className="dialog-pillar-mark" aria-hidden="true">
              <MapPin size={18} />
            </span>
          )}
          <div className="dialog-header__copy">
            <p className="eyebrow">Where you are</p>
            {view ? (
              <h2>
                {view.kind === "practice" ? view.activity.name : view.article.title}
              </h2>
            ) : null}
          </div>
          <button
            type="button"
            className="dialog-icon-button"
            onClick={onClose}
            aria-label="Close place dialog"
            data-dialog-focus={view ? undefined : true}
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <div className="dialog-scroll" ref={scrollRef}>
          {view?.kind === "practice" ? (
            <PracticeDetail
              activity={view.activity}
              articles={pickById(articles, view.activity.articleIds)}
              onOpenArticle={(article) => openView({ kind: "article", article })}
            />
          ) : view?.kind === "article" ? (
            <ArticleDetail
              article={view.article}
              practices={pickById(activities, view.article.relatedProtocolIds)}
              onOpenPractice={(activity) => openView({ kind: "practice", activity })}
            />
          ) : (
          <>
          <form className="zip-form" onSubmit={handleSubmit}>
            <label htmlFor="place-zip">US ZIP code</label>
            <div className="zip-form__row">
              <input
                id="place-zip"
                name="zip"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                pattern="\d{5}(?:-?\d{4})?"
                maxLength={10}
                placeholder="e.g. 75201"
                value={zip}
                onChange={(event) => setZip(event.target.value)}
                required
                data-dialog-focus
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Reading…" : "Use ZIP"}
              </button>
            </div>
            <p className="form-hint">US ZIP codes only. We use a public geocoder.</p>
          </form>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          {place ? <PlaceResult place={place} onTerm={openTerm} /> : null}
          <SolarActivitySection
            solar={solar}
            unavailable={solarUnavailable}
            place={place}
            onTerm={openTerm}
          />
          </>
          )}
        </div>
      </section>
    </div>
  );
}

function PlaceResult({
  place,
  onTerm,
}: {
  place: PublicPlaceResult;
  onTerm: OpenTerm;
}) {
  const { factors } = place;
  const { bedrock, dipZone, volcano } = factors;
  const phases = place.sunPhases;
  return (
    <div className="place-result" aria-live="polite">
      <div className="place-result__location">
        <p className="eyebrow">Current context</p>
        <h3>{formatPublicPlaceLabel(place)}</h3>
        <p>
          {factors.latitudeLabel} · {place.timezone}
          {factors.elevationLabel ? ` · ${factors.elevationLabel}` : ""}
        </p>
      </div>
      <div className="place-data-grid">
        <div>
          <PlaceTermLabel term="sunrise" onOpen={onTerm} />
          <strong>{formatClock(place.sun.sunrise, place.timezone)}</strong>
        </div>
        <div>
          <PlaceTermLabel term="sunset" onOpen={onTerm} />
          <strong>{formatClock(place.sun.sunset, place.timezone)}</strong>
        </div>
        <div>
          <PlaceTermLabel term="solarNoon" onOpen={onTerm} />
          <strong>{factors.solarNoonLabel}</strong>
        </div>
        <div>
          <PlaceTermLabel term="dayLength" onOpen={onTerm} />
          <strong>
            {place.sun.dayLengthHours == null
              ? "—"
              : `${place.sun.dayLengthHours.toFixed(1)} h`}
          </strong>
        </div>
        {phases ? (
          <>
            <div>
              <PlaceTermLabel term="uva" onOpen={onTerm} />
              <strong>
                {phases.uvaPhase ? formatWindow(phases.uvaPhase, place.timezone) : "—"}
              </strong>
            </div>
            <div>
              <PlaceTermLabel term="uvb" onOpen={onTerm} />
              <strong>
                {phases.uvbWindow
                  ? formatWindow(phases.uvbWindow, place.timezone)
                  : "None today"}
              </strong>
              <small>{uvbSeasonLine(phases.uvbSeason)}</small>
            </div>
          </>
        ) : null}
      </div>
      <div className="place-result__section">
        <p className="eyebrow">
          <PlaceTermLabel term="field" onOpen={onTerm} />
        </p>
        <p>{factors.geomag?.summaryLine ?? "Field reading unavailable."}</p>
      </div>
      {dipZone ? (
        <div className="place-result__section">
          <p className="eyebrow">
            <PlaceTermLabel term="dipZone" onOpen={onTerm} />
          </p>
          {dipZone.zone ? (
            <>
              <p>
                Zone #{dipZone.zone.rank} of his 10: {dipZone.zone.name}, &ldquo;
                {dipZone.zone.nickname}&rdquo; ({dipZone.zone.distanceKm} km from
                the zone center).
              </p>
              <p className="place-result__detail">{dipZone.zone.summary}</p>
            </>
          ) : null}
          {dipZone.inCorridor ? (
            <p className="place-result__detail">{dipZone.corridorSummary}</p>
          ) : null}
          <p className="place-result__detail">If you can&apos;t move away, his steps are:</p>
          <ul className="place-result__list">
            {dipZone.mitigation.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="place-result__detail">
            Source:{" "}
            <a href={dipZone.source.url} target="_blank" rel="noopener noreferrer">
              Post {dipZone.source.label}
            </a>
          </p>
        </div>
      ) : null}
      <div className="place-result__section">
        <p className="eyebrow">
          <PlaceTermLabel term="ground" onOpen={onTerm} />
        </p>
        {bedrock ? (
          <>
            <p>
              {bedrock.unitName}: {bedrock.rockLabel}
              {bedrock.ageLabel ? ` (${bedrock.ageLabel})` : ""}.
            </p>
            {bedrock.note ? (
              <p className="place-result__detail">{bedrock.note}</p>
            ) : null}
          </>
        ) : (
          <p>Bedrock reading unavailable.</p>
        )}
        {bedrock ? (
          <p className="place-result__detail">Geology: {bedrock.source}.</p>
        ) : null}
      </div>
      <div className="place-result__section">
        <p className="eyebrow">
          <PlaceTermLabel term="volcano" onOpen={onTerm} />
        </p>
        {volcano.nearest ? (
          <p>
            {volcano.nearest.name} ({volcano.nearest.country}), last erupted{" "}
            {volcano.nearest.lastEruptionYear}
            {volcano.nearest.rock ? `, ${volcano.nearest.rock}` : ""},{" "}
            {volcano.nearest.distanceKm} km away.
          </p>
        ) : (
          <p>
            No volcano active since {volcano.activeSinceYear} within{" "}
            {volcano.radiusKm} km.
          </p>
        )}
        {volcano.note ? (
          <p className="place-result__detail">{volcano.note}</p>
        ) : null}
        <p className="place-result__detail">Volcanoes: {volcano.source}.</p>
      </div>
      {factors.artificialEm ? (
        <div className="place-result__section">
          <p className="eyebrow">
            <PlaceTermLabel term="artificialEm" onOpen={onTerm} />
          </p>
          <p>{factors.artificialEm.summaryLine}</p>
          <p className="place-result__detail">
            {factors.artificialEm.detailLine}
          </p>        </div>
      ) : null}
    </div>
  );
}

export function SwanHome({ content }: { content: PublicContentBundle }) {
  const [panel, setPanel] = useState<OpenPanel>(null);
  const [place, setPlace] = useState<PublicPlaceResult | null>(null);
  const [storedZip, setStoredZip] = useState("");
  const [solar, setSolar] = useState<SolarState | null>(null);
  const [solarUnavailable, setSolarUnavailable] = useState(false);
  const [scrollToSolar, setScrollToSolar] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSolarActivity() {
      try {
        const response = await fetch("/api/solar");
        const data = (await response.json()) as unknown;
        if (cancelled) return;
        if (response.ok && isSolarActivity(data)) {
          setSolar({ data, receivedAt: Date.now() });
          setSolarUnavailable(false);
        } else {
          setSolarUnavailable(true);
        }
      } catch {
        if (!cancelled) setSolarUnavailable(true);
      }
    }

    void loadSolarActivity();
    const interval = window.setInterval(loadSolarActivity, SOLAR_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    try {
      queueMicrotask(() => {
        try {
          setStoredZip(window.localStorage.getItem("mito-place-zip") ?? "");
        } catch {
          // Storage is optional.
        }
      });
    } catch {
      // Storage is optional.
    }
  }, []);

  useEffect(() => {
    if (!panel) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("[data-dialog-focus]")
        ?.focus();
    });
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [panel]);

  const resolvedZip = place?.postalCode ?? storedZip;
  const supportActivities = content.activities.filter(
    (activity) => activity.pillar === "support",
  );

  return (
    <main className="swan-home">
      <h1 className="sr-only">Mitochondriapp activity field guide</h1>
      <div className="swan-stage">
        <div className="stage-top">
          {solar?.data.alertFlare ? (
            <SolarFlareAlert
              flare={solar.data.alertFlare}
              receivedAt={solar.receivedAt}
              onOpen={() => {
                setScrollToSolar(true);
                setPanel("place");
              }}
            />
          ) : solar && stormKp(solar.data) != null ? (
            <StormAlert
              kp={stormKp(solar.data) as number}
              onOpen={() => {
                setScrollToSolar(true);
                setPanel("place");
              }}
            />
          ) : null}
        </div>

        {ORBIT_CONTROLS.map(({ id, icon: IconComponent, className }) => (
          <button
            key={id}
            type="button"
            className={`orbit-control ${className}`}
            onClick={() => setPanel(id)}
            aria-label={`Open ${PILLAR_LABELS[id]} activities`}
            aria-haspopup="dialog"
          >
            <span className="orbit-control__icon">
              <IconComponent aria-hidden="true" size={23} strokeWidth={1.55} />
            </span>
          </button>
        ))}

        <button
          type="button"
          className="swan-button"
          onClick={() => setPanel("support")}
          aria-label="Open Support activities"
          aria-haspopup="dialog"
        >
          <span className="swan-mark">
            <Image
              src="/icons/swan-mark.png?rev=20260801"
              alt=""
              fill
              priority
              unoptimized
              sizes="180px"
            />
          </span>
        </button>

        <button
          type="button"
          className="place-control"
          onClick={() => {
            setScrollToSolar(false);
            setPanel("place");
          }}
          aria-label={
            resolvedZip
              ? `Change place, current ZIP ${resolvedZip}`
              : "Set your place with a ZIP code"
          }
          aria-haspopup="dialog"
        >
          <MapPin aria-hidden="true" size={14} strokeWidth={1.8} />
          <span>{resolvedZip ? `ZIP ${resolvedZip}` : "Enter Zipcode"}</span>
        </button>
      </div>

      {panel && panel !== "place" ? (
        <div ref={dialogRef}>
          <ActivityDialog
            key={panel}
            pillar={panel}
            allActivities={content.activities}
            activities={
              panel === "support"
                ? supportActivities
                : content.activities.filter((activity) => activity.pillar === panel)
            }
            articles={content.articles}
            place={place}
            onClose={() => setPanel(null)}
          />
        </div>
      ) : null}
      {panel === "place" ? (
        <div ref={dialogRef}>
          <PlaceDialog
            place={place}
            initialZip={resolvedZip}
            solar={solar}
            solarUnavailable={solarUnavailable}
            scrollToSolar={scrollToSolar}
            activities={content.activities}
            articles={content.articles}
            onResolved={(nextPlace) => {
              setPlace(nextPlace);
              setStoredZip(nextPlace.postalCode);
            }}
            onClose={() => setPanel(null)}
          />
        </div>
      ) : null}
    </main>
  );
}
