import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4 py-8">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
