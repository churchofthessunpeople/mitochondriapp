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

/**
 * Educational / lifestyle-framework ratings (1–5), not medical advice.
 * Inspired by common Kruse-style themes: light, magnetism, environment, policy.
 */
export const REGION_SEEDS: RegionSeed[] = [
  {
    id: "el-salvador",
    name: "El Salvador",
    country: "El Salvador",
    locality: null,
    latitude: 13.6929,
    longitude: -89.2182,
    timezone: "America/El_Salvador",
    healthRating: 5,
    sunScore: 5,
    magnetismScore: 5,
    policyScore: 5,
    summary:
      "Strong equatorial light, volcanic geology with active magma systems, and a policy environment that embraces Bitcoin and outdoor living — often cited as a top-tier lifestyle environment in this framework.",
    magnetismNotes:
      "Pacific Ring of Fire volcanism and free-flowing magma support a highly dynamic magnetic / geological environment.",
    lightNotes:
      "Near-equatorial sun year-round with excellent UVA/UVB opportunity when managed safely.",
    policyNotes:
      "Bitcoin legal tender, relatively open outdoor culture, and pro-sovereignty narratives that many stack-followers find aligned.",
    sortOrder: 1,
  },
  {
    id: "costa-rica",
    name: "Costa Rica",
    country: "Costa Rica",
    locality: null,
    latitude: 9.9281,
    longitude: -84.0907,
    timezone: "America/Costa_Rica",
    healthRating: 4,
    sunScore: 5,
    magnetismScore: 4,
    policyScore: 4,
    summary:
      "Excellent tropical light and nature access; strong eco-tourism outdoors culture.",
    magnetismNotes:
      "Volcanic Central America corridor with notable geological activity.",
    lightNotes: "High solar intensity with wet/dry season variation.",
    policyNotes: "Generally outdoors-friendly; denser tourism in some zones.",
    sortOrder: 2,
  },
  {
    id: "hawaii-big-island",
    name: "Hawaiʻi (Big Island)",
    country: "United States",
    locality: "Hilo / Kona corridor",
    latitude: 19.7297,
    longitude: -155.09,
    timezone: "Pacific/Honolulu",
    healthRating: 4,
    sunScore: 5,
    magnetismScore: 5,
    policyScore: 3,
    summary:
      "Intense Pacific sun and active volcanism (Kīlauea/Mauna Loa systems) for light + magnetic context.",
    magnetismNotes:
      "One of the most active volcanic islands on Earth — strong geological / magnetic narrative.",
    lightNotes: "Tropical sun; cloud forest vs leeward microclimates matter.",
    policyNotes: "US regulation, cost of living, and tourism density vary by island.",
    sortOrder: 3,
  },
  {
    id: "portugal-lisbon",
    name: "Portugal (Lisbon)",
    country: "Portugal",
    locality: "Lisbon",
    latitude: 38.7223,
    longitude: -9.1393,
    timezone: "Europe/Lisbon",
    healthRating: 3,
    sunScore: 4,
    magnetismScore: 2,
    policyScore: 3,
    summary:
      "Good Atlantic light for Europe; milder magnetic/volcanic story than Ring of Fire locales.",
    magnetismNotes: "Stable continental plate setting; less volcanic flux than Pacific arcs.",
    lightNotes: "Strong summer UV; winters darker than tropics but better than far north.",
    policyNotes: "EU norms; popular digital-nomad hub with outdoor cafes and coast access.",
    sortOrder: 10,
  },
  {
    id: "uk-london",
    name: "United Kingdom (London)",
    country: "United Kingdom",
    locality: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London",
    healthRating: 2,
    sunScore: 2,
    magnetismScore: 2,
    policyScore: 2,
    summary:
      "High latitude means limited winter UV; dense urban nnEMF and indoor lifestyle pressure.",
    magnetismNotes: "Stable geology; light deficit is the dominant constraint for many.",
    lightNotes:
      "Winter solar angle is low — vitamin D / circadian light often needs intentional design.",
    policyNotes: "High regulation density; cold dark winters challenge outdoor protocols.",
    sortOrder: 20,
  },
  {
    id: "us-nyc",
    name: "United States (New York City)",
    country: "United States",
    locality: "New York City",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
    healthRating: 2,
    sunScore: 3,
    magnetismScore: 2,
    policyScore: 2,
    summary:
      "Seasonal light, dense artificial EM environment, strong indoor/career culture.",
    magnetismNotes: "Urbanized coastline; artificial fields dominate lifestyle exposure.",
    lightNotes: "Solid summer sun; winter days shorter with canyon-street shading.",
    policyNotes: "High cost, dense regulation, excellent logistics if you prioritize travel out.",
    sortOrder: 21,
  },
  {
    id: "chile-santiago",
    name: "Chile (Santiago)",
    country: "Chile",
    locality: "Santiago",
    latitude: -33.4489,
    longitude: -70.6693,
    timezone: "America/Santiago",
    healthRating: 4,
    sunScore: 4,
    magnetismScore: 4,
    policyScore: 3,
    summary:
      "Andean light and Pacific volcanic belt proximity; Andes rain shadow microclimates.",
    magnetismNotes: "Pacific Ring of Fire volcanic arc nearby.",
    lightNotes: "Strong southern hemisphere UV in summer; clear high-altitude light inland.",
    policyNotes: "Modern economy with outdoor access to coast and mountains.",
    sortOrder: 5,
  },
  {
    id: "uae-dubai",
    name: "UAE (Dubai)",
    country: "United Arab Emirates",
    locality: "Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: "Asia/Dubai",
    healthRating: 3,
    sunScore: 5,
    magnetismScore: 2,
    policyScore: 3,
    summary:
      "Abundant desert sun; extreme heat and heavy AC/indoor life can offset light gains.",
    magnetismNotes: "Stable desert geology; magnetism story is weaker than volcanic zones.",
    lightNotes: "Intense year-round sun; heat may push people indoors at peak UV hours.",
    policyNotes: "Modern infrastructure; outdoor winter season is more protocol-friendly.",
    sortOrder: 12,
  },
];
