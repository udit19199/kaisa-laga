export type OrganizationRole = "owner" | "manager" | "viewer";

export function canManageOrganization(role: OrganizationRole | null | undefined) {
  return role === "owner" || role === "manager";
}

export function canOwnOrganization(role: OrganizationRole | null | undefined) {
  return role === "owner";
}
