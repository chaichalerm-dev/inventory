import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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

  return (
    <AppShell
      role={role}
      roleLabel={roleLabels[role]}
      name={session.user.name ?? "User"}
      email={session.user.email ?? ""}
    >
      {children}
    </AppShell>
  );
}
