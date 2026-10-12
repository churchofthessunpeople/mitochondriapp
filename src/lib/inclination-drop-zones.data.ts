/**
 * North American "inclination drop" decline zones — April 2026 synthesis
 * used in Kruse-community place education. Lifestyle framework only; not
 * measured field decay rates or medical hazard ratings in this app.
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

/** Broad trough: steepest NA inclination/intensity decline band (April 2026 map). */
export const NA_INCLINATION_DECAY_CORRIDOR = {
  south: 30,
  north: 40,
  west: -95,
  east: -80,
  label: "30–40°N · 80–95°W",
  summary:
    "Mississippi Valley–Appalachian alignment where vertical inclination is flattening fastest in North America (April 2026 synthesis).",
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
      "On the ~90°W meridian at sea level on a conductive saltwater delta — high ground conductivity as vertical field pressure softens.",
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
      "Same ~90°W longitudinal track atop the Memphis Sand Aquifer and Mississippi drainage funnel — hydrology + weakening shielding in one node.",
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
      "Inside a crustal magnetic anomaly belt where bedrock iron/basalt pulls compasses off true — collides with rapidly shifting ambient field lines.",
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
      "Missouri–Mississippi confluence on the ~90°W decay line — large moving conductive river loops alter secondary field geometry.",
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
      "Deep limestone/iron valley acts as a waveguide — tilting field lines plus trapped industrial nnEMF in a low-field basin.",
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
      "Nearest major U.S. metro to the climbing magnetic dip equator — rapidly flattening vertical vector at the SAA gradient fringe.",
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
      "Western Great Lakes dielectric boundary — space-weather jerks drive geomagnetically induced currents across water–land edges.",
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
      "Flat saturated clay/alluvial plain just west of the ~90°W corridor — high ground conductivity and steeper low-latitude inclination drop.",
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
      "Massive subsurface iron ore, coal, and limestone — ferromagnetic bodies fracture uniform field lines during rapid vertical collapse.",
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
      "Under the North American auroral oval as the pole races toward Siberia — fastest total-intensity and declination change rates on the continent.",
  },
] as const;

export const INCLINATION_DROP_MITIGATION = [
  "Restore a local vertical vector at night — unipolar static biomagnetic sleep pads (e.g. Magnetico-class systems).",
  "Shield the water matrix — avoid Mississippi/Tennessee basin surface-runoff tap when possible; favor deep artesian sources.",
  "Ground consciously on raw earth in early morning on conductive clay or delta soils — pair with outdoor infrared light.",
] as const;
