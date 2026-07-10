import { redirect } from "next/navigation";
import { hasActiveSession } from "@/lib/session";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Checks live membership, not just the cookie — a member removed from the
  // org still holds a decodable JWT, and bouncing them to /dashboard (which
  // requireSession sends straight back here) would loop forever.
  if (await hasActiveSession()) redirect("/dashboard");

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-muted/40 p-4 py-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
