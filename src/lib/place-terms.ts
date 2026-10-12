/** Labels on the place screen: a hover tooltip and the article a click opens. */

export type PlaceTermId =
  | "sunrise"
  | "sunset"
  | "solarNoon"
  | "dayLength"
  | "uva"
  | "uvb"
  | "field"
  | "dipZone"
  | "ground"
  | "volcano"
  | "artificialEm"
  | "solar";

export type PlaceTerm = { label: string; tip: string; articleId: string };

export const PLACE_TERMS: Record<PlaceTermId, PlaceTerm> = {
  sunrise: {
    label: "Sunrise",
    tip: "When the sun clears the horizon here. Kruse calls dawn light the master signal that sets the body's clocks.",
    articleId: "sunrise-why",
  },
  sunset: {
    label: "Sunset",
    tip: "When the sun goes down here. Sunset light is rich in the red and near-infrared Kruse values highly.",
    articleId: "red-nir-light",
  },
  solarNoon: {
    label: "Solar noon",
    tip: "When the sun is highest here, which is rarely 12:00 on the clock. UV-B is strongest around this time.",
    articleId: "solar-noon-vitamin-d",
  },
  dayLength: {
    label: "Day length",
    tip: "Hours from sunrise to sunset. Kruse's four-phase sun day steps through the light from one to the other.",
    articleId: "solar-callus",
  },
  uva: {
    label: "UV-A",
    tip: "From 90 minutes after sunrise until the UV-B window opens. In Kruse's four-phase day, morning UV-A builds tolerance for stronger midday sun.",
    articleId: "solar-callus",
  },
  uvb: {
    label: "UV-B",
    tip: "When the sun is more than 45° up, so your shadow is shorter than you. The date is the last day this season with a window. Kruse ties UV-B to vitamin D made in skin.",
    articleId: "solar-noon-vitamin-d",
  },
  field: {
    label: "Magnetic field",
    tip: "Strength, dip and declination of Earth's field here, from the World Magnetic Model. Kruse says its direction and how fast it changes matter more than its average strength.",
    articleId: "earth-field-vs-geology",
  },
  dipZone: {
    label: "Kruse's North American dip-change zones",
    tip: "Ten areas where Kruse says the field's dip angle is falling fastest, from his forum post 373836.",
    articleId: "choosing-a-location",
  },
  ground: {
    label: "The ground under this ZIP",
    tip: "Mapped bedrock from Macrostrat. Kruse says the rock underfoot shapes the local field and how well grounding works.",
    articleId: "barefoot-earth",
  },
  volcano: {
    label: "Active volcanoes",
    tip: "The closest volcano that has erupted since 1800, if one is within 150 km. Kruse ranks active volcanoes as the best field anchors, and volcanic rock that froze before the last pole reversal as a poor one.",
    articleId: "volcanic-basalt-pinning",
  },
  artificialEm: {
    label: "Artificial-EM context",
    tip: "A rough estimate from mapped towers, buildings and power plants nearby. It is not a meter reading.",
    articleId: "reduce-nnemf-block",
  },
  solar: {
    label: "Recent solar activity",
    tip: "Flares and geomagnetic activity from NOAA. Kruse says solar storms knock the body's field-locked sense of position out of alignment.",
    articleId: "solar-flares-space-weather",
  },
};
