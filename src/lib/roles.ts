import type { MembershipRole } from "@/generated/prisma/enums";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

// OWNER and ADMIN share the admin experience; MEMBER is the employee portal.
export function isAdminRole(role: MembershipRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function getRoleLabel(role: MembershipRole, dict: Dictionary): string {
  if (role === "OWNER") return dict.users.roleOwner;
  if (role === "ADMIN") return dict.users.roleAdmin;
  return dict.users.roleUser;
}
