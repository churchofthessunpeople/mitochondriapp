import { z } from "zod";

/** 3–24 chars: letters, numbers, underscore. Stored lowercase. */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(24, "Username must be at most 24 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Username must start with a letter and use only letters, numbers, and underscores",
  )
  .transform((value) => value.toLowerCase());

export function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

export {
  MIN_USERNAME_DISSIMILARITY as USERNAME_MIN_DISSIMILARITY,
  MIN_NAME_DISSIMILARITY,
  nameConflictMessage as usernameConflictMessage,
  nameDissimilarity as usernameDissimilarity,
  nameSimilarity as usernameSimilarity,
  levenshteinDistance,
} from "@/lib/name-similarity";
