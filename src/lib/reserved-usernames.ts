/**
 * Usernames that cannot be registered or claimed via rename.
 * Does NOT grant admin — only `users.is_admin` does.
 * Optional: ADMIN_RESERVED_USERNAMES=comma,separated
 */
const HARDCODED_RESERVED_USERNAMES = ["churchofthesunpeople"] as const;

function envReservedUsernames(): string[] {
  return (
    process.env.ADMIN_RESERVED_USERNAMES?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

/** Legacy env name still reserved so old configs cannot be claimed. */
function envLegacyAdminUsernames(): string[] {
  return (
    process.env.ADMIN_USERNAMES?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

export function listReservedUsernames(): string[] {
  return [
    ...HARDCODED_RESERVED_USERNAMES,
    ...envReservedUsernames(),
    ...envLegacyAdminUsernames(),
  ];
}

export function isReservedUsername(
  username: string | null | undefined,
): boolean {
  const u = (username ?? "").toLowerCase();
  if (!u) return false;
  return listReservedUsernames().includes(u);
}
