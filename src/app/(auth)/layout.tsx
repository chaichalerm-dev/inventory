import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-muted/40 p-4 py-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
