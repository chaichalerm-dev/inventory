import { redirect } from "next/navigation";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { hasActiveSession } from "@/lib/session";
import { getSystemSettings } from "@/features/settings/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [signedIn, { logoUrl }, dict] = await Promise.all([
    hasActiveSession(),
    getSystemSettings(),
    getLocale().then(getDictionary),
  ]);
  // Checks live membership, not just the cookie — a member removed from the
  // org still holds a decodable JWT, and bouncing them to /dashboard (which
  // requireSession sends straight back here) would loop forever.
  if (signedIn) redirect("/dashboard");

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-muted/40 p-4 py-8">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <Boxes className="size-4" aria-hidden="true" />
            )}
          </span>
          <span className="font-heading text-sm font-bold">{dict.common.appName}</span>
        </Link>
      </div>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
