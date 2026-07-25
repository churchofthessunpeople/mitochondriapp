import type { Protocol, ProtocolCategory, TimeOfDay } from "@/db/schema";
import type { LwmPillarId, LwmPillarMeta } from "@/lib/lwm";
import type { MitoEntry, MitoPillar } from "@/lib/mitoversity";
import type { ProtocolMeta } from "@/lib/protocol-meta";

export type AppContentBundle = {
  protocols: Protocol[];
  permanentProtocolIds: string[];
  protocolMeta: Record<string, ProtocolMeta>;
  mitoEntries: MitoEntry[];
  categoryMeta: Record<
    ProtocolCategory,
    { label: string; blurb: string; pillar: LwmPillarId }
  >;
  mitoPillarLabels: Record<MitoPillar, string>;
  mitoversityIntro: string;
  timeOfDayMeta: Record<TimeOfDay, { label: string; blurb: string }>;
  lwmPillars: readonly LwmPillarMeta[];
};
