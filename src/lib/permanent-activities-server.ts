import "server-only";

import { isPermanentProtocol, type CatalogProtocol } from "@/lib/permanent-activities";

/** Server-only: loads merged catalog overlays from content/. */
export async function isPermanentProtocolMerged(
  protocolId: string,
): Promise<boolean> {
  const { getMergedCatalogProtocolById } = await import("@/lib/catalog-server");
  const row = await getMergedCatalogProtocolById(protocolId);
  return row ? isPermanentProtocol(row as CatalogProtocol) : false;
}
