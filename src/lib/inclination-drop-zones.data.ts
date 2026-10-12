/**
 * Kruse's North American "inclination drop" zones, paraphrased from his
 * May 12, 2026 forum post (373836), which cites April 2026 field data.
 * His ranking and reasons, not measured decay rates.
 */

export type InclinationDropZoneDef = {
  id: string;
  rank: number;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  /** Match ZIP coords within this radius of the zone center */
  radiusKm: number;
  hazardSummary: string;
};

export const INCLINATION_DROP_SOURCE = {
  label: "373836",
  url: "https://forum.jackkruse.com/posts/373836/",
} as const;

/** The box where he says the dip is falling fastest in North America. */
export const NA_INCLINATION_DECAY_CORRIDOR = {
  south: 30,
  north: 40,
  west: -95,
  east: -80,
  label: "30–40°N, 80–95°W",
  summary:
    "Kruse says the field's dip angle is falling fastest in North America inside the box from 30–40°N and 80–95°W, which lines up with the Mississippi Valley and the Appalachian foothills.",
} as const;

export const INCLINATION_DROP_ZONES: readonly InclinationDropZoneDef[] = [
  {
    id: "new-orleans",
    rank: 1,
    name: "New Orleans, Louisiana",
    subtitle: "The Conducting Delta Sink",
    latitude: 30.0,
    longitude: -90.1,
    radiusKm: 120,
    hazardSummary:
      "On the 90°W line where he says the vertical field is flattening fastest, at sea level on a conductive saltwater delta that he says lets man-made EMF reach the body more easily.",
  },
  {
    id: "memphis",
    rank: 2,
    name: "Memphis, Tennessee",
    subtitle: "The Aquifer Squeeze",
    latitude: 35.1,
    longitude: -90.0,
    radiusKm: 140,
    hazardSummary:
      "On the same 90°W line, over the Memphis Sand Aquifer and the Mississippi drainage, where he says a thinning shield is loading surface water, and so local food and water, with deuterium.",
  },
  {
    id: "minneapolis",
    rank: 3,
    name: "Minneapolis–St. Paul, Minnesota",
    subtitle: "The Magnetic Anomaly Clash",
    latitude: 44.9,
    longitude: -93.2,
    radiusKm: 150,
    hazardSummary:
      "In a belt of strong crustal magnetic anomalies that pull compasses up to 16° off true; he says their clash with a shifting main field leaves the local field unstable.",
  },
  {
    id: "st-louis",
    rank: 4,
    name: "St. Louis, Missouri",
    subtitle: "The Confluence Node",
    latitude: 38.6,
    longitude: -90.2,
    radiusKm: 140,
    hazardSummary:
      "Where the Missouri and Mississippi meet on the 90°W line; he says the big rivers act as a moving conductive loop that disturbs the local field.",
  },
  {
    id: "chattanooga",
    rank: 5,
    name: "Chattanooga, Tennessee",
    subtitle: "The Appalachian Waveguide",
    latitude: 35.0,
    longitude: -85.3,
    radiusKm: 200,
    hazardSummary:
      "In a deep valley of limestone and iron ridges that he says traps industrial EMF as the field weakens.",
  },
  {
    id: "miami",
    rank: 6,
    name: "Miami, Florida",
    subtitle: "The Equatorial Flattening Edge",
    latitude: 25.7,
    longitude: -80.2,
    radiusKm: 120,
    hazardSummary:
      "The US metro closest to the northward-moving magnetic equator, on the northern fringe of the South Atlantic Anomaly; he rates lattice-lock risk highest here.",
  },
  {
    id: "chicago",
    rank: 7,
    name: "Chicago, Illinois",
    subtitle: "The Great Lakes Induction Zone",
    latitude: 41.8,
    longitude: -87.6,
    radiusKm: 150,
    hazardSummary:
      "On the Great Lakes shore, where he says space-weather swings drive induced currents along the boundary between water and land.",
  },
  {
    id: "houston",
    rank: 8,
    name: "Houston, Texas",
    subtitle: "The Alluvial Saturated Plain",
    latitude: 29.7,
    longitude: -95.3,
    radiusKm: 140,
    hazardSummary:
      "On a flat, saturated clay and alluvial plain with high ground conductivity, at a low latitude where he says the dip is dropping faster.",
  },
  {
    id: "birmingham",
    rank: 9,
    name: "Birmingham, Alabama",
    subtitle: "The Iron-Ore Disruption",
    latitude: 33.5,
    longitude: -86.8,
    radiusKm: 200,
    hazardSummary:
      "Over large iron-ore, coal and limestone deposits that he says scatter the local field as the main field collapses.",
  },
  {
    id: "churchill",
    rank: 10,
    name: "Churchill, Manitoba",
    subtitle: "The Auroral Oval Descending Ground",
    latitude: 58.8,
    longitude: -94.1,
    radiusKm: 280,
    hazardSummary:
      "Under the auroral oval, with what he calls the fastest change in field strength and declination in North America.",
  },
] as const;

/** His steps for people who can't move away from these zones. */
export const INCLINATION_DROP_MITIGATION = [
  "Sleep on a high-gauss, single-pole static magnetic mattress pad to restore a steady vertical field.",
  "Drink from deep artesian wells rather than surface river water, such as Mississippi or Tennessee basin tap water.",
  "On conductive clay or delta soils, ground on raw earth only in the early morning, with the sunrise infrared.",
] as const;
