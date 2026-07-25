import type { Protocol } from "@/db/schema";
import type { ProtocolSeed } from "@/db/seed-data";

export function seedToProtocol(seed: ProtocolSeed): Protocol {
  return {
    ...seed,
    active: true,
    createdAt: new Date(),
  };
}
