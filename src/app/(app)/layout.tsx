import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleLabels } from "@/lib/roles";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.orgId) redirect("/sign-in");
  const role = session.user.role;

  // avatarUrl isn't in the JWT (it would go stale between logins whenever
  // the user changes it), so it's fetched fresh on every layout render.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  });

  return (
    <AppShell
      role={role}
      roleLabel={roleLabels[role]}
      name={session.user.name ?? "User"}
      email={session.user.email ?? ""}
      avatarUrl={user?.avatarUrl ?? null}
    >
      {children}
    </AppShell>
  );
}
