import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getRoleLabel } from "@/lib/roles";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getSystemSettings } from "@/features/settings/queries";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireSession returns the live role (not the JWT snapshot), so the nav
  // a demoted admin sees matches what the pages will actually let them do.
  const { userId, role } = await requireSession();
  const session = await auth();
  const dict = getDictionary(await getLocale());

  // avatarUrl isn't in the JWT (it would go stale between logins whenever
  // the user changes it), so it's fetched fresh on every layout render.
  const [user, { logoUrl }] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    }),
    getSystemSettings(),
  ]);

  return (
    <AppShell
      role={role}
      roleLabel={getRoleLabel(role, dict)}
      name={session?.user?.name ?? "User"}
      email={session?.user?.email ?? ""}
      avatarUrl={user?.avatarUrl ?? null}
      logoUrl={logoUrl}
    >
      {children}
    </AppShell>
  );
}
