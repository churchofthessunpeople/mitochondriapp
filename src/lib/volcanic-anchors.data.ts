/**
 * AUTO-GENERATED — do not edit by hand.
 * Volcanic / active-magma anchors for lifestyle magnetism scoring.
 *
 * Sources (static snapshot; educational framework — not hazard alerts):
 * - Smithsonian GVP Holocene catalog via TidyTuesday volcano.csv (2020-05-12)
 *   https://github.com/rfordatascience/tidytuesday
 * - USGS HANS getUSVolcanoes (US / territories)
 * - Major arc / hotspot / rift system midpoints
 *
 * Cite: Global Volcanism Program, Smithsonian Institution (https://volcano.si.edu/)
 *       USGS Volcano Hazards Program (https://volcanoes.usgs.gov/)
 *
 * Regenerate: node scripts/build-volcanic-anchors.mjs
 */

export type VolcanicAnchor = {
  name: string;
  lat: number;
  lng: number;
  /** gvp = Holocene catalog, usgs = US catalog, system = arc/rift midpoint */
  source: "gvp" | "usgs" | "system";
};

export const VOLCANIC_ANCHORS: readonly VolcanicAnchor[] = [
  {
    "name": "Abu",
    "lat": 34.5,
    "lng": 131.6,
    "source": "gvp"
  },
  {
    "name": "Acamarachi",
    "lat": -23.292,
    "lng": -67.618,
    "source": "gvp"
  },
  {
    "name": "Acatenango",
    "lat": 14.501,
    "lng": -90.876,
    "source": "gvp"
  },
  {
    "name": "Acigol-Nevsehir",
    "lat": 38.537,
    "lng": 34.621,
    "source": "gvp"
  },
  {
    "name": "Adagdak",
    "lat": 51.9905,
    "lng": -176.5852,
    "source": "usgs"
  },
  {
    "name": "Adatarayama",
    "lat": 37.647,
    "lng": 140.281,
    "source": "gvp"
  },
  {
    "name": "Adwa",
    "lat": 10.07,
    "lng": 40.84,
    "source": "gvp"
  },
  {
    "name": "Aegean arc (Santorini sector)",
    "lat": 36.4,
    "lng": 25.4,
    "source": "system"
  },
  {
    "name": "Afdera",
    "lat": 13.088,
    "lng": 40.853,
    "source": "gvp"
  },
  {
    "name": "Agrigan",
    "lat": 18.77,
    "lng": 145.67,
    "source": "usgs"
  },
  {
    "name": "Agua",
    "lat": 14.465,
    "lng": -90.743,
    "source": "gvp"
  },
  {
    "name": "Agua de Pau",
    "lat": 37.77,
    "lng": -25.47,
    "source": "gvp"
  },
  {
    "name": "Aguilera",
    "lat": -50.33,
    "lng": -73.75,
    "source": "gvp"
  },
  {
    "name": "Agung",
    "lat": -8.343,
    "lng": 115.508,
    "source": "gvp"
  },
  {
    "name": "Ahyi Seamount",
    "lat": 20.437,
    "lng": 145.03,
    "source": "usgs"
  },
  {
    "name": "Aira",
    "lat": 31.593,
    "lng": 130.657,
    "source": "gvp"
  },
  {
    "name": "Akademia Nauk",
    "lat": 53.98,
    "lng": 159.45,
    "source": "gvp"
  },
  {
    "name": "Akagisan",
    "lat": 36.56,
    "lng": 139.193,
    "source": "gvp"
  },
  {
    "name": "Akan",
    "lat": 43.384,
    "lng": 144.013,
    "source": "gvp"
  },
  {
    "name": "Akita-Komagatake",
    "lat": 39.761,
    "lng": 140.799,
    "source": "gvp"
  },
  {
    "name": "Akita-Yakeyama",
    "lat": 39.964,
    "lng": 140.757,
    "source": "gvp"
  },
  {
    "name": "Akusekijima",
    "lat": 29.465,
    "lng": 129.594,
    "source": "gvp"
  },
  {
    "name": "Akutan",
    "lat": 54.1331,
    "lng": -165.9855,
    "source": "usgs"
  },
  {
    "name": "Alaid",
    "lat": 50.861,
    "lng": 155.565,
    "source": "gvp"
  },
  {
    "name": "Alamagan",
    "lat": 17.6,
    "lng": 145.83,
    "source": "usgs"
  },
  {
    "name": "Alayta",
    "lat": 12.888,
    "lng": 40.573,
    "source": "gvp"
  },
  {
    "name": "Alcedo",
    "lat": -0.43,
    "lng": -91.12,
    "source": "gvp"
  },
  {
    "name": "Ale Bagu",
    "lat": 13.512,
    "lng": 40.631,
    "source": "gvp"
  },
  {
    "name": "Aleutian arc",
    "lat": 54,
    "lng": -166,
    "source": "system"
  },
  {
    "name": "Alid",
    "lat": 14.88,
    "lng": 39.92,
    "source": "gvp"
  },
  {
    "name": "Aliso",
    "lat": -0.53,
    "lng": -78,
    "source": "gvp"
  },
  {
    "name": "Alligator Lake",
    "lat": 60.42,
    "lng": -135.42,
    "source": "gvp"
  },
  {
    "name": "Almolonga",
    "lat": 14.797,
    "lng": -91.519,
    "source": "gvp"
  },
  {
    "name": "Alney-Chashakondzha",
    "lat": 56.656,
    "lng": 159.647,
    "source": "gvp"
  },
  {
    "name": "Alu-Dalafilla",
    "lat": 13.793,
    "lng": 40.553,
    "source": "gvp"
  },
  {
    "name": "Alutu",
    "lat": 7.77,
    "lng": 38.78,
    "source": "gvp"
  },
  {
    "name": "Amak",
    "lat": 55.4173,
    "lng": -163.1469,
    "source": "usgs"
  },
  {
    "name": "Amasing",
    "lat": -0.53,
    "lng": 127.48,
    "source": "gvp"
  },
  {
    "name": "Ambae",
    "lat": -15.389,
    "lng": 167.835,
    "source": "gvp"
  },
  {
    "name": "Ambalatungan Group",
    "lat": 17.32,
    "lng": 121.1,
    "source": "gvp"
  },
  {
    "name": "Ambang",
    "lat": 0.75,
    "lng": 124.42,
    "source": "gvp"
  },
  {
    "name": "Ambitle",
    "lat": -4.08,
    "lng": 153.65,
    "source": "gvp"
  },
  {
    "name": "Ambre-Bobaomby",
    "lat": -12.6,
    "lng": 49.15,
    "source": "gvp"
  },
  {
    "name": "Ambrym",
    "lat": -16.25,
    "lng": 168.12,
    "source": "gvp"
  },
  {
    "name": "Amsterdam Island",
    "lat": -37.83,
    "lng": 77.52,
    "source": "gvp"
  },
  {
    "name": "Amukta",
    "lat": 52.4942,
    "lng": -171.2548,
    "source": "usgs"
  },
  {
    "name": "Anatahan",
    "lat": 16.35,
    "lng": 145.67,
    "source": "usgs"
  },
  {
    "name": "Anatolian volcanic province",
    "lat": 38.5,
    "lng": 34.6,
    "source": "system"
  },
  {
    "name": "Anaun",
    "lat": 56.32,
    "lng": 158.83,
    "source": "gvp"
  },
  {
    "name": "Andahua-Orcopampa",
    "lat": -15.42,
    "lng": -72.33,
    "source": "gvp"
  },
  {
    "name": "Andean Central Volcanic Zone",
    "lat": -22,
    "lng": -68,
    "source": "system"
  },
  {
    "name": "Andean Northern Volcanic Zone",
    "lat": 0,
    "lng": -78,
    "source": "system"
  },
  {
    "name": "Andean Southern Volcanic Zone",
    "lat": -38,
    "lng": -71.5,
    "source": "system"
  },
  {
    "name": "Andrus",
    "lat": -75.8,
    "lng": -132.33,
    "source": "gvp"
  },
  {
    "name": "Aneityum",
    "lat": -20.2,
    "lng": 169.78,
    "source": "gvp"
  },
  {
    "name": "Aniakchak",
    "lat": 56.9058,
    "lng": -158.209,
    "source": "usgs"
  },
  {
    "name": "Antarctic West (Deception Island sector)",
    "lat": -62.97,
    "lng": -60.65,
    "source": "system"
  },
  {
    "name": "Antillanca Volcanic Complex",
    "lat": -40.783,
    "lng": -72.15,
    "source": "gvp"
  },
  {
    "name": "Antisana",
    "lat": -0.481,
    "lng": -78.141,
    "source": "gvp"
  },
  {
    "name": "Antofagasta Volcanic Field",
    "lat": -26.12,
    "lng": -67.4,
    "source": "gvp"
  },
  {
    "name": "Antuco",
    "lat": -37.406,
    "lng": -71.349,
    "source": "gvp"
  },
  {
    "name": "Aogashima",
    "lat": 32.458,
    "lng": 139.759,
    "source": "gvp"
  },
  {
    "name": "Apagado",
    "lat": -41.88,
    "lng": -72.58,
    "source": "gvp"
  },
  {
    "name": "Apaneca Range",
    "lat": 13.891,
    "lng": -89.786,
    "source": "gvp"
  },
  {
    "name": "Apastepeque Field",
    "lat": 13.72,
    "lng": -88.77,
    "source": "gvp"
  },
  {
    "name": "Apo",
    "lat": 6.989,
    "lng": 125.269,
    "source": "gvp"
  },
  {
    "name": "Apoyeque",
    "lat": 12.242,
    "lng": -86.342,
    "source": "gvp"
  },
  {
    "name": "Aracar",
    "lat": -24.29,
    "lng": -67.783,
    "source": "gvp"
  },
  {
    "name": "Aragats",
    "lat": 40.53,
    "lng": 44.2,
    "source": "gvp"
  },
  {
    "name": "Ararat",
    "lat": 39.7,
    "lng": 44.3,
    "source": "gvp"
  },
  {
    "name": "Arayat",
    "lat": 15.2,
    "lng": 120.742,
    "source": "gvp"
  },
  {
    "name": "Ardoukoba",
    "lat": 11.58,
    "lng": 42.47,
    "source": "gvp"
  },
  {
    "name": "Arenal",
    "lat": 10.463,
    "lng": -84.703,
    "source": "gvp"
  },
  {
    "name": "Arhab, Harra of",
    "lat": 15.63,
    "lng": 44.08,
    "source": "gvp"
  },
  {
    "name": "Arjuno-Welirang",
    "lat": -7.733,
    "lng": 112.575,
    "source": "gvp"
  },
  {
    "name": "Arxan-Chaihe",
    "lat": 47.45,
    "lng": 120.8,
    "source": "gvp"
  },
  {
    "name": "Asacha",
    "lat": 52.355,
    "lng": 157.827,
    "source": "gvp"
  },
  {
    "name": "Asamayama",
    "lat": 36.406,
    "lng": 138.523,
    "source": "gvp"
  },
  {
    "name": "Ascension",
    "lat": -7.95,
    "lng": -14.37,
    "source": "gvp"
  },
  {
    "name": "Askja",
    "lat": 65.033,
    "lng": -16.783,
    "source": "gvp"
  },
  {
    "name": "Asosan",
    "lat": 32.884,
    "lng": 131.104,
    "source": "gvp"
  },
  {
    "name": "Assab Volcanic Field",
    "lat": 12.95,
    "lng": 42.43,
    "source": "gvp"
  },
  {
    "name": "Asuncion",
    "lat": 19.67,
    "lng": 145.4,
    "source": "usgs"
  },
  {
    "name": "Ata",
    "lat": 31.22,
    "lng": 130.57,
    "source": "gvp"
  },
  {
    "name": "Atacazo",
    "lat": -0.353,
    "lng": -78.617,
    "source": "gvp"
  },
  {
    "name": "Atka volcanic complex",
    "lat": 52.3309,
    "lng": -174.139,
    "source": "usgs"
  },
  {
    "name": "Atlin Volcanic Field",
    "lat": 59.68,
    "lng": -133.32,
    "source": "gvp"
  },
  {
    "name": "Atuel, Caldera del",
    "lat": -34.65,
    "lng": -70.05,
    "source": "gvp"
  },
  {
    "name": "Auckland Volcanic Field",
    "lat": -36.9,
    "lng": 174.87,
    "source": "gvp"
  },
  {
    "name": "Augustine",
    "lat": 59.3626,
    "lng": -153.435,
    "source": "usgs"
  },
  {
    "name": "Avachinsky",
    "lat": 53.256,
    "lng": 158.836,
    "source": "gvp"
  },
  {
    "name": "Axial Seamount",
    "lat": 45.95,
    "lng": -130,
    "source": "gvp"
  },
  {
    "name": "Azas Plateau",
    "lat": 52.433,
    "lng": 98.303,
    "source": "gvp"
  },
  {
    "name": "Azores triple junction",
    "lat": 38.7,
    "lng": -27.2,
    "source": "system"
  },
  {
    "name": "Azufre, Cerro del",
    "lat": -21.787,
    "lng": -68.237,
    "source": "gvp"
  },
  {
    "name": "Azul, Cerro",
    "lat": -0.92,
    "lng": -91.408,
    "source": "gvp"
  },
  {
    "name": "Azul, Cerro",
    "lat": -35.653,
    "lng": -70.761,
    "source": "gvp"
  },
  {
    "name": "Azumayama",
    "lat": 37.735,
    "lng": 140.244,
    "source": "gvp"
  },
  {
    "name": "Babuyan Claro",
    "lat": 19.523,
    "lng": 121.94,
    "source": "gvp"
  },
  {
    "name": "Bagana",
    "lat": -6.137,
    "lng": 155.196,
    "source": "gvp"
  },
  {
    "name": "Bakening",
    "lat": 53.905,
    "lng": 158.07,
    "source": "gvp"
  },
  {
    "name": "Bal Haf, Harra of",
    "lat": 14.067,
    "lng": 48.3,
    "source": "gvp"
  },
  {
    "name": "Baluan",
    "lat": -2.57,
    "lng": 147.28,
    "source": "gvp"
  },
  {
    "name": "Balut",
    "lat": 5.4,
    "lng": 125.375,
    "source": "gvp"
  },
  {
    "name": "Banahaw",
    "lat": 14.07,
    "lng": 121.48,
    "source": "gvp"
  },
  {
    "name": "Banda Api",
    "lat": -4.523,
    "lng": 129.881,
    "source": "gvp"
  },
  {
    "name": "Bandaisan",
    "lat": 37.601,
    "lng": 140.072,
    "source": "gvp"
  },
  {
    "name": "Barcena",
    "lat": 19.3,
    "lng": -110.82,
    "source": "gvp"
  },
  {
    "name": "Bardarbunga",
    "lat": 64.633,
    "lng": -17.516,
    "source": "gvp"
  },
  {
    "name": "Barkhatnaya Sopka",
    "lat": 52.802,
    "lng": 158.24,
    "source": "gvp"
  },
  {
    "name": "Barrier, The",
    "lat": 2.32,
    "lng": 36.57,
    "source": "gvp"
  },
  {
    "name": "Barva",
    "lat": 10.135,
    "lng": -84.1,
    "source": "gvp"
  },
  {
    "name": "Bas Dong Nai",
    "lat": 10.8,
    "lng": 107.2,
    "source": "gvp"
  },
  {
    "name": "Batur",
    "lat": -8.242,
    "lng": 115.375,
    "source": "gvp"
  },
  {
    "name": "Bayo Gorbea, Cerro",
    "lat": -25.414,
    "lng": -68.588,
    "source": "gvp"
  },
  {
    "name": "Bayuda Volcanic Field",
    "lat": 18.33,
    "lng": 32.75,
    "source": "gvp"
  },
  {
    "name": "Behm Canal-Rudyerd Bay",
    "lat": 55.3196,
    "lng": -131.051,
    "source": "usgs"
  },
  {
    "name": "Belknap Crater",
    "lat": 44.285,
    "lng": -121.841,
    "source": "usgs"
  },
  {
    "name": "Bely",
    "lat": 57.88,
    "lng": 160.53,
    "source": "gvp"
  },
  {
    "name": "Berlin",
    "lat": -76.05,
    "lng": -136,
    "source": "gvp"
  },
  {
    "name": "Berutarubesan [Berutarube]",
    "lat": 44.462,
    "lng": 146.932,
    "source": "gvp"
  },
  {
    "name": "Bezymianny",
    "lat": 55.972,
    "lng": 160.595,
    "source": "gvp"
  },
  {
    "name": "Bibinoi",
    "lat": -0.761,
    "lng": 127.725,
    "source": "gvp"
  },
  {
    "name": "Biliran",
    "lat": 11.523,
    "lng": 124.535,
    "source": "gvp"
  },
  {
    "name": "Billy Mitchell",
    "lat": -6.092,
    "lng": 155.225,
    "source": "gvp"
  },
  {
    "name": "Birk, Harrat al",
    "lat": 18.37,
    "lng": 41.63,
    "source": "gvp"
  },
  {
    "name": "Bishoftu Volcanic Field",
    "lat": 8.78,
    "lng": 38.98,
    "source": "gvp"
  },
  {
    "name": "Black Butte Crater lava field",
    "lat": 43.18,
    "lng": -114.35,
    "source": "usgs"
  },
  {
    "name": "Black Peak",
    "lat": 56.5512,
    "lng": -158.787,
    "source": "usgs"
  },
  {
    "name": "Black Rock Desert volcanic field",
    "lat": 38.97,
    "lng": -112.5,
    "source": "usgs"
  },
  {
    "name": "Blanca, Laguna",
    "lat": -39.02,
    "lng": -70.37,
    "source": "gvp"
  },
  {
    "name": "Blanco, Cerro",
    "lat": -26.789,
    "lng": -67.765,
    "source": "gvp"
  },
  {
    "name": "Blue Lake Crater",
    "lat": 44.42,
    "lng": -121.77,
    "source": "usgs"
  },
  {
    "name": "Bobrof",
    "lat": 51.9072,
    "lng": -177.4409,
    "source": "usgs"
  },
  {
    "name": "Bogoslof",
    "lat": 53.9272,
    "lng": -168.0344,
    "source": "usgs"
  },
  {
    "name": "Bolshe-Bannaya",
    "lat": 52.9,
    "lng": 157.78,
    "source": "gvp"
  },
  {
    "name": "Bolshoi Payalpan",
    "lat": 55.88,
    "lng": 157.78,
    "source": "gvp"
  },
  {
    "name": "Bolshoi Semiachik",
    "lat": 54.32,
    "lng": 160.02,
    "source": "gvp"
  },
  {
    "name": "Bolshoi-Kekuknaysky",
    "lat": 56.483,
    "lng": 157.917,
    "source": "gvp"
  },
  {
    "name": "Bora-Bericcio",
    "lat": 8.221,
    "lng": 39.05,
    "source": "gvp"
  },
  {
    "name": "Borawli",
    "lat": 13.304,
    "lng": 40.987,
    "source": "gvp"
  },
  {
    "name": "Boset-Bericha",
    "lat": 8.558,
    "lng": 39.475,
    "source": "gvp"
  },
  {
    "name": "Bouvet",
    "lat": -54.408,
    "lng": 3.351,
    "source": "gvp"
  },
  {
    "name": "Bravo, Cerro",
    "lat": 5.091,
    "lng": -75.293,
    "source": "gvp"
  },
  {
    "name": "Brennisteinsfjoll",
    "lat": 63.933,
    "lng": -21.783,
    "source": "gvp"
  },
  {
    "name": "Bridge River Cones",
    "lat": 50.8,
    "lng": -123.4,
    "source": "gvp"
  },
  {
    "name": "Bristol Island",
    "lat": -59.017,
    "lng": -26.533,
    "source": "gvp"
  },
  {
    "name": "Buckle Island",
    "lat": -66.78,
    "lng": 163.25,
    "source": "gvp"
  },
  {
    "name": "Buldir",
    "lat": 52.3488,
    "lng": 175.909,
    "source": "usgs"
  },
  {
    "name": "Bulusan",
    "lat": 12.769,
    "lng": 124.056,
    "source": "gvp"
  },
  {
    "name": "Bunyaruguru",
    "lat": -0.2,
    "lng": 30.08,
    "source": "gvp"
  },
  {
    "name": "Butajiri-Silti Field",
    "lat": 8.05,
    "lng": 38.35,
    "source": "gvp"
  },
  {
    "name": "Buyan-Bratan",
    "lat": -8.283,
    "lng": 115.133,
    "source": "gvp"
  },
  {
    "name": "Buzzard Creek",
    "lat": 64.0611,
    "lng": -148.4319,
    "source": "usgs"
  },
  {
    "name": "Cabalían",
    "lat": 10.285,
    "lng": 125.218,
    "source": "gvp"
  },
  {
    "name": "Caburgua-Huelemolle",
    "lat": -39.25,
    "lng": -71.75,
    "source": "gvp"
  },
  {
    "name": "Cagua",
    "lat": 18.222,
    "lng": 122.123,
    "source": "gvp"
  },
  {
    "name": "Calabozos",
    "lat": -35.558,
    "lng": -70.496,
    "source": "gvp"
  },
  {
    "name": "Calatrava Volcanic Field",
    "lat": 38.87,
    "lng": -4.02,
    "source": "gvp"
  },
  {
    "name": "Calbuco",
    "lat": -41.33,
    "lng": -72.618,
    "source": "gvp"
  },
  {
    "name": "Callaqui",
    "lat": -37.92,
    "lng": -71.45,
    "source": "gvp"
  },
  {
    "name": "Cameroon",
    "lat": 4.203,
    "lng": 9.17,
    "source": "gvp"
  },
  {
    "name": "Camiguin",
    "lat": 9.203,
    "lng": 124.673,
    "source": "gvp"
  },
  {
    "name": "Camiguin de Babuyanes",
    "lat": 18.83,
    "lng": 121.86,
    "source": "gvp"
  },
  {
    "name": "Campi Flegrei",
    "lat": 40.827,
    "lng": 14.139,
    "source": "gvp"
  },
  {
    "name": "Campi Flegrei del Mar di Sicilia",
    "lat": 37.1,
    "lng": 12.7,
    "source": "gvp"
  },
  {
    "name": "Canary Islands hotspot",
    "lat": 28.3,
    "lng": -16.6,
    "source": "system"
  },
  {
    "name": "Candlemas Island",
    "lat": -57.08,
    "lng": -26.67,
    "source": "gvp"
  },
  {
    "name": "Cape Verde hotspot",
    "lat": 14.95,
    "lng": -24.35,
    "source": "system"
  },
  {
    "name": "Caribbean Lesser Antilles arc",
    "lat": 15,
    "lng": -61.3,
    "source": "system"
  },
  {
    "name": "Carlisle",
    "lat": 52.8906,
    "lng": -170.0576,
    "source": "usgs"
  },
  {
    "name": "Carran-Los Venados",
    "lat": -40.35,
    "lng": -72.07,
    "source": "gvp"
  },
  {
    "name": "Carrizozo lava flow",
    "lat": 33.78,
    "lng": -105.93,
    "source": "usgs"
  },
  {
    "name": "Cascades arc (Mount St. Helens sector)",
    "lat": 46.2,
    "lng": -122.2,
    "source": "system"
  },
  {
    "name": "Cayambe",
    "lat": 0.029,
    "lng": -77.986,
    "source": "gvp"
  },
  {
    "name": "Cayley Volcanic Field",
    "lat": 50.12,
    "lng": -123.28,
    "source": "gvp"
  },
  {
    "name": "Cayutue-La Vigueria",
    "lat": -41.25,
    "lng": -72.27,
    "source": "gvp"
  },
  {
    "name": "Ceboruco",
    "lat": 21.125,
    "lng": -104.508,
    "source": "gvp"
  },
  {
    "name": "Central American volcanic arc (El Salvador)",
    "lat": 13.7,
    "lng": -89.2,
    "source": "system"
  },
  {
    "name": "Central Island",
    "lat": 3.496,
    "lng": 36.04,
    "source": "gvp"
  },
  {
    "name": "Cereme",
    "lat": -6.895,
    "lng": 108.408,
    "source": "gvp"
  },
  {
    "name": "Ch'uga-ryong",
    "lat": 38.33,
    "lng": 127.33,
    "source": "gvp"
  },
  {
    "name": "Chacana",
    "lat": -0.375,
    "lng": -78.25,
    "source": "gvp"
  },
  {
    "name": "Chachadake [Tiatia]",
    "lat": 44.353,
    "lng": 146.252,
    "source": "gvp"
  },
  {
    "name": "Chachani, Nevado",
    "lat": -16.191,
    "lng": -71.53,
    "source": "gvp"
  },
  {
    "name": "Chachimbiro",
    "lat": 0.468,
    "lng": -78.287,
    "source": "gvp"
  },
  {
    "name": "Chagulak",
    "lat": 52.5714,
    "lng": -171.1395,
    "source": "usgs"
  },
  {
    "name": "Chaine des Puys",
    "lat": 45.775,
    "lng": 2.97,
    "source": "gvp"
  },
  {
    "name": "Changbaishan",
    "lat": 41.98,
    "lng": 128.08,
    "source": "gvp"
  },
  {
    "name": "Cherpuk Group",
    "lat": 55.55,
    "lng": 157.47,
    "source": "gvp"
  },
  {
    "name": "Chichinautzin",
    "lat": 19.08,
    "lng": -99.13,
    "source": "gvp"
  },
  {
    "name": "Chichon, El",
    "lat": 17.36,
    "lng": -93.228,
    "source": "gvp"
  },
  {
    "name": "Chiginagak",
    "lat": 57.1335,
    "lng": -156.9915,
    "source": "usgs"
  },
  {
    "name": "Chikurachki",
    "lat": 50.324,
    "lng": 155.461,
    "source": "gvp"
  },
  {
    "name": "Chiles-Cerro Negro",
    "lat": 0.817,
    "lng": -77.938,
    "source": "gvp"
  },
  {
    "name": "Chillan, Nevados de",
    "lat": -36.868,
    "lng": -71.378,
    "source": "gvp"
  },
  {
    "name": "Chinameca",
    "lat": 13.478,
    "lng": -88.33,
    "source": "gvp"
  },
  {
    "name": "Chingo",
    "lat": 14.12,
    "lng": -89.73,
    "source": "gvp"
  },
  {
    "name": "Chiquimula Volcanic Field",
    "lat": 14.83,
    "lng": -89.55,
    "source": "gvp"
  },
  {
    "name": "Chirippusan [Chirip]",
    "lat": 45.338,
    "lng": 147.92,
    "source": "gvp"
  },
  {
    "name": "Chirpoi",
    "lat": 46.532,
    "lng": 150.871,
    "source": "gvp"
  },
  {
    "name": "Chokaisan",
    "lat": 39.099,
    "lng": 140.049,
    "source": "gvp"
  },
  {
    "name": "Chyulu Hills",
    "lat": -2.68,
    "lng": 37.88,
    "source": "gvp"
  },
  {
    "name": "Cinnamon Butte",
    "lat": 43.241,
    "lng": -122.108,
    "source": "usgs"
  },
  {
    "name": "Clear Lake Volcanic Field",
    "lat": 38.97,
    "lng": -122.77,
    "source": "usgs"
  },
  {
    "name": "Cleft Segment",
    "lat": 44.83,
    "lng": -130.3,
    "source": "gvp"
  },
  {
    "name": "Cleveland",
    "lat": 52.8222,
    "lng": -169.945,
    "source": "usgs"
  },
  {
    "name": "Coatepeque Caldera",
    "lat": 13.87,
    "lng": -89.55,
    "source": "gvp"
  },
  {
    "name": "CoAxial Segment",
    "lat": 46.52,
    "lng": -129.58,
    "source": "gvp"
  },
  {
    "name": "Cochons, Ile aux",
    "lat": -46.1,
    "lng": 50.23,
    "source": "gvp"
  },
  {
    "name": "Cofre de Perote",
    "lat": 19.492,
    "lng": -97.15,
    "source": "gvp"
  },
  {
    "name": "Colima",
    "lat": 19.514,
    "lng": -103.62,
    "source": "gvp"
  },
  {
    "name": "Colli Albani",
    "lat": 41.73,
    "lng": 12.7,
    "source": "gvp"
  },
  {
    "name": "Comondu-La Purisima",
    "lat": 26,
    "lng": -111.92,
    "source": "gvp"
  },
  {
    "name": "Concepcion",
    "lat": 11.538,
    "lng": -85.622,
    "source": "gvp"
  },
  {
    "name": "Copahue",
    "lat": -37.856,
    "lng": -71.183,
    "source": "gvp"
  },
  {
    "name": "Corbetti Caldera",
    "lat": 7.193,
    "lng": 38.39,
    "source": "gvp"
  },
  {
    "name": "Cordon de Puntas Negras",
    "lat": -23.743,
    "lng": -67.534,
    "source": "gvp"
  },
  {
    "name": "Corvo",
    "lat": 39.699,
    "lng": -31.111,
    "source": "gvp"
  },
  {
    "name": "Cosiguina",
    "lat": 12.98,
    "lng": -87.57,
    "source": "gvp"
  },
  {
    "name": "Coso Volcanic Field",
    "lat": 36.03,
    "lng": -117.82,
    "source": "usgs"
  },
  {
    "name": "Cotopaxi",
    "lat": -0.677,
    "lng": -78.436,
    "source": "gvp"
  },
  {
    "name": "Crater Basalt Volcanic Field",
    "lat": -42.018,
    "lng": -70.194,
    "source": "gvp"
  },
  {
    "name": "Crater Lake",
    "lat": 42.93,
    "lng": -122.12,
    "source": "usgs"
  },
  {
    "name": "Craters of the Moon volcanic field",
    "lat": 43.42,
    "lng": -113.5,
    "source": "usgs"
  },
  {
    "name": "Cuernos de Negros",
    "lat": 9.25,
    "lng": 123.17,
    "source": "gvp"
  },
  {
    "name": "Cuicocha",
    "lat": 0.308,
    "lng": -78.364,
    "source": "gvp"
  },
  {
    "name": "Cuilapa-Barbarena",
    "lat": 14.33,
    "lng": -90.4,
    "source": "gvp"
  },
  {
    "name": "Cumbal",
    "lat": 0.95,
    "lng": -77.87,
    "source": "gvp"
  },
  {
    "name": "Cumbres,  Las",
    "lat": 19.15,
    "lng": -97.27,
    "source": "gvp"
  },
  {
    "name": "Dabbahu",
    "lat": 12.595,
    "lng": 40.48,
    "source": "gvp"
  },
  {
    "name": "Dabbayra",
    "lat": 12.38,
    "lng": 40.07,
    "source": "gvp"
  },
  {
    "name": "Daikoku seamount",
    "lat": 21.324,
    "lng": 144.194,
    "source": "usgs"
  },
  {
    "name": "Dakataua",
    "lat": -5.094,
    "lng": 150.094,
    "source": "gvp"
  },
  {
    "name": "Dama Ali",
    "lat": 11.28,
    "lng": 41.63,
    "source": "gvp"
  },
  {
    "name": "Damavand",
    "lat": 35.951,
    "lng": 52.109,
    "source": "gvp"
  },
  {
    "name": "Dana",
    "lat": 55.6421,
    "lng": -161.2155,
    "source": "usgs"
  },
  {
    "name": "Dariganga Volcanic Field",
    "lat": 45.754,
    "lng": 114.279,
    "source": "gvp"
  },
  {
    "name": "Darwin",
    "lat": -0.18,
    "lng": -91.28,
    "source": "gvp"
  },
  {
    "name": "Daun, Bukit",
    "lat": -3.38,
    "lng": 102.37,
    "source": "gvp"
  },
  {
    "name": "Davidof",
    "lat": 51.9542,
    "lng": 178.326,
    "source": "usgs"
  },
  {
    "name": "Davis Lake volcanic field",
    "lat": 43.57,
    "lng": -121.82,
    "source": "usgs"
  },
  {
    "name": "Dawson Strait Group",
    "lat": -9.62,
    "lng": 150.88,
    "source": "gvp"
  },
  {
    "name": "Deception Island",
    "lat": -63.001,
    "lng": -60.652,
    "source": "gvp"
  },
  {
    "name": "Dempo",
    "lat": -4.016,
    "lng": 103.121,
    "source": "gvp"
  },
  {
    "name": "Denison",
    "lat": 58.4173,
    "lng": -154.451,
    "source": "usgs"
  },
  {
    "name": "Descabezado Grande",
    "lat": -35.58,
    "lng": -70.75,
    "source": "gvp"
  },
  {
    "name": "Devils Garden lava field",
    "lat": 43.512,
    "lng": -120.861,
    "source": "usgs"
  },
  {
    "name": "Dhamar, Harras of",
    "lat": 14.57,
    "lng": 44.67,
    "source": "gvp"
  },
  {
    "name": "Diables, Morne aux",
    "lat": 15.612,
    "lng": -61.43,
    "source": "gvp"
  },
  {
    "name": "Diablotins, Morne",
    "lat": 15.503,
    "lng": -61.397,
    "source": "gvp"
  },
  {
    "name": "Diamond Craters volcanic field",
    "lat": 43.1,
    "lng": -118.75,
    "source": "usgs"
  },
  {
    "name": "Dieng Volcanic Complex",
    "lat": -7.2,
    "lng": 109.879,
    "source": "gvp"
  },
  {
    "name": "Diky Greben",
    "lat": 51.452,
    "lng": 156.978,
    "source": "gvp"
  },
  {
    "name": "Domuyo",
    "lat": -36.638,
    "lng": -70.432,
    "source": "gvp"
  },
  {
    "name": "Dotsero Volcanic Center",
    "lat": 39.65,
    "lng": -107.03,
    "source": "usgs"
  },
  {
    "name": "Douglas",
    "lat": 58.8596,
    "lng": -153.5351,
    "source": "usgs"
  },
  {
    "name": "Dubbi",
    "lat": 13.579,
    "lng": 41.809,
    "source": "gvp"
  },
  {
    "name": "Dukono",
    "lat": 1.693,
    "lng": 127.894,
    "source": "gvp"
  },
  {
    "name": "Duncan Canal",
    "lat": 56.4996,
    "lng": -133.102,
    "source": "usgs"
  },
  {
    "name": "Durango Volcanic Field",
    "lat": 24.15,
    "lng": -104.45,
    "source": "gvp"
  },
  {
    "name": "Dutton",
    "lat": 55.1867,
    "lng": -162.2744,
    "source": "usgs"
  },
  {
    "name": "Dzenzursky",
    "lat": 53.637,
    "lng": 158.922,
    "source": "gvp"
  },
  {
    "name": "East African Rift (Ethiopia Afar)",
    "lat": 11.8,
    "lng": 41,
    "source": "system"
  },
  {
    "name": "East African Rift (Kenya sector)",
    "lat": -1.3,
    "lng": 36.8,
    "source": "system"
  },
  {
    "name": "East Diamante",
    "lat": 15.93,
    "lng": 145.67,
    "source": "usgs"
  },
  {
    "name": "Easter Island",
    "lat": -27.15,
    "lng": -109.38,
    "source": "gvp"
  },
  {
    "name": "Ebeko",
    "lat": 50.686,
    "lng": 156.014,
    "source": "gvp"
  },
  {
    "name": "Eburru, Ol Doinyo",
    "lat": -0.65,
    "lng": 36.22,
    "source": "gvp"
  },
  {
    "name": "Ecuador",
    "lat": -0.02,
    "lng": -91.546,
    "source": "gvp"
  },
  {
    "name": "Edgecumbe",
    "lat": 57.0509,
    "lng": -135.7611,
    "source": "usgs"
  },
  {
    "name": "Edziza",
    "lat": 57.72,
    "lng": -130.63,
    "source": "gvp"
  },
  {
    "name": "Elbrus",
    "lat": 43.351,
    "lng": 42.442,
    "source": "gvp"
  },
  {
    "name": "Elovsky",
    "lat": 57.55,
    "lng": 160.53,
    "source": "gvp"
  },
  {
    "name": "Emmons Lake volcanic center",
    "lat": 55.3409,
    "lng": -162.0726,
    "source": "usgs"
  },
  {
    "name": "Emuruangogolak",
    "lat": 1.5,
    "lng": 36.33,
    "source": "gvp"
  },
  {
    "name": "Endeavour Segment",
    "lat": 47.95,
    "lng": -129.1,
    "source": "gvp"
  },
  {
    "name": "Epi",
    "lat": -16.68,
    "lng": 168.37,
    "source": "gvp"
  },
  {
    "name": "Erciyes Dagi",
    "lat": 38.531,
    "lng": 35.447,
    "source": "gvp"
  },
  {
    "name": "Erebus",
    "lat": -77.53,
    "lng": 167.17,
    "source": "gvp"
  },
  {
    "name": "Erta Ale",
    "lat": 13.6,
    "lng": 40.67,
    "source": "gvp"
  },
  {
    "name": "Esan",
    "lat": 41.805,
    "lng": 141.166,
    "source": "gvp"
  },
  {
    "name": "Esjufjoll",
    "lat": 64.25,
    "lng": -16.583,
    "source": "gvp"
  },
  {
    "name": "Esmeralda Bank",
    "lat": 15,
    "lng": 145.25,
    "source": "usgs"
  },
  {
    "name": "Espenberg",
    "lat": 66.3493,
    "lng": -164.333,
    "source": "usgs"
  },
  {
    "name": "Esteli",
    "lat": 13.17,
    "lng": -86.4,
    "source": "gvp"
  },
  {
    "name": "Etna",
    "lat": 37.748,
    "lng": 14.999,
    "source": "gvp"
  },
  {
    "name": "Etorofu-Atosanupuri [Atosanupuri]",
    "lat": 44.808,
    "lng": 147.131,
    "source": "gvp"
  },
  {
    "name": "Etorofu-Yakeyama [Grozny Group]",
    "lat": 45.012,
    "lng": 147.871,
    "source": "gvp"
  },
  {
    "name": "Eyjafjallajokull",
    "lat": 63.633,
    "lng": -19.633,
    "source": "gvp"
  },
  {
    "name": "Farallon de Pajaros",
    "lat": 20.53,
    "lng": 144.9,
    "source": "usgs"
  },
  {
    "name": "Fayal",
    "lat": 38.6,
    "lng": -28.73,
    "source": "gvp"
  },
  {
    "name": "Fentale",
    "lat": 8.975,
    "lng": 39.93,
    "source": "gvp"
  },
  {
    "name": "Fisher",
    "lat": 54.6692,
    "lng": -164.3524,
    "source": "usgs"
  },
  {
    "name": "Flores",
    "lat": 14.308,
    "lng": -89.992,
    "source": "gvp"
  },
  {
    "name": "Flores",
    "lat": 39.462,
    "lng": -31.216,
    "source": "gvp"
  },
  {
    "name": "Fogo",
    "lat": 14.95,
    "lng": -24.35,
    "source": "gvp"
  },
  {
    "name": "Fort Portal",
    "lat": 0.7,
    "lng": 30.25,
    "source": "gvp"
  },
  {
    "name": "Fort Selkirk",
    "lat": 62.93,
    "lng": -137.38,
    "source": "gvp"
  },
  {
    "name": "Fournaise, Piton de la",
    "lat": -21.244,
    "lng": 55.708,
    "source": "gvp"
  },
  {
    "name": "Fourpeaked",
    "lat": 58.7703,
    "lng": -153.6738,
    "source": "usgs"
  },
  {
    "name": "Fremrinamar",
    "lat": 65.416,
    "lng": -16.666,
    "source": "gvp"
  },
  {
    "name": "Frosty",
    "lat": 55.0673,
    "lng": -162.8354,
    "source": "usgs"
  },
  {
    "name": "Fuego",
    "lat": 14.473,
    "lng": -90.88,
    "source": "gvp"
  },
  {
    "name": "Fuerteventura",
    "lat": 28.358,
    "lng": -14.02,
    "source": "gvp"
  },
  {
    "name": "Fujisan",
    "lat": 35.361,
    "lng": 138.728,
    "source": "gvp"
  },
  {
    "name": "Fukue",
    "lat": 32.657,
    "lng": 128.849,
    "source": "gvp"
  },
  {
    "name": "Fukujin seamount",
    "lat": 21.93,
    "lng": 143.47,
    "source": "usgs"
  },
  {
    "name": "Furnas",
    "lat": 37.77,
    "lng": -25.32,
    "source": "gvp"
  },
  {
    "name": "Gabillema",
    "lat": 11.08,
    "lng": 41.27,
    "source": "gvp"
  },
  {
    "name": "Gada Ale",
    "lat": 13.975,
    "lng": 40.408,
    "source": "gvp"
  },
  {
    "name": "Galápagos hotspot",
    "lat": -0.4,
    "lng": -91,
    "source": "system"
  },
  {
    "name": "Galapagos Rift",
    "lat": 0.792,
    "lng": -86.15,
    "source": "gvp"
  },
  {
    "name": "Galeras",
    "lat": 1.22,
    "lng": -77.37,
    "source": "gvp"
  },
  {
    "name": "Gallego",
    "lat": -9.35,
    "lng": 159.73,
    "source": "gvp"
  },
  {
    "name": "Galunggung",
    "lat": -7.25,
    "lng": 108.058,
    "source": "gvp"
  },
  {
    "name": "Gamalama",
    "lat": 0.8,
    "lng": 127.33,
    "source": "gvp"
  },
  {
    "name": "Gamchen",
    "lat": 54.974,
    "lng": 160.703,
    "source": "gvp"
  },
  {
    "name": "Gamkonora",
    "lat": 1.38,
    "lng": 127.53,
    "source": "gvp"
  },
  {
    "name": "Gareloi",
    "lat": 51.7892,
    "lng": -178.796,
    "source": "usgs"
  },
  {
    "name": "Garibaldi",
    "lat": 49.85,
    "lng": -123,
    "source": "gvp"
  },
  {
    "name": "Garibaldi Lake",
    "lat": 49.933,
    "lng": -123,
    "source": "gvp"
  },
  {
    "name": "Garove",
    "lat": -4.687,
    "lng": 149.511,
    "source": "gvp"
  },
  {
    "name": "Garua Harbour",
    "lat": -5.3,
    "lng": 150.07,
    "source": "gvp"
  },
  {
    "name": "Gaua",
    "lat": -14.27,
    "lng": 167.5,
    "source": "gvp"
  },
  {
    "name": "Gedamsa",
    "lat": 8.357,
    "lng": 39.188,
    "source": "gvp"
  },
  {
    "name": "Gede-Pangrango",
    "lat": -6.77,
    "lng": 106.965,
    "source": "gvp"
  },
  {
    "name": "Genovesa",
    "lat": 0.32,
    "lng": -89.958,
    "source": "gvp"
  },
  {
    "name": "Ghegham Volcanic Ridge",
    "lat": 40.283,
    "lng": 45,
    "source": "gvp"
  },
  {
    "name": "Glacier Peak",
    "lat": 48.112,
    "lng": -121.113,
    "source": "usgs"
  },
  {
    "name": "Gloria, La",
    "lat": 19.33,
    "lng": -97.25,
    "source": "gvp"
  },
  {
    "name": "Golden Trout Creek",
    "lat": 36.358,
    "lng": -118.32,
    "source": "gvp"
  },
  {
    "name": "Goodenough",
    "lat": -9.48,
    "lng": 150.35,
    "source": "gvp"
  },
  {
    "name": "Gordon",
    "lat": 62.1312,
    "lng": -143.0883,
    "source": "usgs"
  },
  {
    "name": "Gorely",
    "lat": 52.559,
    "lng": 158.03,
    "source": "gvp"
  },
  {
    "name": "Graciosa",
    "lat": 39.02,
    "lng": -27.97,
    "source": "gvp"
  },
  {
    "name": "Gran Canaria",
    "lat": 28,
    "lng": -15.58,
    "source": "gvp"
  },
  {
    "name": "Granada",
    "lat": 11.92,
    "lng": -85.98,
    "source": "gvp"
  },
  {
    "name": "Great Sitkin",
    "lat": 52.0765,
    "lng": -176.1109,
    "source": "usgs"
  },
  {
    "name": "Griggs",
    "lat": 58.3572,
    "lng": -155.1037,
    "source": "usgs"
  },
  {
    "name": "Grimsnes",
    "lat": 64.05,
    "lng": -20.883,
    "source": "gvp"
  },
  {
    "name": "Grimsvotn",
    "lat": 64.416,
    "lng": -17.316,
    "source": "gvp"
  },
  {
    "name": "Guagua Pichincha",
    "lat": -0.171,
    "lng": -78.598,
    "source": "gvp"
  },
  {
    "name": "Guayaques",
    "lat": -22.895,
    "lng": -67.566,
    "source": "gvp"
  },
  {
    "name": "Guazapa",
    "lat": 13.9,
    "lng": -89.12,
    "source": "gvp"
  },
  {
    "name": "Gufa",
    "lat": 12.55,
    "lng": 42.53,
    "source": "gvp"
  },
  {
    "name": "Guguan",
    "lat": 17.32,
    "lng": 145.85,
    "source": "usgs"
  },
  {
    "name": "Guntur",
    "lat": -7.143,
    "lng": 107.84,
    "source": "gvp"
  },
  {
    "name": "Hachijojima",
    "lat": 33.137,
    "lng": 139.766,
    "source": "gvp"
  },
  {
    "name": "Hachimantai",
    "lat": 39.958,
    "lng": 140.854,
    "source": "gvp"
  },
  {
    "name": "Hainan Volcanic Field",
    "lat": 19.905,
    "lng": 110.229,
    "source": "gvp"
  },
  {
    "name": "Hakkodasan",
    "lat": 40.659,
    "lng": 140.877,
    "source": "gvp"
  },
  {
    "name": "Hakoneyama",
    "lat": 35.233,
    "lng": 139.021,
    "source": "gvp"
  },
  {
    "name": "Hakusan",
    "lat": 36.155,
    "lng": 136.771,
    "source": "gvp"
  },
  {
    "name": "Haleakala",
    "lat": 20.708,
    "lng": -156.25,
    "source": "usgs"
  },
  {
    "name": "Halla",
    "lat": 33.361,
    "lng": 126.53,
    "source": "gvp"
  },
  {
    "name": "Hanish",
    "lat": 13.72,
    "lng": 42.73,
    "source": "gvp"
  },
  {
    "name": "Hargy",
    "lat": -5.33,
    "lng": 151.1,
    "source": "gvp"
  },
  {
    "name": "Harrat Ash Shamah",
    "lat": 32.333,
    "lng": 37.583,
    "source": "gvp"
  },
  {
    "name": "Harunasan",
    "lat": 36.477,
    "lng": 138.851,
    "source": "gvp"
  },
  {
    "name": "Hasan Dagi",
    "lat": 38.13,
    "lng": 34.17,
    "source": "gvp"
  },
  {
    "name": "Haut Dong Nai",
    "lat": 11.6,
    "lng": 108.2,
    "source": "gvp"
  },
  {
    "name": "Hawaii hotspot (Kilauea–Mauna Loa)",
    "lat": 19.4,
    "lng": -155.3,
    "source": "system"
  },
  {
    "name": "Hayes",
    "lat": 61.5991,
    "lng": -152.4182,
    "source": "usgs"
  },
  {
    "name": "Haylan, Jabal",
    "lat": 15.4,
    "lng": 45.1,
    "source": "gvp"
  },
  {
    "name": "Healy",
    "lat": -35.004,
    "lng": 178.973,
    "source": "gvp"
  },
  {
    "name": "Heard",
    "lat": -53.106,
    "lng": 73.513,
    "source": "gvp"
  },
  {
    "name": "Hekla",
    "lat": 63.983,
    "lng": -19.666,
    "source": "gvp"
  },
  {
    "name": "Helgrindur",
    "lat": 64.866,
    "lng": -23.283,
    "source": "gvp"
  },
  {
    "name": "Hells Half Acre lava field",
    "lat": 43.5,
    "lng": -112.45,
    "source": "usgs"
  },
  {
    "name": "Hengill",
    "lat": 64.083,
    "lng": -21.416,
    "source": "gvp"
  },
  {
    "name": "Herbert",
    "lat": 52.741,
    "lng": -170.113,
    "source": "usgs"
  },
  {
    "name": "Hierro",
    "lat": 27.73,
    "lng": -18.03,
    "source": "gvp"
  },
  {
    "name": "Hiuchigatake",
    "lat": 36.955,
    "lng": 139.285,
    "source": "gvp"
  },
  {
    "name": "Hodson",
    "lat": -56.712,
    "lng": -27.176,
    "source": "gvp"
  },
  {
    "name": "Hofsjokull",
    "lat": 64.833,
    "lng": -18.766,
    "source": "gvp"
  },
  {
    "name": "Hokkaido-Komagatake",
    "lat": 42.063,
    "lng": 140.677,
    "source": "gvp"
  },
  {
    "name": "Homa Mountain",
    "lat": -0.38,
    "lng": 34.5,
    "source": "gvp"
  },
  {
    "name": "Hoodoo Mountain",
    "lat": 56.78,
    "lng": -131.28,
    "source": "gvp"
  },
  {
    "name": "Hromundartindur",
    "lat": 64.083,
    "lng": -21.333,
    "source": "gvp"
  },
  {
    "name": "Hualalai",
    "lat": 19.692,
    "lng": -155.87,
    "source": "usgs"
  },
  {
    "name": "Huambo",
    "lat": -15.83,
    "lng": -72.13,
    "source": "gvp"
  },
  {
    "name": "Huanquihue Group",
    "lat": -39.887,
    "lng": -71.58,
    "source": "gvp"
  },
  {
    "name": "Huaynaputina",
    "lat": -16.608,
    "lng": -70.85,
    "source": "gvp"
  },
  {
    "name": "Hudson Mountains",
    "lat": -74.33,
    "lng": -99.42,
    "source": "gvp"
  },
  {
    "name": "Hudson, Cerro",
    "lat": -45.9,
    "lng": -72.97,
    "source": "gvp"
  },
  {
    "name": "Huequi",
    "lat": -42.377,
    "lng": -72.578,
    "source": "gvp"
  },
  {
    "name": "Hulubelu",
    "lat": -5.334,
    "lng": 104.59,
    "source": "gvp"
  },
  {
    "name": "Hululais",
    "lat": -3.247,
    "lng": 102.239,
    "source": "gvp"
  },
  {
    "name": "Humeros, Los",
    "lat": 19.68,
    "lng": -97.45,
    "source": "gvp"
  },
  {
    "name": "Iamalele",
    "lat": -9.52,
    "lng": 150.53,
    "source": "gvp"
  },
  {
    "name": "Ibu",
    "lat": 1.488,
    "lng": 127.63,
    "source": "gvp"
  },
  {
    "name": "Iettunup",
    "lat": 58.4,
    "lng": 161.08,
    "source": "gvp"
  },
  {
    "name": "Igwisi Hills",
    "lat": -4.889,
    "lng": 31.933,
    "source": "gvp"
  },
  {
    "name": "Ijen",
    "lat": -8.058,
    "lng": 114.242,
    "source": "gvp"
  },
  {
    "name": "Iktunup",
    "lat": 58.08,
    "lng": 160.77,
    "source": "gvp"
  },
  {
    "name": "Iliamna",
    "lat": 60.0319,
    "lng": -153.0918,
    "source": "usgs"
  },
  {
    "name": "Iliboleng",
    "lat": -8.342,
    "lng": 123.258,
    "source": "gvp"
  },
  {
    "name": "Ililabalekan",
    "lat": -8.55,
    "lng": 123.38,
    "source": "gvp"
  },
  {
    "name": "Ilimuda",
    "lat": -8.479,
    "lng": 122.761,
    "source": "gvp"
  },
  {
    "name": "Iliwerung",
    "lat": -8.53,
    "lng": 123.57,
    "source": "gvp"
  },
  {
    "name": "Illiniza",
    "lat": -0.659,
    "lng": -78.714,
    "source": "gvp"
  },
  {
    "name": "Ilopango",
    "lat": 13.672,
    "lng": -89.053,
    "source": "gvp"
  },
  {
    "name": "Imbabura",
    "lat": 0.258,
    "lng": -78.183,
    "source": "gvp"
  },
  {
    "name": "Imuruk Lake",
    "lat": 65.6,
    "lng": -163.92,
    "source": "usgs"
  },
  {
    "name": "Indian Heaven Volcanic Field",
    "lat": 45.93,
    "lng": -121.82,
    "source": "usgs"
  },
  {
    "name": "Indonesia Banda arc",
    "lat": -7.5,
    "lng": 129,
    "source": "system"
  },
  {
    "name": "Indonesia Sunda arc",
    "lat": -7.5,
    "lng": 110,
    "source": "system"
  },
  {
    "name": "Infiernillo",
    "lat": -35.123,
    "lng": -69.9,
    "source": "gvp"
  },
  {
    "name": "Ingakslugwat Hills",
    "lat": 61.43,
    "lng": -164.47,
    "source": "usgs"
  },
  {
    "name": "Inielika",
    "lat": -8.73,
    "lng": 120.98,
    "source": "gvp"
  },
  {
    "name": "Inierie",
    "lat": -8.875,
    "lng": 120.95,
    "source": "gvp"
  },
  {
    "name": "Io-Torishima",
    "lat": 27.881,
    "lng": 128.223,
    "source": "gvp"
  },
  {
    "name": "Ioto",
    "lat": 24.751,
    "lng": 141.289,
    "source": "gvp"
  },
  {
    "name": "Ipala",
    "lat": 14.55,
    "lng": -89.63,
    "source": "gvp"
  },
  {
    "name": "Irazu",
    "lat": 9.979,
    "lng": -83.852,
    "source": "gvp"
  },
  {
    "name": "Isabel, Isla",
    "lat": 21.848,
    "lng": -105.886,
    "source": "gvp"
  },
  {
    "name": "Isanotski",
    "lat": 54.768,
    "lng": -163.729,
    "source": "usgs"
  },
  {
    "name": "Isarog",
    "lat": 13.658,
    "lng": 123.38,
    "source": "gvp"
  },
  {
    "name": "Ischia",
    "lat": 40.73,
    "lng": 13.897,
    "source": "gvp"
  },
  {
    "name": "Iskut-Unuk River cones",
    "lat": 56.5196,
    "lng": -130.331,
    "source": "usgs"
  },
  {
    "name": "Italy Campanian arc",
    "lat": 40.8,
    "lng": 14.4,
    "source": "system"
  },
  {
    "name": "Itasy Volcanic Field",
    "lat": -19.033,
    "lng": 46.7,
    "source": "gvp"
  },
  {
    "name": "Ithnayn, Harrat",
    "lat": 26.58,
    "lng": 40.2,
    "source": "gvp"
  },
  {
    "name": "Iwakisan",
    "lat": 40.656,
    "lng": 140.303,
    "source": "gvp"
  },
  {
    "name": "Iwatesan",
    "lat": 39.853,
    "lng": 141.001,
    "source": "gvp"
  },
  {
    "name": "Ixtepeque",
    "lat": 14.42,
    "lng": -89.68,
    "source": "gvp"
  },
  {
    "name": "Iya",
    "lat": -8.891,
    "lng": 121.641,
    "source": "gvp"
  },
  {
    "name": "Iyang-Argapura",
    "lat": -7.97,
    "lng": 113.57,
    "source": "gvp"
  },
  {
    "name": "Iztaccihuatl",
    "lat": 19.179,
    "lng": -98.642,
    "source": "gvp"
  },
  {
    "name": "Izu-Oshima",
    "lat": 34.724,
    "lng": 139.394,
    "source": "gvp"
  },
  {
    "name": "Izu-Tobu",
    "lat": 34.9,
    "lng": 139.098,
    "source": "gvp"
  },
  {
    "name": "Izu-Torishima",
    "lat": 30.484,
    "lng": 140.303,
    "source": "gvp"
  },
  {
    "name": "Jailolo",
    "lat": 1.08,
    "lng": 127.439,
    "source": "gvp"
  },
  {
    "name": "James Ross Island",
    "lat": -64.15,
    "lng": -57.75,
    "source": "gvp"
  },
  {
    "name": "Jan Mayen",
    "lat": 71.082,
    "lng": -8.155,
    "source": "gvp"
  },
  {
    "name": "Japan arc (Honshu)",
    "lat": 35.4,
    "lng": 138.7,
    "source": "system"
  },
  {
    "name": "Jatun Mundo Quri Warani",
    "lat": -19.78,
    "lng": -66.48,
    "source": "gvp"
  },
  {
    "name": "Jayu Khota, Laguna",
    "lat": -19.463,
    "lng": -67.432,
    "source": "gvp"
  },
  {
    "name": "Jingbo",
    "lat": 44.08,
    "lng": 128.83,
    "source": "gvp"
  },
  {
    "name": "Jom-Bolok",
    "lat": 52.713,
    "lng": 99.021,
    "source": "gvp"
  },
  {
    "name": "Jordan Craters volcanic field",
    "lat": 43.15,
    "lng": -117.47,
    "source": "usgs"
  },
  {
    "name": "Kaba",
    "lat": -3.522,
    "lng": 102.615,
    "source": "gvp"
  },
  {
    "name": "Kagamil",
    "lat": 52.9726,
    "lng": -169.719,
    "source": "usgs"
  },
  {
    "name": "Kaguyak",
    "lat": 58.6113,
    "lng": -154.0245,
    "source": "usgs"
  },
  {
    "name": "Kaikata Seamount",
    "lat": 26.667,
    "lng": 140.929,
    "source": "gvp"
  },
  {
    "name": "Kaikohe-Bay of Islands",
    "lat": -35.3,
    "lng": 173.9,
    "source": "gvp"
  },
  {
    "name": "Kaitoku Seamount",
    "lat": 26.127,
    "lng": 141.102,
    "source": "gvp"
  },
  {
    "name": "Kama'ehuakanaloa",
    "lat": 18.92,
    "lng": -155.27,
    "source": "usgs"
  },
  {
    "name": "Kamchatka arc",
    "lat": 53,
    "lng": 159,
    "source": "system"
  },
  {
    "name": "Kanaga",
    "lat": 51.9242,
    "lng": -177.1623,
    "source": "usgs"
  },
  {
    "name": "Kanlaon",
    "lat": 10.412,
    "lng": 123.132,
    "source": "gvp"
  },
  {
    "name": "Karang",
    "lat": -6.268,
    "lng": 106.05,
    "source": "gvp"
  },
  {
    "name": "Karapinar Field",
    "lat": 37.667,
    "lng": 33.6,
    "source": "gvp"
  },
  {
    "name": "Karisimbi",
    "lat": -1.506,
    "lng": 29.45,
    "source": "gvp"
  },
  {
    "name": "Karkar",
    "lat": -4.649,
    "lng": 145.964,
    "source": "gvp"
  },
  {
    "name": "Karthala",
    "lat": -11.75,
    "lng": 43.38,
    "source": "gvp"
  },
  {
    "name": "Karymsky",
    "lat": 54.049,
    "lng": 159.443,
    "source": "gvp"
  },
  {
    "name": "Kasatochi",
    "lat": 52.1693,
    "lng": -175.5113,
    "source": "usgs"
  },
  {
    "name": "Kasuga 2",
    "lat": 21.6,
    "lng": 143.637,
    "source": "usgs"
  },
  {
    "name": "Katla",
    "lat": 63.633,
    "lng": -19.083,
    "source": "gvp"
  },
  {
    "name": "Katmai",
    "lat": 58.279,
    "lng": -154.9533,
    "source": "usgs"
  },
  {
    "name": "Katwe-Kikorongo",
    "lat": -0.08,
    "lng": 29.92,
    "source": "gvp"
  },
  {
    "name": "Kazbek",
    "lat": 42.7,
    "lng": 44.5,
    "source": "gvp"
  },
  {
    "name": "Kebeney",
    "lat": 57.1,
    "lng": 159.93,
    "source": "gvp"
  },
  {
    "name": "Kekurny",
    "lat": 56.4,
    "lng": 158.85,
    "source": "gvp"
  },
  {
    "name": "Kelimutu",
    "lat": -8.77,
    "lng": 121.82,
    "source": "gvp"
  },
  {
    "name": "Kell",
    "lat": 51.65,
    "lng": 157.35,
    "source": "gvp"
  },
  {
    "name": "Keluo Group",
    "lat": 49.37,
    "lng": 125.92,
    "source": "gvp"
  },
  {
    "name": "Kelut",
    "lat": -7.93,
    "lng": 112.308,
    "source": "gvp"
  },
  {
    "name": "Kendang",
    "lat": -7.245,
    "lng": 107.709,
    "source": "gvp"
  },
  {
    "name": "Kerguelen Islands",
    "lat": -49.58,
    "lng": 69.5,
    "source": "gvp"
  },
  {
    "name": "Kerinci",
    "lat": -1.697,
    "lng": 101.264,
    "source": "gvp"
  },
  {
    "name": "Ketoi",
    "lat": 47.35,
    "lng": 152.475,
    "source": "gvp"
  },
  {
    "name": "Khanuy Gol",
    "lat": 48.67,
    "lng": 102.75,
    "source": "gvp"
  },
  {
    "name": "Kharimkotan",
    "lat": 49.12,
    "lng": 154.508,
    "source": "gvp"
  },
  {
    "name": "Khaybar, Harrat",
    "lat": 25,
    "lng": 39.92,
    "source": "gvp"
  },
  {
    "name": "Khodutka",
    "lat": 52.062,
    "lng": 157.711,
    "source": "gvp"
  },
  {
    "name": "Kialagvik",
    "lat": 57.2019,
    "lng": -156.7467,
    "source": "usgs"
  },
  {
    "name": "Kick 'em Jenny",
    "lat": 12.3,
    "lng": -61.64,
    "source": "gvp"
  },
  {
    "name": "Kikai",
    "lat": 30.793,
    "lng": 130.305,
    "source": "gvp"
  },
  {
    "name": "Kikhpinych",
    "lat": 54.489,
    "lng": 160.251,
    "source": "gvp"
  },
  {
    "name": "Kilauea",
    "lat": 19.421,
    "lng": -155.287,
    "source": "usgs"
  },
  {
    "name": "Kirishimayama",
    "lat": 31.934,
    "lng": 130.862,
    "source": "gvp"
  },
  {
    "name": "Kishb, Harrat",
    "lat": 22.8,
    "lng": 41.38,
    "source": "gvp"
  },
  {
    "name": "Kiska",
    "lat": 52.1031,
    "lng": 177.6035,
    "source": "usgs"
  },
  {
    "name": "Kita-Bayonnaise",
    "lat": 32.1,
    "lng": 139.85,
    "source": "gvp"
  },
  {
    "name": "Kita-Ioto",
    "lat": 25.424,
    "lng": 141.284,
    "source": "gvp"
  },
  {
    "name": "Klabat",
    "lat": 1.454,
    "lng": 125.031,
    "source": "gvp"
  },
  {
    "name": "Klyuchevskoy",
    "lat": 56.056,
    "lng": 160.642,
    "source": "gvp"
  },
  {
    "name": "Kolokol Group",
    "lat": 46.042,
    "lng": 150.083,
    "source": "gvp"
  },
  {
    "name": "Kone",
    "lat": 8.788,
    "lng": 39.701,
    "source": "gvp"
  },
  {
    "name": "Koniuji",
    "lat": 52.2189,
    "lng": -175.1323,
    "source": "usgs"
  },
  {
    "name": "Kookooligit Mountains",
    "lat": 63.5991,
    "lng": -170.433,
    "source": "usgs"
  },
  {
    "name": "Korath Range",
    "lat": 5.1,
    "lng": 35.88,
    "source": "gvp"
  },
  {
    "name": "Korosi",
    "lat": 0.77,
    "lng": 36.12,
    "source": "gvp"
  },
  {
    "name": "Korovin",
    "lat": 52.3817,
    "lng": -174.1653,
    "source": "usgs"
  },
  {
    "name": "Koshelev",
    "lat": 51.356,
    "lng": 156.753,
    "source": "gvp"
  },
  {
    "name": "Kostakan",
    "lat": 53.83,
    "lng": 158.05,
    "source": "gvp"
  },
  {
    "name": "Koussi, Emi",
    "lat": 19.8,
    "lng": 18.53,
    "source": "gvp"
  },
  {
    "name": "Kozushima",
    "lat": 34.219,
    "lng": 139.153,
    "source": "gvp"
  },
  {
    "name": "Krafla",
    "lat": 65.715,
    "lng": -16.728,
    "source": "gvp"
  },
  {
    "name": "Krakatau",
    "lat": -6.102,
    "lng": 105.423,
    "source": "gvp"
  },
  {
    "name": "Krasheninnikov",
    "lat": 54.596,
    "lng": 160.27,
    "source": "gvp"
  },
  {
    "name": "Krummel-Garbuna-Welcker",
    "lat": -5.416,
    "lng": 150.027,
    "source": "gvp"
  },
  {
    "name": "Krysuvik",
    "lat": 63.883,
    "lng": -22.083,
    "source": "gvp"
  },
  {
    "name": "Ksudach",
    "lat": 51.844,
    "lng": 157.572,
    "source": "gvp"
  },
  {
    "name": "Kuchinoerabujima",
    "lat": 30.443,
    "lng": 130.217,
    "source": "gvp"
  },
  {
    "name": "Kuchinoshima",
    "lat": 29.968,
    "lng": 129.926,
    "source": "gvp"
  },
  {
    "name": "Kujusan",
    "lat": 33.086,
    "lng": 131.249,
    "source": "gvp"
  },
  {
    "name": "Kukak",
    "lat": 58.4528,
    "lng": -154.3573,
    "source": "usgs"
  },
  {
    "name": "Kula",
    "lat": 38.58,
    "lng": 28.52,
    "source": "gvp"
  },
  {
    "name": "Kunlun Volcanic Group",
    "lat": 35.52,
    "lng": 80.2,
    "source": "gvp"
  },
  {
    "name": "Kupreanof",
    "lat": 56.0126,
    "lng": -159.7912,
    "source": "usgs"
  },
  {
    "name": "Kurikomayama",
    "lat": 38.961,
    "lng": 140.788,
    "source": "gvp"
  },
  {
    "name": "Kuril arc",
    "lat": 46,
    "lng": 151,
    "source": "system"
  },
  {
    "name": "Kurile Lake",
    "lat": 51.45,
    "lng": 157.12,
    "source": "gvp"
  },
  {
    "name": "Kusatsu-Shiranesan",
    "lat": 36.618,
    "lng": 138.528,
    "source": "gvp"
  },
  {
    "name": "Kussharo",
    "lat": 43.615,
    "lng": 144.427,
    "source": "gvp"
  },
  {
    "name": "Kuttara",
    "lat": 42.491,
    "lng": 141.16,
    "source": "gvp"
  },
  {
    "name": "Kutum Volcanic Field",
    "lat": 14.57,
    "lng": 25.85,
    "source": "gvp"
  },
  {
    "name": "Kuwae",
    "lat": -16.829,
    "lng": 168.536,
    "source": "gvp"
  },
  {
    "name": "Kverkfjoll",
    "lat": 64.653,
    "lng": -16.647,
    "source": "gvp"
  },
  {
    "name": "Kyejo",
    "lat": -9.229,
    "lng": 33.792,
    "source": "gvp"
  },
  {
    "name": "La Palma",
    "lat": 28.57,
    "lng": -17.83,
    "source": "gvp"
  },
  {
    "name": "Laguna Caldera",
    "lat": 14.42,
    "lng": 121.27,
    "source": "gvp"
  },
  {
    "name": "Lajas, Las",
    "lat": 12.3,
    "lng": -85.73,
    "source": "gvp"
  },
  {
    "name": "Lamongan",
    "lat": -7.981,
    "lng": 113.341,
    "source": "gvp"
  },
  {
    "name": "Langila",
    "lat": -5.525,
    "lng": 148.42,
    "source": "gvp"
  },
  {
    "name": "Langjokull",
    "lat": 64.85,
    "lng": -19.7,
    "source": "gvp"
  },
  {
    "name": "Lanin",
    "lat": -39.637,
    "lng": -71.502,
    "source": "gvp"
  },
  {
    "name": "Lanzarote",
    "lat": 29.03,
    "lng": -13.63,
    "source": "gvp"
  },
  {
    "name": "Lascar",
    "lat": -23.37,
    "lng": -67.73,
    "source": "gvp"
  },
  {
    "name": "Lassen Volcanic Center",
    "lat": 40.492,
    "lng": -121.508,
    "source": "usgs"
  },
  {
    "name": "Lawu",
    "lat": -7.625,
    "lng": 111.192,
    "source": "gvp"
  },
  {
    "name": "Lengai, Ol Doinyo",
    "lat": -2.764,
    "lng": 35.914,
    "source": "gvp"
  },
  {
    "name": "Leonard Range",
    "lat": 7.382,
    "lng": 126.047,
    "source": "gvp"
  },
  {
    "name": "Leroboleng",
    "lat": -8.365,
    "lng": 122.833,
    "source": "gvp"
  },
  {
    "name": "Leutongey",
    "lat": 57.306,
    "lng": 159.827,
    "source": "gvp"
  },
  {
    "name": "Level Mountain",
    "lat": 58.42,
    "lng": -131.35,
    "source": "gvp"
  },
  {
    "name": "Lewotobi",
    "lat": -8.542,
    "lng": 122.775,
    "source": "gvp"
  },
  {
    "name": "Liamuiga",
    "lat": 17.37,
    "lng": -62.8,
    "source": "gvp"
  },
  {
    "name": "Licancabur",
    "lat": -22.83,
    "lng": -67.88,
    "source": "gvp"
  },
  {
    "name": "Licto",
    "lat": -1.78,
    "lng": -78.613,
    "source": "gvp"
  },
  {
    "name": "Lihir",
    "lat": -3.125,
    "lng": 152.642,
    "source": "gvp"
  },
  {
    "name": "Lipari",
    "lat": 38.49,
    "lng": 14.933,
    "source": "gvp"
  },
  {
    "name": "Little Sitkin",
    "lat": 51.9531,
    "lng": 178.5356,
    "source": "usgs"
  },
  {
    "name": "Ljosufjoll",
    "lat": 64.9,
    "lng": -22.483,
    "source": "gvp"
  },
  {
    "name": "Llaima",
    "lat": -38.692,
    "lng": -71.729,
    "source": "gvp"
  },
  {
    "name": "Lokon-Empung",
    "lat": 1.358,
    "lng": 124.792,
    "source": "gvp"
  },
  {
    "name": "Lolo",
    "lat": -5.466,
    "lng": 150.509,
    "source": "gvp"
  },
  {
    "name": "Lolobau",
    "lat": -4.92,
    "lng": 151.158,
    "source": "gvp"
  },
  {
    "name": "Loloru",
    "lat": -6.52,
    "lng": 155.62,
    "source": "gvp"
  },
  {
    "name": "Long Island",
    "lat": -5.358,
    "lng": 147.12,
    "source": "gvp"
  },
  {
    "name": "Long Valley Caldera",
    "lat": 37.7,
    "lng": -118.87,
    "source": "usgs"
  },
  {
    "name": "Longgang Group",
    "lat": 42.33,
    "lng": 126.5,
    "source": "gvp"
  },
  {
    "name": "Lonquimay",
    "lat": -38.379,
    "lng": -71.586,
    "source": "gvp"
  },
  {
    "name": "Lubukraya",
    "lat": 1.478,
    "lng": 99.209,
    "source": "gvp"
  },
  {
    "name": "Lunayyir, Harrat",
    "lat": 25.17,
    "lng": 37.75,
    "source": "gvp"
  },
  {
    "name": "Ly Son Group",
    "lat": 15.38,
    "lng": 109.12,
    "source": "gvp"
  },
  {
    "name": "Macauley",
    "lat": -30.21,
    "lng": -178.475,
    "source": "gvp"
  },
  {
    "name": "Maclaren River volcanic field",
    "lat": 63.1369,
    "lng": -146.32,
    "source": "usgs"
  },
  {
    "name": "Madeira",
    "lat": 32.73,
    "lng": -16.97,
    "source": "gvp"
  },
  {
    "name": "Mageik",
    "lat": 58.1946,
    "lng": -155.2544,
    "source": "usgs"
  },
  {
    "name": "Mahagnao",
    "lat": 10.882,
    "lng": 124.888,
    "source": "gvp"
  },
  {
    "name": "Mahawu",
    "lat": 1.352,
    "lng": 124.865,
    "source": "gvp"
  },
  {
    "name": "Maipo",
    "lat": -34.164,
    "lng": -69.832,
    "source": "gvp"
  },
  {
    "name": "Makushin",
    "lat": 53.8899,
    "lng": -166.925,
    "source": "usgs"
  },
  {
    "name": "Maly Semyachik",
    "lat": 54.135,
    "lng": 159.674,
    "source": "gvp"
  },
  {
    "name": "Mammoth Mountain",
    "lat": 37.631,
    "lng": -119.032,
    "source": "usgs"
  },
  {
    "name": "Managlase Plateau",
    "lat": -9.08,
    "lng": 148.33,
    "source": "gvp"
  },
  {
    "name": "Manam",
    "lat": -4.08,
    "lng": 145.037,
    "source": "gvp"
  },
  {
    "name": "Manda Hararo",
    "lat": 12.17,
    "lng": 40.82,
    "source": "gvp"
  },
  {
    "name": "Manda-Inakir",
    "lat": 12.38,
    "lng": 42.2,
    "source": "gvp"
  },
  {
    "name": "Mandalagan",
    "lat": 10.65,
    "lng": 123.25,
    "source": "gvp"
  },
  {
    "name": "Manzaz Volcanic Field",
    "lat": 23.92,
    "lng": 5.83,
    "source": "gvp"
  },
  {
    "name": "Marapi",
    "lat": -0.38,
    "lng": 100.474,
    "source": "gvp"
  },
  {
    "name": "Mariñaqui, Laguna",
    "lat": -38.255,
    "lng": -71.167,
    "source": "gvp"
  },
  {
    "name": "Marion Island",
    "lat": -46.9,
    "lng": 37.75,
    "source": "gvp"
  },
  {
    "name": "Mariveles",
    "lat": 14.527,
    "lng": 120.482,
    "source": "gvp"
  },
  {
    "name": "Markagunt Plateau volcanic field",
    "lat": 37.58,
    "lng": -112.67,
    "source": "usgs"
  },
  {
    "name": "Maroa",
    "lat": -38.42,
    "lng": 176.08,
    "source": "gvp"
  },
  {
    "name": "Marra, Jebel",
    "lat": 12.95,
    "lng": 24.27,
    "source": "gvp"
  },
  {
    "name": "Marsabit",
    "lat": 2.32,
    "lng": 37.97,
    "source": "gvp"
  },
  {
    "name": "Martin",
    "lat": 58.1692,
    "lng": -155.3566,
    "source": "usgs"
  },
  {
    "name": "Maruyama",
    "lat": 43.418,
    "lng": 143.031,
    "source": "gvp"
  },
  {
    "name": "Masaya",
    "lat": 11.985,
    "lng": -86.165,
    "source": "gvp"
  },
  {
    "name": "Mascota Volcanic Field",
    "lat": 20.62,
    "lng": -104.83,
    "source": "gvp"
  },
  {
    "name": "Mashu",
    "lat": 43.572,
    "lng": 144.561,
    "source": "gvp"
  },
  {
    "name": "Matthew Island",
    "lat": -22.33,
    "lng": 171.32,
    "source": "gvp"
  },
  {
    "name": "Matutum",
    "lat": 6.37,
    "lng": 125.07,
    "source": "gvp"
  },
  {
    "name": "Maug Islands",
    "lat": 20.02,
    "lng": 145.22,
    "source": "usgs"
  },
  {
    "name": "Maule, Laguna del",
    "lat": -36.058,
    "lng": -70.492,
    "source": "gvp"
  },
  {
    "name": "Mauna Kea",
    "lat": 19.82,
    "lng": -155.47,
    "source": "usgs"
  },
  {
    "name": "Mauna Loa",
    "lat": 19.475,
    "lng": -155.608,
    "source": "usgs"
  },
  {
    "name": "Mayor Island",
    "lat": -37.28,
    "lng": 176.25,
    "source": "gvp"
  },
  {
    "name": "Meager",
    "lat": 50.63,
    "lng": -123.5,
    "source": "gvp"
  },
  {
    "name": "Medicine Lake volcano",
    "lat": 41.611,
    "lng": -121.554,
    "source": "usgs"
  },
  {
    "name": "Mega Basalt Field",
    "lat": 4.063,
    "lng": 37.488,
    "source": "gvp"
  },
  {
    "name": "Megata",
    "lat": 39.95,
    "lng": 139.73,
    "source": "gvp"
  },
  {
    "name": "Meidob Volcanic Field",
    "lat": 15.32,
    "lng": 26.47,
    "source": "gvp"
  },
  {
    "name": "Melbourne",
    "lat": -74.35,
    "lng": 164.7,
    "source": "gvp"
  },
  {
    "name": "Merapi",
    "lat": -7.54,
    "lng": 110.446,
    "source": "gvp"
  },
  {
    "name": "Merbabu",
    "lat": -7.454,
    "lng": 110.44,
    "source": "gvp"
  },
  {
    "name": "Meru",
    "lat": -3.25,
    "lng": 36.75,
    "source": "gvp"
  },
  {
    "name": "Methana",
    "lat": 37.615,
    "lng": 23.336,
    "source": "gvp"
  },
  {
    "name": "Mexico Trans-Mexican Volcanic Belt",
    "lat": 19,
    "lng": -99,
    "source": "system"
  },
  {
    "name": "Michinmahuida",
    "lat": -42.799,
    "lng": -72.445,
    "source": "gvp"
  },
  {
    "name": "Michoacan-Guanajuato",
    "lat": 19.85,
    "lng": -101.75,
    "source": "gvp"
  },
  {
    "name": "Mid-Atlantic Ridge (Iceland sector)",
    "lat": 64.1,
    "lng": -21.9,
    "source": "system"
  },
  {
    "name": "Midagahara",
    "lat": 36.571,
    "lng": 137.59,
    "source": "gvp"
  },
  {
    "name": "Mikurajima",
    "lat": 33.874,
    "lng": 139.602,
    "source": "gvp"
  },
  {
    "name": "Milbanke Sound Group",
    "lat": 52.5,
    "lng": -128.73,
    "source": "gvp"
  },
  {
    "name": "Milna",
    "lat": 46.815,
    "lng": 151.786,
    "source": "gvp"
  },
  {
    "name": "Milos",
    "lat": 36.699,
    "lng": 24.439,
    "source": "gvp"
  },
  {
    "name": "Minami-Hiyoshi",
    "lat": 23.5,
    "lng": 141.935,
    "source": "gvp"
  },
  {
    "name": "Miravalles",
    "lat": 10.748,
    "lng": -85.153,
    "source": "gvp"
  },
  {
    "name": "Miyakejima",
    "lat": 34.094,
    "lng": 139.526,
    "source": "gvp"
  },
  {
    "name": "Mocho-Choshuenco",
    "lat": -39.927,
    "lng": -72.027,
    "source": "gvp"
  },
  {
    "name": "Moffett",
    "lat": 51.937,
    "lng": -176.741,
    "source": "usgs"
  },
  {
    "name": "Mojanda",
    "lat": 0.13,
    "lng": -78.27,
    "source": "gvp"
  },
  {
    "name": "Mombacho",
    "lat": 11.826,
    "lng": -85.968,
    "source": "gvp"
  },
  {
    "name": "Momotombo",
    "lat": 12.423,
    "lng": -86.539,
    "source": "gvp"
  },
  {
    "name": "Mono Lake Volcanic Field",
    "lat": 38,
    "lng": -119.03,
    "source": "usgs"
  },
  {
    "name": "Mono-Inyo Craters",
    "lat": 37.82,
    "lng": -119.02,
    "source": "usgs"
  },
  {
    "name": "Montagu Island",
    "lat": -58.445,
    "lng": -26.374,
    "source": "gvp"
  },
  {
    "name": "Morning",
    "lat": -78.5,
    "lng": 163.53,
    "source": "gvp"
  },
  {
    "name": "Motlav",
    "lat": -13.67,
    "lng": 167.67,
    "source": "gvp"
  },
  {
    "name": "Mount Adams",
    "lat": 46.206,
    "lng": -121.49,
    "source": "usgs"
  },
  {
    "name": "Mount Bachelor",
    "lat": 43.979,
    "lng": -121.688,
    "source": "usgs"
  },
  {
    "name": "Mount Baker",
    "lat": 48.777,
    "lng": -121.813,
    "source": "usgs"
  },
  {
    "name": "Mount Churchill",
    "lat": 61.4187,
    "lng": -141.7152,
    "source": "usgs"
  },
  {
    "name": "Mount Hood",
    "lat": 45.374,
    "lng": -121.695,
    "source": "usgs"
  },
  {
    "name": "Mount Jefferson",
    "lat": 44.674,
    "lng": -121.8,
    "source": "usgs"
  },
  {
    "name": "Mount Rainier",
    "lat": 46.853,
    "lng": -121.76,
    "source": "usgs"
  },
  {
    "name": "Mount Recheshnoi",
    "lat": 53.1536,
    "lng": -168.5382,
    "source": "usgs"
  },
  {
    "name": "Mount Shasta",
    "lat": 41.409,
    "lng": -122.193,
    "source": "usgs"
  },
  {
    "name": "Mount St. Helens",
    "lat": 46.2,
    "lng": -122.18,
    "source": "usgs"
  },
  {
    "name": "Moyorodake [Medvezhia]",
    "lat": 45.389,
    "lng": 148.838,
    "source": "gvp"
  },
  {
    "name": "Moyuta",
    "lat": 14.03,
    "lng": -90.1,
    "source": "gvp"
  },
  {
    "name": "Muhavura",
    "lat": -1.383,
    "lng": 29.678,
    "source": "gvp"
  },
  {
    "name": "Mundua",
    "lat": -4.624,
    "lng": 149.339,
    "source": "gvp"
  },
  {
    "name": "Muria",
    "lat": -6.62,
    "lng": 110.88,
    "source": "gvp"
  },
  {
    "name": "Mutnovsky",
    "lat": 52.449,
    "lng": 158.196,
    "source": "gvp"
  },
  {
    "name": "Myojinsho",
    "lat": 31.888,
    "lng": 139.918,
    "source": "gvp"
  },
  {
    "name": "Myokosan",
    "lat": 36.891,
    "lng": 138.114,
    "source": "gvp"
  },
  {
    "name": "Nabukelevu",
    "lat": -19.12,
    "lng": 177.98,
    "source": "gvp"
  },
  {
    "name": "Nakanoshima",
    "lat": 29.859,
    "lng": 129.857,
    "source": "gvp"
  },
  {
    "name": "Namarunu",
    "lat": 1.98,
    "lng": 36.43,
    "source": "gvp"
  },
  {
    "name": "Nantaisan",
    "lat": 36.765,
    "lng": 139.491,
    "source": "gvp"
  },
  {
    "name": "Naolinco Volcanic Field",
    "lat": 19.67,
    "lng": -96.75,
    "source": "gvp"
  },
  {
    "name": "Naruko",
    "lat": 38.729,
    "lng": 140.734,
    "source": "gvp"
  },
  {
    "name": "Nasudake",
    "lat": 37.125,
    "lng": 139.963,
    "source": "gvp"
  },
  {
    "name": "Natib",
    "lat": 14.72,
    "lng": 120.4,
    "source": "gvp"
  },
  {
    "name": "Negra, Sierra",
    "lat": -0.83,
    "lng": -91.17,
    "source": "gvp"
  },
  {
    "name": "Negro, Cerro",
    "lat": 12.506,
    "lng": -86.702,
    "source": "gvp"
  },
  {
    "name": "Nejapa-Miraflores",
    "lat": 12.12,
    "lng": -86.32,
    "source": "gvp"
  },
  {
    "name": "Nemrut Dagi",
    "lat": 38.654,
    "lng": 42.229,
    "source": "gvp"
  },
  {
    "name": "Nevis Peak",
    "lat": 17.15,
    "lng": -62.58,
    "source": "gvp"
  },
  {
    "name": "New Zealand Taupo volcanic zone",
    "lat": -38.7,
    "lng": 176.1,
    "source": "system"
  },
  {
    "name": "Newberry",
    "lat": 43.722,
    "lng": -121.229,
    "source": "usgs"
  },
  {
    "name": "Newer Volcanics Province",
    "lat": -37.77,
    "lng": 142.5,
    "source": "gvp"
  },
  {
    "name": "Ngozi",
    "lat": -8.989,
    "lng": 33.554,
    "source": "gvp"
  },
  {
    "name": "Niigata-Yakeyama",
    "lat": 36.921,
    "lng": 138.036,
    "source": "gvp"
  },
  {
    "name": "Niijima",
    "lat": 34.397,
    "lng": 139.27,
    "source": "gvp"
  },
  {
    "name": "Nikko-Shiranesan",
    "lat": 36.799,
    "lng": 139.376,
    "source": "gvp"
  },
  {
    "name": "Niseko",
    "lat": 42.875,
    "lng": 140.659,
    "source": "gvp"
  },
  {
    "name": "Nishihitokappuyama [Bogatyr Ridge]",
    "lat": 44.833,
    "lng": 147.342,
    "source": "gvp"
  },
  {
    "name": "Nisyros",
    "lat": 36.586,
    "lng": 27.16,
    "source": "gvp"
  },
  {
    "name": "Niuafo'ou",
    "lat": -15.6,
    "lng": -175.63,
    "source": "gvp"
  },
  {
    "name": "Norikuradake",
    "lat": 36.106,
    "lng": 137.554,
    "source": "gvp"
  },
  {
    "name": "North Vate",
    "lat": -17.47,
    "lng": 168.353,
    "source": "gvp"
  },
  {
    "name": "Northern EPR at 9.8°N",
    "lat": 9.83,
    "lng": -104.3,
    "source": "gvp"
  },
  {
    "name": "Novarupta",
    "lat": 58.2654,
    "lng": -155.1591,
    "source": "usgs"
  },
  {
    "name": "Numazawa",
    "lat": 37.444,
    "lng": 139.566,
    "source": "gvp"
  },
  {
    "name": "Nunivak Island",
    "lat": 60.099,
    "lng": -166.496,
    "source": "usgs"
  },
  {
    "name": "NW Eifuku",
    "lat": 21.485,
    "lng": 144.043,
    "source": "gvp"
  },
  {
    "name": "NW Rota-1",
    "lat": 14.601,
    "lng": 144.775,
    "source": "gvp"
  },
  {
    "name": "Nyambeni Hills",
    "lat": 0.23,
    "lng": 37.87,
    "source": "gvp"
  },
  {
    "name": "Nyamuragira",
    "lat": -1.408,
    "lng": 29.2,
    "source": "gvp"
  },
  {
    "name": "Nyiragongo",
    "lat": -1.52,
    "lng": 29.25,
    "source": "gvp"
  },
  {
    "name": "Nylgimelkin",
    "lat": 57.97,
    "lng": 160.65,
    "source": "gvp"
  },
  {
    "name": "O'a Caldera",
    "lat": 7.47,
    "lng": 38.58,
    "source": "gvp"
  },
  {
    "name": "Ofu-Olosega",
    "lat": -14.175,
    "lng": -169.618,
    "source": "usgs"
  },
  {
    "name": "Ojos del Salado, Nevados",
    "lat": -27.109,
    "lng": -68.541,
    "source": "gvp"
  },
  {
    "name": "Okataina",
    "lat": -38.12,
    "lng": 176.5,
    "source": "gvp"
  },
  {
    "name": "Oki-Dogo",
    "lat": 36.176,
    "lng": 133.334,
    "source": "gvp"
  },
  {
    "name": "Okmok",
    "lat": 53.397,
    "lng": -168.166,
    "source": "usgs"
  },
  {
    "name": "Oku Volcanic Field",
    "lat": 6.25,
    "lng": 10.5,
    "source": "gvp"
  },
  {
    "name": "Ol Kokwe",
    "lat": 0.62,
    "lng": 36.075,
    "source": "gvp"
  },
  {
    "name": "Olca-Paruma",
    "lat": -20.939,
    "lng": -68.413,
    "source": "gvp"
  },
  {
    "name": "Olkaria",
    "lat": -0.904,
    "lng": 36.292,
    "source": "gvp"
  },
  {
    "name": "Olkoviy Volcanic Group",
    "lat": 52.02,
    "lng": 157.53,
    "source": "gvp"
  },
  {
    "name": "Olot Volcanic Field",
    "lat": 42.17,
    "lng": 2.53,
    "source": "gvp"
  },
  {
    "name": "Omanago Group",
    "lat": 36.795,
    "lng": 139.507,
    "source": "gvp"
  },
  {
    "name": "Ontakesan",
    "lat": 35.893,
    "lng": 137.48,
    "source": "gvp"
  },
  {
    "name": "Opala",
    "lat": 52.543,
    "lng": 157.339,
    "source": "gvp"
  },
  {
    "name": "Oraefajokull",
    "lat": 64.05,
    "lng": -16.633,
    "source": "gvp"
  },
  {
    "name": "Orizaba, Pico de",
    "lat": 19.03,
    "lng": -97.27,
    "source": "gvp"
  },
  {
    "name": "Orosi",
    "lat": 10.98,
    "lng": -85.473,
    "source": "gvp"
  },
  {
    "name": "Oshima-Oshima",
    "lat": 41.51,
    "lng": 139.367,
    "source": "gvp"
  },
  {
    "name": "Osorezan",
    "lat": 41.279,
    "lng": 141.12,
    "source": "gvp"
  },
  {
    "name": "Osorno",
    "lat": -41.105,
    "lng": -72.496,
    "source": "gvp"
  },
  {
    "name": "Ostanets",
    "lat": 52.146,
    "lng": 157.322,
    "source": "gvp"
  },
  {
    "name": "Otdelniy",
    "lat": 52.221,
    "lng": 157.435,
    "source": "gvp"
  },
  {
    "name": "Pacaya",
    "lat": 14.382,
    "lng": -90.601,
    "source": "gvp"
  },
  {
    "name": "Pagan",
    "lat": 18.13,
    "lng": 145.8,
    "source": "usgs"
  },
  {
    "name": "Paka",
    "lat": 0.92,
    "lng": 36.18,
    "source": "gvp"
  },
  {
    "name": "Pali-Aike Volcanic Field",
    "lat": -52.082,
    "lng": -69.698,
    "source": "gvp"
  },
  {
    "name": "Palomo",
    "lat": -34.608,
    "lng": -70.295,
    "source": "gvp"
  },
  {
    "name": "Paluweh",
    "lat": -8.32,
    "lng": 121.708,
    "source": "gvp"
  },
  {
    "name": "Pampa Luxsar",
    "lat": -20.85,
    "lng": -68.2,
    "source": "gvp"
  },
  {
    "name": "Panarea",
    "lat": 38.638,
    "lng": 15.064,
    "source": "gvp"
  },
  {
    "name": "Pantelleria",
    "lat": 36.77,
    "lng": 12.02,
    "source": "gvp"
  },
  {
    "name": "Papandayan",
    "lat": -7.32,
    "lng": 107.73,
    "source": "gvp"
  },
  {
    "name": "Papayo",
    "lat": 19.308,
    "lng": -98.7,
    "source": "gvp"
  },
  {
    "name": "Papua New Guinea arc",
    "lat": -5.5,
    "lng": 147,
    "source": "system"
  },
  {
    "name": "Parinacota",
    "lat": -18.166,
    "lng": -69.142,
    "source": "gvp"
  },
  {
    "name": "Patuha",
    "lat": -7.162,
    "lng": 107.4,
    "source": "gvp"
  },
  {
    "name": "Pavlof",
    "lat": 55.4173,
    "lng": -161.8937,
    "source": "usgs"
  },
  {
    "name": "Pavlof Sister",
    "lat": 55.4569,
    "lng": -161.8544,
    "source": "usgs"
  },
  {
    "name": "Payun Matru",
    "lat": -36.422,
    "lng": -69.241,
    "source": "gvp"
  },
  {
    "name": "Pelee",
    "lat": 14.809,
    "lng": -61.165,
    "source": "gvp"
  },
  {
    "name": "Penanggungan",
    "lat": -7.616,
    "lng": 112.62,
    "source": "gvp"
  },
  {
    "name": "Penguin Island",
    "lat": -62.1,
    "lng": -57.93,
    "source": "gvp"
  },
  {
    "name": "Perbakti-Gagak",
    "lat": -6.75,
    "lng": 106.7,
    "source": "gvp"
  },
  {
    "name": "Peuet Sague",
    "lat": 4.903,
    "lng": 96.289,
    "source": "gvp"
  },
  {
    "name": "Philippines arc",
    "lat": 14.6,
    "lng": 121,
    "source": "system"
  },
  {
    "name": "Pico",
    "lat": 38.47,
    "lng": -28.4,
    "source": "gvp"
  },
  {
    "name": "Picos Volcanic System",
    "lat": 37.78,
    "lng": -25.67,
    "source": "gvp"
  },
  {
    "name": "Pilas, Las",
    "lat": 12.495,
    "lng": -86.688,
    "source": "gvp"
  },
  {
    "name": "Pinacate",
    "lat": 31.772,
    "lng": -113.498,
    "source": "gvp"
  },
  {
    "name": "Pinatubo",
    "lat": 15.13,
    "lng": 120.35,
    "source": "gvp"
  },
  {
    "name": "Planchon-Peteroa",
    "lat": -35.223,
    "lng": -70.568,
    "source": "gvp"
  },
  {
    "name": "Plat Pays, Morne",
    "lat": 15.255,
    "lng": -61.341,
    "source": "gvp"
  },
  {
    "name": "Platanar",
    "lat": 10.3,
    "lng": -84.366,
    "source": "gvp"
  },
  {
    "name": "Pleiades, The",
    "lat": -72.67,
    "lng": 165.5,
    "source": "gvp"
  },
  {
    "name": "Poas",
    "lat": 10.2,
    "lng": -84.233,
    "source": "gvp"
  },
  {
    "name": "Pocdol Mountains",
    "lat": 13.05,
    "lng": 123.958,
    "source": "gvp"
  },
  {
    "name": "Pogranychny",
    "lat": 56.85,
    "lng": 159.8,
    "source": "gvp"
  },
  {
    "name": "Popa",
    "lat": 20.92,
    "lng": 95.25,
    "source": "gvp"
  },
  {
    "name": "Popocatepetl",
    "lat": 19.023,
    "lng": -98.622,
    "source": "gvp"
  },
  {
    "name": "Porak",
    "lat": 40.028,
    "lng": 45.74,
    "source": "gvp"
  },
  {
    "name": "Possession, Ile de la",
    "lat": -46.42,
    "lng": 51.75,
    "source": "gvp"
  },
  {
    "name": "Prestahnukur",
    "lat": 64.583,
    "lng": -20.666,
    "source": "gvp"
  },
  {
    "name": "Prince Edward Island",
    "lat": -46.63,
    "lng": 37.95,
    "source": "gvp"
  },
  {
    "name": "Protector Seamounts",
    "lat": -55.912,
    "lng": -28.167,
    "source": "gvp"
  },
  {
    "name": "Pular",
    "lat": -24.188,
    "lng": -68.054,
    "source": "gvp"
  },
  {
    "name": "Pululahua",
    "lat": 0.038,
    "lng": -78.463,
    "source": "gvp"
  },
  {
    "name": "Puntiagudo-Cordon Cenizos",
    "lat": -40.969,
    "lng": -72.264,
    "source": "gvp"
  },
  {
    "name": "Purace",
    "lat": 2.32,
    "lng": -76.4,
    "source": "gvp"
  },
  {
    "name": "Purico Complex",
    "lat": -23,
    "lng": -67.75,
    "source": "gvp"
  },
  {
    "name": "Puyehue-Cordon Caulle",
    "lat": -40.59,
    "lng": -72.117,
    "source": "gvp"
  },
  {
    "name": "Qualibou",
    "lat": 13.83,
    "lng": -61.05,
    "source": "gvp"
  },
  {
    "name": "Quetrupillan",
    "lat": -39.496,
    "lng": -71.722,
    "source": "gvp"
  },
  {
    "name": "Quill, The",
    "lat": 17.478,
    "lng": -62.96,
    "source": "gvp"
  },
  {
    "name": "Quimsachata",
    "lat": -14.176,
    "lng": -71.351,
    "source": "gvp"
  },
  {
    "name": "Rabaul",
    "lat": -4.271,
    "lng": 152.203,
    "source": "gvp"
  },
  {
    "name": "Rahat, Harrat",
    "lat": 23.08,
    "lng": 39.78,
    "source": "gvp"
  },
  {
    "name": "Ranakah",
    "lat": -8.62,
    "lng": 120.52,
    "source": "gvp"
  },
  {
    "name": "Ranau",
    "lat": -4.871,
    "lng": 103.925,
    "source": "gvp"
  },
  {
    "name": "Raoul Island",
    "lat": -29.27,
    "lng": -177.92,
    "source": "gvp"
  },
  {
    "name": "Rasshua",
    "lat": 47.77,
    "lng": 153.02,
    "source": "gvp"
  },
  {
    "name": "Raung",
    "lat": -8.119,
    "lng": 114.056,
    "source": "gvp"
  },
  {
    "name": "Raususan [Mendeleev]",
    "lat": 43.979,
    "lng": 145.733,
    "source": "gvp"
  },
  {
    "name": "Reclus",
    "lat": -50.964,
    "lng": -73.585,
    "source": "gvp"
  },
  {
    "name": "Red Hill-Quemado volcanic field",
    "lat": 34.25,
    "lng": -108.83,
    "source": "usgs"
  },
  {
    "name": "Redoubt",
    "lat": 60.4852,
    "lng": -152.7438,
    "source": "usgs"
  },
  {
    "name": "Reporoa",
    "lat": -38.42,
    "lng": 176.33,
    "source": "gvp"
  },
  {
    "name": "Réunion hotspot",
    "lat": -21.2,
    "lng": 55.7,
    "source": "system"
  },
  {
    "name": "Reventador",
    "lat": -0.077,
    "lng": -77.656,
    "source": "gvp"
  },
  {
    "name": "Reykjanes",
    "lat": 63.85,
    "lng": -22.566,
    "source": "gvp"
  },
  {
    "name": "Rincon de la Vieja",
    "lat": 10.83,
    "lng": -85.324,
    "source": "gvp"
  },
  {
    "name": "Rinjani",
    "lat": -8.42,
    "lng": 116.47,
    "source": "gvp"
  },
  {
    "name": "Rota",
    "lat": 12.55,
    "lng": -86.75,
    "source": "gvp"
  },
  {
    "name": "Roundtop",
    "lat": 54.7992,
    "lng": -163.5914,
    "source": "usgs"
  },
  {
    "name": "Royal Society Range",
    "lat": -78.25,
    "lng": 163.33,
    "source": "gvp"
  },
  {
    "name": "Ruapehu",
    "lat": -39.28,
    "lng": 175.57,
    "source": "gvp"
  },
  {
    "name": "Ruby",
    "lat": 15.62,
    "lng": 145.57,
    "source": "usgs"
  },
  {
    "name": "Rucharuyama [Golets-Tornyi Group]",
    "lat": 45.25,
    "lng": 148.35,
    "source": "gvp"
  },
  {
    "name": "Ruiz, Nevado del",
    "lat": 4.892,
    "lng": -75.324,
    "source": "gvp"
  },
  {
    "name": "Rumble III",
    "lat": -35.745,
    "lng": 178.478,
    "source": "gvp"
  },
  {
    "name": "Rungwe",
    "lat": -9.135,
    "lng": 33.668,
    "source": "gvp"
  },
  {
    "name": "Ruruidake [Smirnov]",
    "lat": 44.454,
    "lng": 146.139,
    "source": "gvp"
  },
  {
    "name": "Ryukyu arc",
    "lat": 27,
    "lng": 128.5,
    "source": "system"
  },
  {
    "name": "Saba",
    "lat": 17.63,
    "lng": -63.23,
    "source": "gvp"
  },
  {
    "name": "Sabancaya",
    "lat": -15.787,
    "lng": -71.857,
    "source": "gvp"
  },
  {
    "name": "Sairecabur",
    "lat": -22.72,
    "lng": -67.892,
    "source": "gvp"
  },
  {
    "name": "Salak",
    "lat": -6.72,
    "lng": 106.73,
    "source": "gvp"
  },
  {
    "name": "Salton Buttes",
    "lat": 33.2,
    "lng": -115.62,
    "source": "usgs"
  },
  {
    "name": "Samsari Volcanic Center",
    "lat": 41.542,
    "lng": 43.7,
    "source": "gvp"
  },
  {
    "name": "San Borja Volcanic Field",
    "lat": 28.5,
    "lng": -113.75,
    "source": "gvp"
  },
  {
    "name": "San Cristobal",
    "lat": 12.702,
    "lng": -87.004,
    "source": "gvp"
  },
  {
    "name": "San Cristobal",
    "lat": -0.88,
    "lng": -89.5,
    "source": "gvp"
  },
  {
    "name": "San Diego",
    "lat": 14.27,
    "lng": -89.48,
    "source": "gvp"
  },
  {
    "name": "San Francisco Volcanic Field",
    "lat": 35.37,
    "lng": -111.5,
    "source": "usgs"
  },
  {
    "name": "San Jose",
    "lat": -33.789,
    "lng": -69.895,
    "source": "gvp"
  },
  {
    "name": "San Luis, Isla",
    "lat": 29.97,
    "lng": -114.4,
    "source": "gvp"
  },
  {
    "name": "San Martin",
    "lat": 18.57,
    "lng": -95.2,
    "source": "gvp"
  },
  {
    "name": "San Pablo Volcanic Field",
    "lat": 14.12,
    "lng": 121.3,
    "source": "gvp"
  },
  {
    "name": "San Pedro-Pellado",
    "lat": -35.989,
    "lng": -70.849,
    "source": "gvp"
  },
  {
    "name": "San Pedro-San Pablo",
    "lat": -21.888,
    "lng": -68.391,
    "source": "gvp"
  },
  {
    "name": "San Quintin Volcanic Field",
    "lat": 30.468,
    "lng": -115.996,
    "source": "gvp"
  },
  {
    "name": "San Salvador",
    "lat": 13.734,
    "lng": -89.294,
    "source": "gvp"
  },
  {
    "name": "San Vicente",
    "lat": 13.595,
    "lng": -88.837,
    "source": "gvp"
  },
  {
    "name": "Sanbesan",
    "lat": 35.141,
    "lng": 132.622,
    "source": "gvp"
  },
  {
    "name": "Sand Mountain volcanic field",
    "lat": 44.38,
    "lng": -121.93,
    "source": "usgs"
  },
  {
    "name": "Sanford",
    "lat": 62.2133,
    "lng": -144.1295,
    "source": "usgs"
  },
  {
    "name": "Sangay",
    "lat": -2.005,
    "lng": -78.341,
    "source": "gvp"
  },
  {
    "name": "Sangeang Api",
    "lat": -8.2,
    "lng": 119.07,
    "source": "gvp"
  },
  {
    "name": "Sano, Wai",
    "lat": -8.724,
    "lng": 119.986,
    "source": "gvp"
  },
  {
    "name": "Santa Ana",
    "lat": 13.853,
    "lng": -89.63,
    "source": "gvp"
  },
  {
    "name": "Santa Cruz",
    "lat": -0.62,
    "lng": -90.33,
    "source": "gvp"
  },
  {
    "name": "Santa Isabel",
    "lat": 4.818,
    "lng": -75.365,
    "source": "gvp"
  },
  {
    "name": "Santa Maria",
    "lat": 14.757,
    "lng": -91.552,
    "source": "gvp"
  },
  {
    "name": "Santiago",
    "lat": -0.22,
    "lng": -90.77,
    "source": "gvp"
  },
  {
    "name": "Santiago, Cerro",
    "lat": 14.33,
    "lng": -89.87,
    "source": "gvp"
  },
  {
    "name": "Santorini",
    "lat": 36.404,
    "lng": 25.396,
    "source": "gvp"
  },
  {
    "name": "Sarigan",
    "lat": 16.708,
    "lng": 145.78,
    "source": "usgs"
  },
  {
    "name": "Sarik-Gajah",
    "lat": 0.074,
    "lng": 100.189,
    "source": "gvp"
  },
  {
    "name": "Sarychev Peak",
    "lat": 48.092,
    "lng": 153.2,
    "source": "gvp"
  },
  {
    "name": "Sashiusudake [Baransky]",
    "lat": 45.1,
    "lng": 148.019,
    "source": "gvp"
  },
  {
    "name": "Saunders",
    "lat": -57.8,
    "lng": -26.483,
    "source": "gvp"
  },
  {
    "name": "Savai'i",
    "lat": -13.612,
    "lng": -172.525,
    "source": "gvp"
  },
  {
    "name": "Savo",
    "lat": -9.13,
    "lng": 159.82,
    "source": "gvp"
  },
  {
    "name": "Sawad, Harra Es-",
    "lat": 13.58,
    "lng": 46.12,
    "source": "gvp"
  },
  {
    "name": "Seal Nunataks Group",
    "lat": -65.03,
    "lng": -60.05,
    "source": "gvp"
  },
  {
    "name": "Seguam",
    "lat": 52.316,
    "lng": -172.51,
    "source": "usgs"
  },
  {
    "name": "Segula",
    "lat": 52.0138,
    "lng": 178.134,
    "source": "usgs"
  },
  {
    "name": "Sekincau Belirang",
    "lat": -5.107,
    "lng": 104.317,
    "source": "gvp"
  },
  {
    "name": "Semeru",
    "lat": -8.108,
    "lng": 112.922,
    "source": "gvp"
  },
  {
    "name": "Semisopochnoi",
    "lat": 51.9288,
    "lng": 179.5977,
    "source": "usgs"
  },
  {
    "name": "Serdan-Oriental",
    "lat": 19.27,
    "lng": -97.47,
    "source": "gvp"
  },
  {
    "name": "Sergief",
    "lat": 52.0533,
    "lng": -174.9521,
    "source": "usgs"
  },
  {
    "name": "Serua",
    "lat": -6.312,
    "lng": 130.017,
    "source": "gvp"
  },
  {
    "name": "Sete Cidades",
    "lat": 37.87,
    "lng": -25.78,
    "source": "gvp"
  },
  {
    "name": "Seulawah Agam",
    "lat": 5.448,
    "lng": 95.658,
    "source": "gvp"
  },
  {
    "name": "Severny",
    "lat": 58.28,
    "lng": 160.87,
    "source": "gvp"
  },
  {
    "name": "Sheveluch",
    "lat": 56.653,
    "lng": 161.36,
    "source": "gvp"
  },
  {
    "name": "Shiga",
    "lat": 36.688,
    "lng": 138.519,
    "source": "gvp"
  },
  {
    "name": "Shikotsu",
    "lat": 42.688,
    "lng": 141.38,
    "source": "gvp"
  },
  {
    "name": "Shiretoko-Iozan",
    "lat": 44.133,
    "lng": 145.161,
    "source": "gvp"
  },
  {
    "name": "Shishaldin",
    "lat": 54.7554,
    "lng": -163.9711,
    "source": "usgs"
  },
  {
    "name": "Sibualbuali",
    "lat": 1.556,
    "lng": 99.255,
    "source": "gvp"
  },
  {
    "name": "Silali",
    "lat": 1.15,
    "lng": 36.23,
    "source": "gvp"
  },
  {
    "name": "Silay",
    "lat": 10.77,
    "lng": 123.23,
    "source": "gvp"
  },
  {
    "name": "Silverthrone",
    "lat": 51.43,
    "lng": -126.3,
    "source": "gvp"
  },
  {
    "name": "Simbo",
    "lat": -8.292,
    "lng": 156.52,
    "source": "gvp"
  },
  {
    "name": "Sinabung",
    "lat": 3.17,
    "lng": 98.392,
    "source": "gvp"
  },
  {
    "name": "Singkut",
    "lat": 3.248,
    "lng": 98.501,
    "source": "gvp"
  },
  {
    "name": "Singuil, Cerro",
    "lat": 14.054,
    "lng": -89.631,
    "source": "gvp"
  },
  {
    "name": "Siple",
    "lat": -73.43,
    "lng": -126.67,
    "source": "gvp"
  },
  {
    "name": "Sirung",
    "lat": -8.508,
    "lng": 124.13,
    "source": "gvp"
  },
  {
    "name": "Slamet",
    "lat": -7.242,
    "lng": 109.208,
    "source": "gvp"
  },
  {
    "name": "Snezhniy",
    "lat": 58.02,
    "lng": 160.8,
    "source": "gvp"
  },
  {
    "name": "Snowy Mountain",
    "lat": 58.3336,
    "lng": -154.6859,
    "source": "usgs"
  },
  {
    "name": "Socorro",
    "lat": 18.78,
    "lng": -110.95,
    "source": "gvp"
  },
  {
    "name": "Soda Lakes",
    "lat": 39.5176,
    "lng": -118.8807,
    "source": "usgs"
  },
  {
    "name": "Sollipulli",
    "lat": -38.97,
    "lng": -71.52,
    "source": "gvp"
  },
  {
    "name": "Soputan",
    "lat": 1.112,
    "lng": 124.737,
    "source": "gvp"
  },
  {
    "name": "Sorikmarapi",
    "lat": 0.686,
    "lng": 99.539,
    "source": "gvp"
  },
  {
    "name": "Soufriere Guadeloupe",
    "lat": 16.044,
    "lng": -61.664,
    "source": "gvp"
  },
  {
    "name": "Soufriere Hills",
    "lat": 16.72,
    "lng": -62.18,
    "source": "gvp"
  },
  {
    "name": "Soufriere St. Vincent",
    "lat": 13.33,
    "lng": -61.18,
    "source": "gvp"
  },
  {
    "name": "South Sarigan seamount",
    "lat": 16.58,
    "lng": 145.78,
    "source": "usgs"
  },
  {
    "name": "Southern Thule",
    "lat": -59.442,
    "lng": -27.225,
    "source": "gvp"
  },
  {
    "name": "Spectrum Range",
    "lat": 57.43,
    "lng": -130.68,
    "source": "gvp"
  },
  {
    "name": "Spurr",
    "lat": 61.2989,
    "lng": -152.2539,
    "source": "usgs"
  },
  {
    "name": "St. Andrew Strait",
    "lat": -2.38,
    "lng": 147.35,
    "source": "gvp"
  },
  {
    "name": "St. Catherine",
    "lat": 12.15,
    "lng": -61.67,
    "source": "gvp"
  },
  {
    "name": "St. Michael",
    "lat": 63.4493,
    "lng": -162.123,
    "source": "usgs"
  },
  {
    "name": "Steller",
    "lat": 58.4301,
    "lng": -154.3903,
    "source": "usgs"
  },
  {
    "name": "Stepovak Bay group",
    "lat": 55.9125,
    "lng": -160.041,
    "source": "usgs"
  },
  {
    "name": "Stromboli",
    "lat": 38.789,
    "lng": 15.213,
    "source": "gvp"
  },
  {
    "name": "Suchitan",
    "lat": 14.4,
    "lng": -89.78,
    "source": "gvp"
  },
  {
    "name": "Sulu Range",
    "lat": -5.5,
    "lng": 150.942,
    "source": "gvp"
  },
  {
    "name": "Sumaco",
    "lat": -0.538,
    "lng": -77.626,
    "source": "gvp"
  },
  {
    "name": "Sumbing",
    "lat": -2.414,
    "lng": 101.728,
    "source": "gvp"
  },
  {
    "name": "Sumbing",
    "lat": -7.384,
    "lng": 110.07,
    "source": "gvp"
  },
  {
    "name": "Sumisujima",
    "lat": 31.44,
    "lng": 140.051,
    "source": "gvp"
  },
  {
    "name": "Sundoro",
    "lat": -7.3,
    "lng": 109.992,
    "source": "gvp"
  },
  {
    "name": "Supply Reef",
    "lat": 20.13,
    "lng": 145.1,
    "source": "usgs"
  },
  {
    "name": "Suretamatai",
    "lat": -13.8,
    "lng": 167.47,
    "source": "gvp"
  },
  {
    "name": "Suswa",
    "lat": -1.151,
    "lng": 36.357,
    "source": "gvp"
  },
  {
    "name": "Suwanosejima",
    "lat": 29.638,
    "lng": 129.714,
    "source": "gvp"
  },
  {
    "name": "Ta'u Island",
    "lat": -14.23,
    "lng": -169.454,
    "source": "usgs"
  },
  {
    "name": "Taal",
    "lat": 14.002,
    "lng": 120.993,
    "source": "gvp"
  },
  {
    "name": "Taapaca",
    "lat": -18.1,
    "lng": -69.5,
    "source": "gvp"
  },
  {
    "name": "Taburete",
    "lat": 13.435,
    "lng": -88.532,
    "source": "gvp"
  },
  {
    "name": "Tacana",
    "lat": 15.132,
    "lng": -92.109,
    "source": "gvp"
  },
  {
    "name": "Tacora",
    "lat": -17.72,
    "lng": -69.77,
    "source": "gvp"
  },
  {
    "name": "Tafu-Maka",
    "lat": -15.37,
    "lng": -174.23,
    "source": "gvp"
  },
  {
    "name": "Tahual",
    "lat": 14.43,
    "lng": -89.9,
    "source": "gvp"
  },
  {
    "name": "Tair, Jebel at",
    "lat": 15.55,
    "lng": 41.83,
    "source": "gvp"
  },
  {
    "name": "Taisetsuzan",
    "lat": 43.664,
    "lng": 142.854,
    "source": "gvp"
  },
  {
    "name": "Takaharayama",
    "lat": 36.9,
    "lng": 139.777,
    "source": "gvp"
  },
  {
    "name": "Takahe",
    "lat": -76.28,
    "lng": -112.08,
    "source": "gvp"
  },
  {
    "name": "Takawangha",
    "lat": 51.867,
    "lng": -178.027,
    "source": "usgs"
  },
  {
    "name": "Talagabodas",
    "lat": -7.208,
    "lng": 108.07,
    "source": "gvp"
  },
  {
    "name": "Talakmau",
    "lat": 0.079,
    "lng": 99.98,
    "source": "gvp"
  },
  {
    "name": "Talang",
    "lat": -0.979,
    "lng": 100.681,
    "source": "gvp"
  },
  {
    "name": "Tambora",
    "lat": -8.25,
    "lng": 118,
    "source": "gvp"
  },
  {
    "name": "Tanaga",
    "lat": 51.884,
    "lng": -178.143,
    "source": "usgs"
  },
  {
    "name": "Tanax̂ Angunax̂",
    "lat": 52.839,
    "lng": -169.758,
    "source": "usgs"
  },
  {
    "name": "Tandikat-Singgalang",
    "lat": -0.39,
    "lng": 100.331,
    "source": "gvp"
  },
  {
    "name": "Tangkoko-Duasudara",
    "lat": 1.518,
    "lng": 125.185,
    "source": "gvp"
  },
  {
    "name": "Tangkuban Parahu",
    "lat": -6.77,
    "lng": 107.6,
    "source": "gvp"
  },
  {
    "name": "Tao-Rusyr Caldera",
    "lat": 49.35,
    "lng": 154.7,
    "source": "gvp"
  },
  {
    "name": "Tarakan",
    "lat": 1.83,
    "lng": 127.83,
    "source": "gvp"
  },
  {
    "name": "Taranaki",
    "lat": -39.3,
    "lng": 174.07,
    "source": "gvp"
  },
  {
    "name": "Taryatu-Chulutu",
    "lat": 48.133,
    "lng": 99.95,
    "source": "gvp"
  },
  {
    "name": "Tatun Volcanic Group",
    "lat": 25.178,
    "lng": 121.553,
    "source": "gvp"
  },
  {
    "name": "Taupo",
    "lat": -38.82,
    "lng": 176,
    "source": "gvp"
  },
  {
    "name": "Taveuni",
    "lat": -16.82,
    "lng": -179.97,
    "source": "gvp"
  },
  {
    "name": "Tecapa",
    "lat": 13.494,
    "lng": -88.502,
    "source": "gvp"
  },
  {
    "name": "Tecuamburro",
    "lat": 14.156,
    "lng": -90.407,
    "source": "gvp"
  },
  {
    "name": "Telica",
    "lat": 12.606,
    "lng": -86.84,
    "source": "gvp"
  },
  {
    "name": "Telomoyo",
    "lat": -7.362,
    "lng": 110.4,
    "source": "gvp"
  },
  {
    "name": "Telong, Bur ni",
    "lat": 4.769,
    "lng": 96.821,
    "source": "gvp"
  },
  {
    "name": "Tenduruk Dagi",
    "lat": 39.356,
    "lng": 43.874,
    "source": "gvp"
  },
  {
    "name": "Tenerife",
    "lat": 28.271,
    "lng": -16.641,
    "source": "gvp"
  },
  {
    "name": "Tengchong",
    "lat": 25.23,
    "lng": 98.5,
    "source": "gvp"
  },
  {
    "name": "Tengger Caldera",
    "lat": -7.942,
    "lng": 112.95,
    "source": "gvp"
  },
  {
    "name": "Tenorio",
    "lat": 10.673,
    "lng": -85.015,
    "source": "gvp"
  },
  {
    "name": "Tepi",
    "lat": 7.42,
    "lng": 35.43,
    "source": "gvp"
  },
  {
    "name": "Terceira",
    "lat": 38.73,
    "lng": -27.32,
    "source": "gvp"
  },
  {
    "name": "Theistareykir",
    "lat": 65.833,
    "lng": -17.166,
    "source": "gvp"
  },
  {
    "name": "Three Sisters",
    "lat": 44.103,
    "lng": -121.768,
    "source": "usgs"
  },
  {
    "name": "Tidore",
    "lat": 0.658,
    "lng": 127.4,
    "source": "gvp"
  },
  {
    "name": "Tigre, El",
    "lat": 13.47,
    "lng": -88.43,
    "source": "gvp"
  },
  {
    "name": "Tigre, Isla el",
    "lat": 13.272,
    "lng": -87.641,
    "source": "gvp"
  },
  {
    "name": "Tilocalar",
    "lat": -23.97,
    "lng": -68.13,
    "source": "gvp"
  },
  {
    "name": "Tinakula",
    "lat": -10.386,
    "lng": 165.804,
    "source": "gvp"
  },
  {
    "name": "Tindfjallajokull",
    "lat": 63.783,
    "lng": -19.716,
    "source": "gvp"
  },
  {
    "name": "Tinguiririca",
    "lat": -34.814,
    "lng": -70.352,
    "source": "gvp"
  },
  {
    "name": "Titila",
    "lat": 57.406,
    "lng": 160.108,
    "source": "gvp"
  },
  {
    "name": "Tjornes Fracture Zone",
    "lat": 66.309,
    "lng": -17.118,
    "source": "gvp"
  },
  {
    "name": "Tlevak Strait-Suemez Island",
    "lat": 55.2496,
    "lng": -133.302,
    "source": "usgs"
  },
  {
    "name": "Toba",
    "lat": 2.58,
    "lng": 98.83,
    "source": "gvp"
  },
  {
    "name": "Todoko-Ranu",
    "lat": 1.25,
    "lng": 127.47,
    "source": "gvp"
  },
  {
    "name": "Todra Volcanic Field",
    "lat": 17.68,
    "lng": 8.5,
    "source": "gvp"
  },
  {
    "name": "Tofua",
    "lat": -19.75,
    "lng": -175.07,
    "source": "gvp"
  },
  {
    "name": "Toh, Tarso",
    "lat": 21.33,
    "lng": 16.33,
    "source": "gvp"
  },
  {
    "name": "Tokachidake",
    "lat": 43.418,
    "lng": 142.686,
    "source": "gvp"
  },
  {
    "name": "Tolbachik",
    "lat": 55.832,
    "lng": 160.326,
    "source": "gvp"
  },
  {
    "name": "Tolhuaca",
    "lat": -38.31,
    "lng": -71.645,
    "source": "gvp"
  },
  {
    "name": "Tolima, Nevado del",
    "lat": 4.658,
    "lng": -75.33,
    "source": "gvp"
  },
  {
    "name": "Toliman",
    "lat": 14.612,
    "lng": -91.189,
    "source": "gvp"
  },
  {
    "name": "Toluca, Nevado de",
    "lat": 19.108,
    "lng": -99.758,
    "source": "gvp"
  },
  {
    "name": "Tomariyama [Golovnin]",
    "lat": 43.844,
    "lng": 145.504,
    "source": "gvp"
  },
  {
    "name": "Tombel Graben",
    "lat": 4.758,
    "lng": 9.717,
    "source": "gvp"
  },
  {
    "name": "Tondano Caldera",
    "lat": 1.23,
    "lng": 124.83,
    "source": "gvp"
  },
  {
    "name": "Toney Mountain",
    "lat": -75.8,
    "lng": -115.83,
    "source": "gvp"
  },
  {
    "name": "Tonga–Kermadec arc",
    "lat": -21,
    "lng": -175,
    "source": "system"
  },
  {
    "name": "Tongariro",
    "lat": -39.157,
    "lng": 175.632,
    "source": "gvp"
  },
  {
    "name": "Torfajokull",
    "lat": 63.892,
    "lng": -19.122,
    "source": "gvp"
  },
  {
    "name": "Toshima",
    "lat": 34.52,
    "lng": 139.279,
    "source": "gvp"
  },
  {
    "name": "Tousside, Tarso",
    "lat": 21.03,
    "lng": 16.45,
    "source": "gvp"
  },
  {
    "name": "Towada",
    "lat": 40.51,
    "lng": 140.88,
    "source": "gvp"
  },
  {
    "name": "Toya",
    "lat": 42.544,
    "lng": 140.839,
    "source": "gvp"
  },
  {
    "name": "Traitor's Head",
    "lat": -18.754,
    "lng": 169.238,
    "source": "gvp"
  },
  {
    "name": "Tralihue",
    "lat": -38.509,
    "lng": -70.898,
    "source": "gvp"
  },
  {
    "name": "Trident",
    "lat": 58.2343,
    "lng": -155.1026,
    "source": "usgs"
  },
  {
    "name": "Tristan da Cunha",
    "lat": -37.092,
    "lng": -12.28,
    "source": "gvp"
  },
  {
    "name": "Trois Pitons, Morne",
    "lat": 15.37,
    "lng": -61.33,
    "source": "gvp"
  },
  {
    "name": "Trolon",
    "lat": -37.738,
    "lng": -70.906,
    "source": "gvp"
  },
  {
    "name": "Tromen",
    "lat": -37.144,
    "lng": -70.033,
    "source": "gvp"
  },
  {
    "name": "Tronador",
    "lat": -41.157,
    "lng": -71.885,
    "source": "gvp"
  },
  {
    "name": "Tullu Moje",
    "lat": 8.159,
    "lng": 39.137,
    "source": "gvp"
  },
  {
    "name": "Tungnafellsjokull",
    "lat": 64.75,
    "lng": -17.916,
    "source": "gvp"
  },
  {
    "name": "Tunkin Depression",
    "lat": 51.5,
    "lng": 102.5,
    "source": "gvp"
  },
  {
    "name": "Tupungatito",
    "lat": -33.425,
    "lng": -69.797,
    "source": "gvp"
  },
  {
    "name": "Turrialba",
    "lat": 10.025,
    "lng": -83.767,
    "source": "gvp"
  },
  {
    "name": "Tutuila Island",
    "lat": -14.295,
    "lng": -170.7,
    "source": "usgs"
  },
  {
    "name": "Tutupaca",
    "lat": -17.026,
    "lng": -70.372,
    "source": "gvp"
  },
  {
    "name": "Tuya Volcanic Field",
    "lat": 59.37,
    "lng": -130.58,
    "source": "gvp"
  },
  {
    "name": "Tuzgle",
    "lat": -24.05,
    "lng": -66.48,
    "source": "gvp"
  },
  {
    "name": "Tuzovsky",
    "lat": 57.32,
    "lng": 159.967,
    "source": "gvp"
  },
  {
    "name": "Ubehebe Craters",
    "lat": 37.02,
    "lng": -117.45,
    "source": "usgs"
  },
  {
    "name": "Udina",
    "lat": 55.758,
    "lng": 160.527,
    "source": "gvp"
  },
  {
    "name": "Udokan Plateau",
    "lat": 56.28,
    "lng": 117.77,
    "source": "gvp"
  },
  {
    "name": "Ugashik-Peulik",
    "lat": 57.7503,
    "lng": -156.37,
    "source": "usgs"
  },
  {
    "name": "Uinkaret volcanic field",
    "lat": 36.38,
    "lng": -113.13,
    "source": "usgs"
  },
  {
    "name": "Ukinrek Maars",
    "lat": 57.8338,
    "lng": -156.5139,
    "source": "usgs"
  },
  {
    "name": "Uksichan",
    "lat": 56.08,
    "lng": 158.38,
    "source": "gvp"
  },
  {
    "name": "Uliaga",
    "lat": 53.065,
    "lng": -169.767,
    "source": "usgs"
  },
  {
    "name": "Ulreung",
    "lat": 37.5,
    "lng": 130.87,
    "source": "gvp"
  },
  {
    "name": "Umboi",
    "lat": -5.589,
    "lng": 147.875,
    "source": "gvp"
  },
  {
    "name": "Ungaran",
    "lat": -7.18,
    "lng": 110.33,
    "source": "gvp"
  },
  {
    "name": "Ungulungwak Hill-Ingrichuak Hill",
    "lat": 62.1778,
    "lng": -164.0936,
    "source": "usgs"
  },
  {
    "name": "Unnamed (near Ukinrek Maars)",
    "lat": 57.869,
    "lng": -155.422,
    "source": "usgs"
  },
  {
    "name": "Unzendake",
    "lat": 32.761,
    "lng": 130.299,
    "source": "gvp"
  },
  {
    "name": "Upolu",
    "lat": -13.935,
    "lng": -171.72,
    "source": "gvp"
  },
  {
    "name": "Uratman",
    "lat": 47.12,
    "lng": 152.25,
    "source": "gvp"
  },
  {
    "name": "Ushkovsky",
    "lat": 56.113,
    "lng": 160.509,
    "source": "gvp"
  },
  {
    "name": "Usulutan",
    "lat": 13.419,
    "lng": -88.471,
    "source": "gvp"
  },
  {
    "name": "Utila Island",
    "lat": 16.12,
    "lng": -86.882,
    "source": "gvp"
  },
  {
    "name": "Uwayrid, Harrat",
    "lat": 27.08,
    "lng": 37.25,
    "source": "gvp"
  },
  {
    "name": "Uzon",
    "lat": 54.5,
    "lng": 159.97,
    "source": "gvp"
  },
  {
    "name": "Vailulu'u",
    "lat": -14.215,
    "lng": -169.058,
    "source": "gvp"
  },
  {
    "name": "Vaiyots-Sar",
    "lat": 39.797,
    "lng": 45.497,
    "source": "gvp"
  },
  {
    "name": "Vakinankaratra",
    "lat": -19.85,
    "lng": 46.942,
    "source": "gvp"
  },
  {
    "name": "Valle, El",
    "lat": 8.58,
    "lng": -80.17,
    "source": "gvp"
  },
  {
    "name": "Valles Caldera",
    "lat": 35.87,
    "lng": -106.57,
    "source": "usgs"
  },
  {
    "name": "Vanuatu / New Hebrides arc",
    "lat": -16.5,
    "lng": 168,
    "source": "system"
  },
  {
    "name": "Veniaminof",
    "lat": 56.1979,
    "lng": -159.3931,
    "source": "usgs"
  },
  {
    "name": "Vernadskii Ridge",
    "lat": 50.55,
    "lng": 155.97,
    "source": "gvp"
  },
  {
    "name": "Vestmannaeyjar",
    "lat": 63.416,
    "lng": -20.266,
    "source": "gvp"
  },
  {
    "name": "Vesuvius",
    "lat": 40.821,
    "lng": 14.426,
    "source": "gvp"
  },
  {
    "name": "Victory",
    "lat": -9.2,
    "lng": 149.07,
    "source": "gvp"
  },
  {
    "name": "Villarrica",
    "lat": -39.42,
    "lng": -71.93,
    "source": "gvp"
  },
  {
    "name": "Vilyuchik",
    "lat": 52.7,
    "lng": 158.28,
    "source": "gvp"
  },
  {
    "name": "Visoke",
    "lat": -1.458,
    "lng": 29.485,
    "source": "gvp"
  },
  {
    "name": "Visokiy",
    "lat": 52.43,
    "lng": 157.93,
    "source": "gvp"
  },
  {
    "name": "Vitim Volcanic Field",
    "lat": 53.75,
    "lng": 113.25,
    "source": "gvp"
  },
  {
    "name": "Voon, Tarso",
    "lat": 20.92,
    "lng": 17.28,
    "source": "gvp"
  },
  {
    "name": "Voyampolsky",
    "lat": 58.374,
    "lng": 160.631,
    "source": "gvp"
  },
  {
    "name": "Vsevidof",
    "lat": 53.1256,
    "lng": -168.6937,
    "source": "usgs"
  },
  {
    "name": "Vulcano",
    "lat": 38.404,
    "lng": 14.962,
    "source": "gvp"
  },
  {
    "name": "Vulsini",
    "lat": 42.6,
    "lng": 11.93,
    "source": "gvp"
  },
  {
    "name": "Vysoky",
    "lat": 55.064,
    "lng": 160.765,
    "source": "gvp"
  },
  {
    "name": "Waesche",
    "lat": -77.17,
    "lng": -126.88,
    "source": "gvp"
  },
  {
    "name": "Wallis Islands",
    "lat": -13.3,
    "lng": -176.17,
    "source": "gvp"
  },
  {
    "name": "Wapi Lava Field",
    "lat": 42.88,
    "lng": -113.22,
    "source": "usgs"
  },
  {
    "name": "Washiba-Kumonotaira",
    "lat": 36.408,
    "lng": 137.594,
    "source": "gvp"
  },
  {
    "name": "Watt, Morne",
    "lat": 15.307,
    "lng": -61.305,
    "source": "gvp"
  },
  {
    "name": "Wells Gray-Clearwater",
    "lat": 52.33,
    "lng": -120.57,
    "source": "gvp"
  },
  {
    "name": "West Crater volcanic field",
    "lat": 45.88,
    "lng": -122.08,
    "source": "usgs"
  },
  {
    "name": "West Eifel Volcanic Field",
    "lat": 50.17,
    "lng": 6.85,
    "source": "gvp"
  },
  {
    "name": "West Mata",
    "lat": -15.1,
    "lng": -173.75,
    "source": "gvp"
  },
  {
    "name": "Westdahl",
    "lat": 54.5171,
    "lng": -164.6476,
    "source": "usgs"
  },
  {
    "name": "Whakaari/White Island",
    "lat": -37.52,
    "lng": 177.18,
    "source": "gvp"
  },
  {
    "name": "Whangarei",
    "lat": -35.75,
    "lng": 174.27,
    "source": "gvp"
  },
  {
    "name": "Wide Bay cone",
    "lat": 53.9611,
    "lng": -166.615,
    "source": "usgs"
  },
  {
    "name": "Wilis",
    "lat": -7.808,
    "lng": 111.758,
    "source": "gvp"
  },
  {
    "name": "Witori",
    "lat": -5.576,
    "lng": 150.516,
    "source": "gvp"
  },
  {
    "name": "Wrangell",
    "lat": 62.0057,
    "lng": -144.0193,
    "source": "usgs"
  },
  {
    "name": "Wudalianchi",
    "lat": 48.72,
    "lng": 126.12,
    "source": "gvp"
  },
  {
    "name": "Yakedake",
    "lat": 36.227,
    "lng": 137.587,
    "source": "gvp"
  },
  {
    "name": "Yantarni",
    "lat": 57.0179,
    "lng": -157.1864,
    "source": "usgs"
  },
  {
    "name": "Yar, Jabal",
    "lat": 17.05,
    "lng": 42.83,
    "source": "gvp"
  },
  {
    "name": "Yasur",
    "lat": -19.532,
    "lng": 169.447,
    "source": "gvp"
  },
  {
    "name": "Yavinsky",
    "lat": 51.533,
    "lng": 156.629,
    "source": "gvp"
  },
  {
    "name": "Yellowstone",
    "lat": 44.43,
    "lng": -110.67,
    "source": "usgs"
  },
  {
    "name": "Yellowstone hotspot",
    "lat": 44.43,
    "lng": -110.67,
    "source": "system"
  },
  {
    "name": "Yojoa, Lake",
    "lat": 14.98,
    "lng": -87.98,
    "source": "gvp"
  },
  {
    "name": "Yokoate-jima",
    "lat": 28.797,
    "lng": 128.997,
    "source": "gvp"
  },
  {
    "name": "Yokodake",
    "lat": 36.087,
    "lng": 138.32,
    "source": "gvp"
  },
  {
    "name": "Yonemaru-Sumiyoshiike",
    "lat": 31.771,
    "lng": 130.592,
    "source": "gvp"
  },
  {
    "name": "Yoteizan",
    "lat": 42.827,
    "lng": 140.812,
    "source": "gvp"
  },
  {
    "name": "Yucamane",
    "lat": -17.184,
    "lng": -70.196,
    "source": "gvp"
  },
  {
    "name": "Yufu-Tsurumi",
    "lat": 33.282,
    "lng": 131.39,
    "source": "gvp"
  },
  {
    "name": "Yunaska",
    "lat": 52.649,
    "lng": -170.659,
    "source": "usgs"
  },
  {
    "name": "Zacate Grande, Isla",
    "lat": 13.33,
    "lng": -87.63,
    "source": "gvp"
  },
  {
    "name": "Zaozan [Zaosan]",
    "lat": 38.144,
    "lng": 140.44,
    "source": "gvp"
  },
  {
    "name": "Zaozerny",
    "lat": 56.88,
    "lng": 159.95,
    "source": "gvp"
  },
  {
    "name": "Zapatera",
    "lat": 11.73,
    "lng": -85.82,
    "source": "gvp"
  },
  {
    "name": "Zavaritsky",
    "lat": 53.905,
    "lng": 158.385,
    "source": "gvp"
  },
  {
    "name": "Zavodovski",
    "lat": -56.3,
    "lng": -27.57,
    "source": "gvp"
  },
  {
    "name": "Zealandia Bank",
    "lat": 16.88,
    "lng": 145.85,
    "source": "usgs"
  },
  {
    "name": "Zimina",
    "lat": 55.862,
    "lng": 160.603,
    "source": "gvp"
  },
  {
    "name": "Zitacuaro-Valle de Bravo",
    "lat": 19.4,
    "lng": -100.25,
    "source": "gvp"
  },
  {
    "name": "Zubair Group",
    "lat": 15.05,
    "lng": 42.18,
    "source": "gvp"
  },
  {
    "name": "Zukur",
    "lat": 14.02,
    "lng": 42.75,
    "source": "gvp"
  },
  {
    "name": "Zuni-Bandera volcanic field",
    "lat": 34.8,
    "lng": -108,
    "source": "usgs"
  }
] as const;

export const VOLCANIC_ANCHOR_COUNT = 1065 as const;
