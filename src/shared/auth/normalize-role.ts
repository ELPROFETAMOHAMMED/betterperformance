export type NormalizedRole = "admin" | "user";

export function normalizeRole(role: unknown): NormalizedRole | null {
  if (!role) {
    return null;
  }

  const normalizedRole = String(role).trim().toLowerCase();

  if (normalizedRole === "admin") {
    return "admin";
  }

  if (normalizedRole === "user") {
    return "user";
  }

  return null;
}
