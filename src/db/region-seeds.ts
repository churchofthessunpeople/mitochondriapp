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
};

type RegionDraft = Omit<
  RegionSeed,
  "healthRating" | "sunScore" | "magnetismScore" | "policyScore"
> & {
  policy: PolicyFactors;
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

/** Baseline US federal policy drag (CBDC research / heavy regulation). */
const US_BASE: PolicyFactors = {
  cryptoFriendly: true,
  cbdcPressure: true,
  outdoorCulture: false,
};

function usMetro(opts: {
  id: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  tz: string;
  sortOrder: number;
  outdoor?: boolean;
  note?: string;
}): RegionSeed {
  const policy: PolicyFactors = {
    ...US_BASE,
    outdoorCulture: opts.outdoor ?? false,
  };
  return scored({
    id: opts.id,
    name: `${opts.city}, ${opts.state}`,
    country: "United States",
    locality: opts.city,
    latitude: opts.lat,
    longitude: opts.lng,
    timezone: opts.tz,
    policy,
    sortOrder: opts.sortOrder,
    summary:
      opts.note ??
      `${opts.city} metro — sun/magnetism from coordinates; US policy baseline (crypto legal, federal CBDC/regulatory pressure).`,
    magnetismNotes:
      "Scored from distance to major active volcanic systems (US interior is usually low).",
    lightNotes: "Sun score from latitude band for this metro.",
    policyNotes:
      "US federal monetary/regulatory environment; local outdoor culture varies.",
  });
}

/**
 * Curated places. Sun & magnetism from lat/lng; policy from freedom/Bitcoin flags.
 * Dense US metros so ZIP matching stays local (Dallas ≠ Miami).
 */
export const REGION_SEEDS: RegionSeed[] = [
  // ——— International anchors ———
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
    },
    sortOrder: 1,
    summary:
      "Tropical sun, Pacific volcanic arc, Bitcoin legal tender — top-tier under this model.",
    magnetismNotes: "Central American volcanic arc / active magma systems.",
    lightNotes: "Low latitude → strong year-round solar band.",
    policyNotes: "Bitcoin legal tender + outdoor culture.",
  }),
  scored({
    id: "costa-rica",
    name: "Costa Rica",
    country: "Costa Rica",
    locality: null,
    latitude: 9.9281,
    longitude: -84.0907,
    timezone: "America/Costa_Rica",
    policy: { cryptoFriendly: true, outdoorCulture: true },
    sortOrder: 2,
    summary: "Tropical light, volcanic corridor, strong eco-outdoor culture.",
    magnetismNotes: "Central American volcanic belt.",
    lightNotes: "Near-equatorial sun.",
    policyNotes: "Outdoor-friendly; crypto-friendly without legal tender.",
  }),
  scored({
    id: "hawaii-big-island",
    name: "Hawaiʻi (Big Island)",
    country: "United States",
    locality: "Hilo / Kona",
    latitude: 19.7297,
    longitude: -155.09,
    timezone: "Pacific/Honolulu",
    policy: {
      ...US_BASE,
      outdoorCulture: true,
    },
    sortOrder: 3,
    summary: "Tropical sun + active hotspot volcanism; US policy baseline.",
    magnetismNotes: "Hawaii hotspot — active magma.",
    lightNotes: "Tropical latitude.",
    policyNotes: "Outdoor culture; US federal CBDC/regulatory pressure.",
  }),
  scored({
    id: "indonesia-bali",
    name: "Indonesia (Bali)",
    country: "Indonesia",
    locality: "Denpasar",
    latitude: -8.6705,
    longitude: 115.2126,
    timezone: "Asia/Makassar",
    policy: { outdoorCulture: true, cryptoFriendly: true },
    sortOrder: 4,
    summary: "Equatorial sun and Ring of Fire volcanism.",
    magnetismNotes: "Indonesian volcanic arc.",
    lightNotes: "Near-equatorial.",
    policyNotes: "Outdoor tourism culture; crypto common, not legal tender.",
  }),
  scored({
    id: "chile-santiago",
    name: "Chile (Santiago)",
    country: "Chile",
    locality: "Santiago",
    latitude: -33.4489,
    longitude: -70.6693,
    timezone: "America/Santiago",
    policy: { outdoorCulture: true, cryptoFriendly: true },
    sortOrder: 5,
    summary: "Andean/Pacific volcanic belt; strong summer UV.",
    magnetismNotes: "Near Andes volcanic arc.",
    lightNotes: "Mid/subtropical latitude.",
    policyNotes: "Outdoor access to coast and mountains.",
  }),
  scored({
    id: "iceland",
    name: "Iceland",
    country: "Iceland",
    locality: "Reykjavík",
    latitude: 64.1466,
    longitude: -21.9426,
    timezone: "Atlantic/Reykjavik",
    policy: { outdoorCulture: true, cryptoFriendly: true },
    sortOrder: 6,
    summary: "Exceptional magma story, weak winter light at high latitude.",
    magnetismNotes: "Iceland hotspot / MAR volcanism.",
    lightNotes: "High latitude → low sun score.",
    policyNotes: "Outdoor culture; crypto-friendly relative to peers.",
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
    summary: "Good European light; EU digital-money trajectory is a drag.",
    magnetismNotes: "Far from major magma arcs.",
    lightNotes: "Better UV than northern Europe.",
    policyNotes: "EU CBDC/regulatory environment.",
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
      highSurveillance: true,
      authoritarianEconomy: true,
    },
    sortOrder: 12,
    summary: "Strong sun angle; weak magnetism; high-control governance.",
    magnetismNotes: "Stable desert geology.",
    lightNotes: "Desert subtropical sun.",
    policyNotes: "Crypto hubs exist; surveillance/control weigh down freedom.",
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
    },
    sortOrder: 20,
    summary:
      "High latitude + low magma + CBDC/surveillance/border-stress flags → low freedom/light scores.",
    magnetismNotes: "Stable geology.",
    lightNotes: "High latitude winters.",
    policyNotes:
      "Digital currency trajectory, surveillance norms, border-stress factors in this framework.",
  }),

  // ——— US metros (dense enough for ZIP nearest-match) ———
  // Texas
  usMetro({
    id: "us-dallas",
    city: "Dallas–Fort Worth",
    state: "TX",
    lat: 32.7767,
    lng: -96.797,
    tz: "America/Chicago",
    sortOrder: 100,
    outdoor: true,
    note: "DFW metro — subtropical sun band, low volcanic magnetism, Texas outdoor culture under US federal policy baseline.",
  }),
  usMetro({
    id: "us-houston",
    city: "Houston",
    state: "TX",
    lat: 29.7604,
    lng: -95.3698,
    tz: "America/Chicago",
    sortOrder: 101,
    outdoor: true,
  }),
  usMetro({
    id: "us-austin",
    city: "Austin",
    state: "TX",
    lat: 30.2672,
    lng: -97.7431,
    tz: "America/Chicago",
    sortOrder: 102,
    outdoor: true,
  }),
  usMetro({
    id: "us-san-antonio",
    city: "San Antonio",
    state: "TX",
    lat: 29.4241,
    lng: -98.4936,
    tz: "America/Chicago",
    sortOrder: 103,
    outdoor: true,
  }),
  usMetro({
    id: "us-el-paso",
    city: "El Paso",
    state: "TX",
    lat: 31.7619,
    lng: -106.485,
    tz: "America/Denver",
    sortOrder: 104,
    outdoor: true,
  }),
  // South / Southeast
  usMetro({
    id: "us-miami",
    city: "Miami",
    state: "FL",
    lat: 25.7617,
    lng: -80.1918,
    tz: "America/New_York",
    sortOrder: 110,
    outdoor: true,
  }),
  usMetro({
    id: "us-orlando",
    city: "Orlando",
    state: "FL",
    lat: 28.5383,
    lng: -81.3792,
    tz: "America/New_York",
    sortOrder: 111,
    outdoor: true,
  }),
  usMetro({
    id: "us-tampa",
    city: "Tampa",
    state: "FL",
    lat: 27.9506,
    lng: -82.4572,
    tz: "America/New_York",
    sortOrder: 112,
    outdoor: true,
  }),
  usMetro({
    id: "us-atlanta",
    city: "Atlanta",
    state: "GA",
    lat: 33.749,
    lng: -84.388,
    tz: "America/New_York",
    sortOrder: 113,
    outdoor: true,
  }),
  usMetro({
    id: "us-charlotte",
    city: "Charlotte",
    state: "NC",
    lat: 35.2271,
    lng: -80.8431,
    tz: "America/New_York",
    sortOrder: 114,
  }),
  usMetro({
    id: "us-nashville",
    city: "Nashville",
    state: "TN",
    lat: 36.1627,
    lng: -86.7816,
    tz: "America/Chicago",
    sortOrder: 115,
    outdoor: true,
  }),
  usMetro({
    id: "us-new-orleans",
    city: "New Orleans",
    state: "LA",
    lat: 29.9511,
    lng: -90.0715,
    tz: "America/Chicago",
    sortOrder: 116,
    outdoor: true,
  }),
  usMetro({
    id: "us-oklahoma-city",
    city: "Oklahoma City",
    state: "OK",
    lat: 35.4676,
    lng: -97.5164,
    tz: "America/Chicago",
    sortOrder: 117,
    outdoor: true,
  }),
  // Southwest
  usMetro({
    id: "us-phoenix",
    city: "Phoenix",
    state: "AZ",
    lat: 33.4484,
    lng: -112.074,
    tz: "America/Phoenix",
    sortOrder: 120,
    outdoor: true,
  }),
  usMetro({
    id: "us-tucson",
    city: "Tucson",
    state: "AZ",
    lat: 32.2226,
    lng: -110.9747,
    tz: "America/Phoenix",
    sortOrder: 121,
    outdoor: true,
  }),
  usMetro({
    id: "us-las-vegas",
    city: "Las Vegas",
    state: "NV",
    lat: 36.1699,
    lng: -115.1398,
    tz: "America/Los_Angeles",
    sortOrder: 122,
    outdoor: true,
  }),
  usMetro({
    id: "us-albuquerque",
    city: "Albuquerque",
    state: "NM",
    lat: 35.0844,
    lng: -106.6504,
    tz: "America/Denver",
    sortOrder: 123,
    outdoor: true,
  }),
  usMetro({
    id: "us-denver",
    city: "Denver",
    state: "CO",
    lat: 39.7392,
    lng: -104.9903,
    tz: "America/Denver",
    sortOrder: 124,
    outdoor: true,
  }),
  usMetro({
    id: "us-salt-lake",
    city: "Salt Lake City",
    state: "UT",
    lat: 40.7608,
    lng: -111.891,
    tz: "America/Denver",
    sortOrder: 125,
    outdoor: true,
  }),
  // West Coast
  usMetro({
    id: "us-los-angeles",
    city: "Los Angeles",
    state: "CA",
    lat: 34.0522,
    lng: -118.2437,
    tz: "America/Los_Angeles",
    sortOrder: 130,
    outdoor: true,
  }),
  usMetro({
    id: "us-san-diego",
    city: "San Diego",
    state: "CA",
    lat: 32.7157,
    lng: -117.1611,
    tz: "America/Los_Angeles",
    sortOrder: 131,
    outdoor: true,
  }),
  usMetro({
    id: "us-san-francisco",
    city: "San Francisco Bay Area",
    state: "CA",
    lat: 37.7749,
    lng: -122.4194,
    tz: "America/Los_Angeles",
    sortOrder: 132,
    outdoor: true,
  }),
  usMetro({
    id: "us-sacramento",
    city: "Sacramento",
    state: "CA",
    lat: 38.5816,
    lng: -121.4944,
    tz: "America/Los_Angeles",
    sortOrder: 133,
    outdoor: true,
  }),
  usMetro({
    id: "us-portland",
    city: "Portland",
    state: "OR",
    lat: 45.5152,
    lng: -122.6784,
    tz: "America/Los_Angeles",
    sortOrder: 134,
    outdoor: true,
  }),
  usMetro({
    id: "us-seattle",
    city: "Seattle",
    state: "WA",
    lat: 47.6062,
    lng: -122.3321,
    tz: "America/Los_Angeles",
    sortOrder: 135,
    outdoor: true,
  }),
  // Midwest
  usMetro({
    id: "us-chicago",
    city: "Chicago",
    state: "IL",
    lat: 41.8781,
    lng: -87.6298,
    tz: "America/Chicago",
    sortOrder: 140,
  }),
  usMetro({
    id: "us-minneapolis",
    city: "Minneapolis",
    state: "MN",
    lat: 44.9778,
    lng: -93.265,
    tz: "America/Chicago",
    sortOrder: 141,
    outdoor: true,
  }),
  usMetro({
    id: "us-kansas-city",
    city: "Kansas City",
    state: "MO",
    lat: 39.0997,
    lng: -94.5786,
    tz: "America/Chicago",
    sortOrder: 142,
    outdoor: true,
  }),
  usMetro({
    id: "us-st-louis",
    city: "St. Louis",
    state: "MO",
    lat: 38.627,
    lng: -90.1994,
    tz: "America/Chicago",
    sortOrder: 143,
  }),
  usMetro({
    id: "us-detroit",
    city: "Detroit",
    state: "MI",
    lat: 42.3314,
    lng: -83.0458,
    tz: "America/Detroit",
    sortOrder: 144,
  }),
  usMetro({
    id: "us-columbus",
    city: "Columbus",
    state: "OH",
    lat: 39.9612,
    lng: -82.9988,
    tz: "America/New_York",
    sortOrder: 145,
  }),
  usMetro({
    id: "us-indianapolis",
    city: "Indianapolis",
    state: "IN",
    lat: 39.7684,
    lng: -86.1581,
    tz: "America/Indiana/Indianapolis",
    sortOrder: 146,
  }),
  // Northeast
  usMetro({
    id: "us-nyc",
    city: "New York City",
    state: "NY",
    lat: 40.7128,
    lng: -74.006,
    tz: "America/New_York",
    sortOrder: 150,
  }),
  usMetro({
    id: "us-boston",
    city: "Boston",
    state: "MA",
    lat: 42.3601,
    lng: -71.0589,
    tz: "America/New_York",
    sortOrder: 151,
  }),
  usMetro({
    id: "us-philadelphia",
    city: "Philadelphia",
    state: "PA",
    lat: 39.9526,
    lng: -75.1652,
    tz: "America/New_York",
    sortOrder: 152,
  }),
  usMetro({
    id: "us-washington-dc",
    city: "Washington",
    state: "DC",
    lat: 38.9072,
    lng: -77.0369,
    tz: "America/New_York",
    sortOrder: 153,
  }),
  usMetro({
    id: "us-pittsburgh",
    city: "Pittsburgh",
    state: "PA",
    lat: 40.4406,
    lng: -79.9959,
    tz: "America/New_York",
    sortOrder: 154,
  }),
  // Mountain / other
  usMetro({
    id: "us-boise",
    city: "Boise",
    state: "ID",
    lat: 43.615,
    lng: -116.2023,
    tz: "America/Boise",
    sortOrder: 160,
    outdoor: true,
  }),
  usMetro({
    id: "us-omaha",
    city: "Omaha",
    state: "NE",
    lat: 41.2565,
    lng: -95.9345,
    tz: "America/Chicago",
    sortOrder: 161,
    outdoor: true,
  }),
  usMetro({
    id: "us-milwaukee",
    city: "Milwaukee",
    state: "WI",
    lat: 43.0389,
    lng: -87.9065,
    tz: "America/Chicago",
    sortOrder: 162,
  }),
];
