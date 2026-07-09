import "server-only";
import { prisma } from "@/lib/prisma";

// Deployment-wide settings, not scoped to any organization — the sign-in
// page needs this before any org is known, so it can't live on Organization.
export type SystemSettings = {
  showLoginDemoAccounts: boolean;
};

const SYSTEM_SETTINGS_ID = "global";

export async function getSystemSettings(): Promise<SystemSettings> {
  // The public sign-in page calls this on every visit, so this stays a pure
  // read in the common case — only the very first call anywhere in the
  // deployment's lifetime falls through to create the singleton row.
  const existing = await prisma.systemSetting.findUnique({
    where: { id: SYSTEM_SETTINGS_ID },
  });
  if (existing) return { showLoginDemoAccounts: existing.showLoginDemoAccounts };

  const created = await prisma.systemSetting.create({
    data: { id: SYSTEM_SETTINGS_ID },
  });
  return { showLoginDemoAccounts: created.showLoginDemoAccounts };
}
