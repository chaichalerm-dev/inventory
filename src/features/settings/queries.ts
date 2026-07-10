import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Deployment-wide settings, not scoped to any organization — the sign-in
// page needs this before any org is known, so it can't live on Organization.
export type SystemSettings = {
  showLoginDemoAccounts: boolean;
  logoUrl: string | null;
};

const SYSTEM_SETTINGS_ID = "global";

export async function getSystemSettings(): Promise<SystemSettings> {
  // The public sign-in page calls this on every visit, so this stays a pure
  // read in the common case — only the very first call anywhere in the
  // deployment's lifetime falls through to create the singleton row.
  const existing = await prisma.systemSetting.findUnique({
    where: { id: SYSTEM_SETTINGS_ID },
  });
  if (existing) {
    return {
      showLoginDemoAccounts: existing.showLoginDemoAccounts,
      logoUrl: existing.logoUrl,
    };
  }

  try {
    const created = await prisma.systemSetting.create({
      data: { id: SYSTEM_SETTINGS_ID },
    });
    return {
      showLoginDemoAccounts: created.showLoginDemoAccounts,
      logoUrl: created.logoUrl,
    };
  } catch (error) {
    // Two first-ever requests can race into this branch; the loser's create
    // hits the primary key — the row now exists, so just read it.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const row = await prisma.systemSetting.findUniqueOrThrow({
        where: { id: SYSTEM_SETTINGS_ID },
      });
      return {
        showLoginDemoAccounts: row.showLoginDemoAccounts,
        logoUrl: row.logoUrl,
      };
    }
    throw error;
  }
}
