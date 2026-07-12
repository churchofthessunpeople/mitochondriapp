import {
  scoreLocation,
  type PolicyFactors,
} from "@/lib/region-scoring";

export type RegionSeed = {
  id: string;
  name: string;
  country: string;
  locality: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  healthRating: number;
  sunScore: number;
  magnetismScore: number;
  policyScore: number;
  summary: string;
  magnetismNotes: string;
  lightNotes: string;
  policyNotes: string;
  sortOrder: number;
  /** Used to recompute scores; not stored */
  policy?: PolicyFactors;
};

type RegionDraft = Omit<
  RegionSeed,
  "healthRating" | "sunScore" | "magnetismScore" | "policyScore"
> & {
  policy: PolicyFactors;
  /** Optional manual notes override after auto-score */
  summary: string;
  magnetismNotes: string;
  lightNotes: string;
  policyNotes: string;
};

function scored(draft: RegionDraft): RegionSeed {
  const s = scoreLocation(draft.latitude, draft.longitude, draft.policy);
  const { policy: _p, ...rest } = draft;
  return {
    ...rest,
    sunScore: s.sunScore,
    magnetismScore: s.magnetismScore,
    policyScore: s.policyScore,
    healthRating: s.healthRating,
  };
}

/**
 * Curated places. Sun & magnetism scores are derived from lat/lng + volcano proximity.
 * Policy scores come from explicit freedom / Bitcoin / CBDC factors.
 * Educational framework only — not medical or political advice.
 */
export const REGION_SEEDS: RegionSeed[] = [
  scored({
    id: "el-salvador",
    name: "El Salvador",
    country: "El Salvador",
    locality: null,
    latitude: 13.6929,
    longitude: -89.2182,
    timezone: "America/El_Salvador",
    policy: {
      bitcoinLegalTender: true,
      cryptoFriendly: true,
      outdoorCulture: true,
      cbdcPressure: false,
      highSurveillance: false,
    },
    sortOrder: 1,
    summary:
      "Near-equatorial sun, Pacific volcanic arc (active magma), and Bitcoin as legal tender — top-tier under this scoring model.",
    magnetismNotes:
      "Auto-scored from proximity to Central American volcanic arc / free-flowing magma systems.",
    lightNotes:
      "Auto sun score from latitude (~13.7°N): deep tropical light year-round when used safely.",
    policyNotes:
      "Bitcoin legal tender + relatively open monetary experiments; outdoor culture supported.",
  }),
  scored({
    id: "costa-rica",
    name: "Costa Rica",
    country: "Costa Rica",
    locality: null,
    latitude: 9.9281,
    longitude: -84.0907,
    timezone: "America/Costa_Rica",
    policy: {
      cryptoFriendly: true,
      outdoorCulture: true,
    },
    sortOrder: 2,
    summary:
      "Strong tropical sun and volcanic geology; eco-outdoor culture with moderate crypto openness.",
    magnetismNotes: "Proximity to Central American volcanic corridor.",
    lightNotes: "Low latitude → high sun score.",
    policyNotes: "Outdoor-friendly; crypto-friendly but not BTC legal tender.",
  }),
  scored({
    id: "hawaii-big-island",
    name: "Hawaiʻi (Big Island)",
    country: "United States",
    locality: "Hilo / Kona corridor",
    latitude: 19.7297,
    longitude: -155.09,
    timezone: "Pacific/Honolulu",
    policy: {
      outdoorCulture: true,
      cryptoFriendly: true,
      cbdcPressure: true,
      highSurveillance: false,
    },
    sortOrder: 3,
    summary:
      "Intense tropical sun and one of Earth’s most active volcanic systems; US policy is mixed for monetary freedom.",
    magnetismNotes: "Hawaii hotspot — active magma (Kīlauea / Mauna Loa systems).",
    lightNotes: "Tropical latitude → excellent sun score.",
    policyNotes:
      "Outdoor culture strong; US-level CBDC/regulatory pressure offsets some monetary freedom.",
  }),
  scored({
    id: "chile-santiago",
    name: "Chile (Santiago)",
    country: "Chile",
    locality: "Santiago",
    latitude: -33.4489,
    longitude: -70.6693,
    timezone: "America/Santiago",
    policy: {
      outdoorCulture: true,
      cryptoFriendly: true,
    },
    sortOrder: 5,
    summary:
      "Andean/Pacific volcanic belt proximity and strong summer UV; mid-latitude winters are a trade-off.",
    magnetismNotes: "Near Andes / Ring of Fire volcanic arc.",
    lightNotes: "Subtropical-mid latitude: strong summers, weaker winters.",
    policyNotes: "Generally outdoor-accessible with moderate crypto openness.",
  }),
  scored({
    id: "iceland",
    name: "Iceland",
    country: "Iceland",
    locality: "Reykjavík",
    latitude: 64.1466,
    longitude: -21.9426,
    timezone: "Atlantic/Reykjavik",
    policy: {
      outdoorCulture: true,
      cryptoFriendly: true,
    },
    sortOrder: 6,
    summary:
      "World-class magma/geothermal magnetism story, but high latitude collapses winter light.",
    magnetismNotes: "Iceland hotspot / mid-Atlantic ridge volcanism.",
    lightNotes: "High latitude → low sun score despite summer midnight sun.",
    policyNotes: "Open outdoors culture; crypto-friendly relative to many peers.",
  }),
  scored({
    id: "portugal-lisbon",
    name: "Portugal (Lisbon)",
    country: "Portugal",
    locality: "Lisbon",
    latitude: 38.7223,
    longitude: -9.1393,
    timezone: "Europe/Lisbon",
    policy: {
      outdoorCulture: true,
      cryptoFriendly: true,
      cbdcPressure: true,
    },
    sortOrder: 10,
    summary:
      "Solid European light vs north; limited volcanic flux; EU digital-currency trajectory is a policy drag.",
    magnetismNotes: "Far from major active magma arcs.",
    lightNotes: "Mid-latitude: better UV than UK/Scandinavia, weaker than tropics.",
    policyNotes: "EU CBDC/regulatory environment reduces monetary freedom score.",
  }),
  scored({
    id: "uae-dubai",
    name: "UAE (Dubai)",
    country: "United Arab Emirates",
    locality: "Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: "Asia/Dubai",
    policy: {
      cryptoFriendly: true,
      outdoorCulture: false,
      highSurveillance: true,
      authoritarianEconomy: true,
    },
    sortOrder: 12,
    summary:
      "Excellent sun angle, but weak magnetic story and high-control governance under this model.",
    magnetismNotes: "Stable desert geology — not an active magma lifestyle zone.",
    lightNotes: "Subtropical desert sun (heat may force indoor life at peak hours).",
    policyNotes:
      "Crypto hubs exist, but surveillance and top-down economic control weigh down freedom score.",
  }),
  scored({
    id: "us-nyc",
    name: "United States (New York City)",
    country: "United States",
    locality: "New York City",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
    policy: {
      cryptoFriendly: true,
      cbdcPressure: true,
      highSurveillance: true,
      outdoorCulture: false,
    },
    sortOrder: 21,
    summary:
      "Seasonal light and dense artificial environment; US digital-currency and surveillance trends lower policy score.",
    magnetismNotes: "No nearby active magma arc for lifestyle magnetism scoring.",
    lightNotes: "Mid-latitude: usable summers, weak winters.",
    policyNotes:
      "Crypto legal but heavily regulated; CBDC research + urban surveillance culture.",
  }),
  scored({
    id: "uk-london",
    name: "United Kingdom (London)",
    country: "United Kingdom",
    locality: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London",
    policy: {
      cryptoFriendly: false,
      cbdcPressure: true,
      highSurveillance: true,
      borderSecurityStress: true,
      outdoorCulture: false,
    },
    sortOrder: 20,
    summary:
      "High latitude (weak winter sun), no magma advantage, and policy factors (surveillance, CBDC direction, border stress) score low on freedom under this model.",
    magnetismNotes: "Stable geology; magnetism score driven by distance from active volcanoes.",
    lightNotes: "High latitude → lowest sun band in this system.",
    policyNotes:
      "Digital currency / ID trajectory, high surveillance norms, and open-border stress factors reduce monetary and civil freedom scores in this framework.",
  }),
  scored({
    id: "us-miami",
    name: "United States (Miami)",
    country: "United States",
    locality: "Miami",
    latitude: 25.7617,
    longitude: -80.1918,
    timezone: "America/New_York",
    policy: {
      cryptoFriendly: true,
      outdoorCulture: true,
      cbdcPressure: true,
    },
    sortOrder: 8,
    summary:
      "Strong subtropical sun and outdoor culture; limited volcanic magnetism; US federal CBDC pressure remains.",
    magnetismNotes: "Far from major active arcs vs Central America / Hawaii.",
    lightNotes: "Near-tropic latitude supports high sun score.",
    policyNotes: "Crypto-friendly city culture; still under US regulatory umbrella.",
  }),
  scored({
    id: "indonesia-bali",
    name: "Indonesia (Bali)",
    country: "Indonesia",
    locality: "Denpasar",
    latitude: -8.6705,
    longitude: 115.2126,
    timezone: "Asia/Makassar",
    policy: {
      outdoorCulture: true,
      cryptoFriendly: true,
    },
    sortOrder: 4,
    summary:
      "Equatorial sun and Ring of Fire volcanism; policy is mixed but outdoor living is strong.",
    magnetismNotes: "Indonesian volcanic arc — major active magma systems.",
    lightNotes: "Near-equatorial latitude → top sun band.",
    policyNotes: "Tourism/outdoor culture; crypto use common but not legal tender.",
  }),
];
