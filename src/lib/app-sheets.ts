/** Secondary content that opens as an in-page card (not a route). */
export type AppSheet =
  | { id: "scoring" }
  | { id: "regions" }
  | { id: "historyDay"; date: string }
  | { id: "admin" };

export type OpenAppSheet = (sheet: AppSheet) => void;
