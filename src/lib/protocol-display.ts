import { PROTOCOL_ARTICLE_IDS } from "@/lib/protocol-article-map";
import {
  getProtocolHowTo,
  getProtocolMeta,
  protocolTeaserFromHowTo,
  type ProtocolMeta,
} from "@/lib/protocol-meta";
import type { MitoEntry } from "@/lib/mitoversity";

export { protocolTeaserFromHowTo };

export function getProtocolTeaser(
  protocol: { id: string; description: string },
  metaMap?: Record<string, ProtocolMeta>,
): string {
  const howTo = getProtocolHowTo(protocol, metaMap);
  if (howTo) return protocolTeaserFromHowTo(howTo);
  return protocol.description.trim();
}

export function getProtocolArticleId(
  protocolId: string,
  metaMap?: Record<string, ProtocolMeta>,
): string | undefined {
  const fromMeta = getProtocolMeta(protocolId, metaMap).articleId?.trim();
  if (fromMeta) return fromMeta;
  return PROTOCOL_ARTICLE_IDS[protocolId];
}

export function findMitoEntryForProtocol(
  protocolId: string,
  entries: readonly MitoEntry[],
  metaMap?: Record<string, ProtocolMeta>,
): MitoEntry | undefined {
  const articleId = getProtocolArticleId(protocolId, metaMap);
  if (articleId) {
    const direct = entries.find((e) => e.id === articleId);
    if (direct) return direct;
  }
  return entries.find((e) => e.relatedProtocolIds?.includes(protocolId));
}
