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

export function resolveUserRole(
  profileRole: unknown,
  metadataRole: unknown
): NormalizedRole {
  const normalizedProfileRole = normalizeRole(profileRole);

  if (normalizedProfileRole) {
    return normalizedProfileRole;
  }

  const normalizedMetadataRole = normalizeRole(metadataRole);

  if (normalizedMetadataRole) {
    return normalizedMetadataRole;
  }

  return "user";
}
