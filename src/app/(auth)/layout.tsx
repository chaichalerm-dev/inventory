import { redirect } from "next/navigation";
import Link from "next/link";
import { hasActiveSession } from "@/lib/session";
import { getSystemSettings } from "@/features/settings/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { BrandMark } from "@/components/brand/brand-mark";

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
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(22rem,0.78fr)_minmax(34rem,1.22fr)]">
      <section className="paper-noise relative hidden overflow-hidden border-r border-sidebar-border bg-sidebar p-10 text-sidebar-foreground lg:flex lg:flex-col xl:p-14">
        <Link href="/" className="relative z-10 flex items-center gap-3 self-start">
          <BrandMark logoUrl={logoUrl} className="size-10" />
          <span className="text-lg font-bold tracking-[-0.02em] text-white">{dict.common.appName}</span>
        </Link>

        <div className="relative z-10 my-auto max-w-lg py-16">
          <p className="mb-5 flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.16em] text-sidebar-primary uppercase">
            <span className="h-px w-9 bg-sidebar-primary" />
            {dict.common.tagline}
          </p>
          <h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.04em] text-white xl:text-5xl">
            {dict.landing.heroTitle}
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-sidebar-foreground/78">
            {dict.landing.heroSubtitle}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 border-y border-sidebar-border py-5 text-xs text-sidebar-foreground/70">
          <span>01 / STOCK</span>
          <span>02 / REQUEST</span>
          <span>03 / REPORT</span>
        </div>
        <div className="absolute -right-24 bottom-24 size-72 rotate-12 border border-sidebar-primary/20" aria-hidden="true" />
        <div className="absolute -right-3 bottom-10 size-32 bg-sidebar-primary/8" aria-hidden="true" />
      </section>

      <section className="app-canvas relative flex min-h-svh items-center justify-center px-4 py-20 sm:px-8 lg:px-12">
        <div className="absolute top-5 left-5 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark logoUrl={logoUrl} className="size-8" />
            <span className="text-sm font-bold">{dict.common.appName}</span>
          </Link>
        </div>
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-[31rem]">{children}</div>
      </section>
    </main>
  );
}
