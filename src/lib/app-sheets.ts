/** Secondary content that opens as an in-page card (not a route). */
export type AppSheet =
  | { id: "scoring" }
  | { id: "regions" }
  | { id: "historyDay"; date: string }
  | { id: "admin" }
  | { id: "guideLight" }
  | { id: "guideWater" }
  | { id: "guideMagnetism" }
  | { id: "convertGuest" };

export type OpenAppSheet = (sheet: AppSheet) => void;
