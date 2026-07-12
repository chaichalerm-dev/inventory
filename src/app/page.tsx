import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Package,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getSystemSettings } from "@/features/settings/queries";
import { hasActiveSession } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "StockPro · ระบบจัดการคลังสินค้า",
  description: "จัดการสต็อกสินค้า คำขอเบิก-คืน และรายงานภาพรวมธุรกิจได้ในที่เดียว",
};

export default async function LandingPage() {
  const [{ logoUrl }, signedIn, dict] = await Promise.all([
    getSystemSettings(),
    hasActiveSession(),
    getLocale().then(getDictionary),
  ]);

  const features = [
    {
      icon: Package,
      title: dict.landing.featureStockTitle,
      desc: dict.landing.featureStockDesc,
    },
    {
      icon: ArrowLeftRight,
      title: dict.landing.featureRequisitionTitle,
      desc: dict.landing.featureRequisitionDesc,
    },
    {
      icon: BarChart3,
      title: dict.landing.featureReportsTitle,
      desc: dict.landing.featureReportsDesc,
    },
    {
      icon: ShieldCheck,
      title: dict.landing.featureRolesTitle,
      desc: dict.landing.featureRolesDesc,
    },
  ];

  const previewStats = [
    { icon: Package, value: "128", label: dict.dashboard.admin.totalProducts },
    { icon: CheckCircle2, value: "96", label: dict.dashboard.admin.inStock },
    { icon: AlertTriangle, value: "14", label: dict.dashboard.admin.lowStock },
    { icon: XCircle, value: "2", label: dict.dashboard.admin.outOfStock },
  ];
  const previewBars = [40, 65, 50, 80, 60, 90, 70];

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="size-full object-cover" />
              ) : (
                <Boxes className="size-4" aria-hidden="true" />
              )}
            </span>
            <span className="font-heading text-lg font-bold">{dict.common.appName}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {signedIn ? (
              <Button asChild size="sm">
                <Link href="/dashboard">{dict.landing.navGoToDashboard}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sign-in">{dict.landing.navSignIn}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">{dict.landing.navGetStarted}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[-8rem] -z-10 flex justify-center"
          >
            <div className="size-[36rem] rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {dict.landing.heroEyebrow}
              </Badge>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {dict.landing.heroTitle}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                {dict.landing.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={signedIn ? "/dashboard" : "/sign-up"}>
                    {signedIn ? dict.landing.navGoToDashboard : dict.landing.heroCtaPrimary}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                {!signedIn && (
                  <Button asChild variant="outline" size="lg">
                    <Link href="/sign-in">{dict.landing.heroCtaSecondary}</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Illustrative product preview — mirrors the real dashboard's
                stat-tile + chart layout, not live data. */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
              <Card className="border-border/80 shadow-xl">
                <CardContent className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-destructive/30" />
                      <span className="size-2.5 rounded-full bg-chart-3/60" />
                      <span className="size-2.5 rounded-full bg-primary/40" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {dict.common.appName} · {dict.dashboard.admin.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {previewStats.map(({ icon: Icon, value, label }) => (
                      <div key={label} className="rounded-lg border border-border/70 p-3">
                        <Icon className="size-4 text-primary" aria-hidden="true" />
                        <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-border/70 p-3">
                    <p className="mb-3 text-xs font-medium text-muted-foreground">
                      {dict.dashboard.admin.movementChartTitle}
                    </p>
                    <div className="flex h-16 items-end gap-2">
                      {previewBars.map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-primary/70"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {dict.landing.featuresTitle}
              </h2>
              <p className="mt-3 text-muted-foreground">{dict.landing.featuresSubtitle}</p>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-heading font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role split */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              {dict.auth.roleSplitTitle}
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="overflow-hidden rounded-xl border bg-card">
                <div className="h-1 bg-primary" />
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                    <h3 className="font-heading font-semibold">Admin</h3>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {dict.auth.adminFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border bg-card">
                <div className="h-1 bg-muted-foreground/30" />
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <Boxes className="size-5 text-muted-foreground" aria-hidden="true" />
                    <h3 className="font-heading font-semibold">{dict.auth.userRoleLabel}</h3>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {dict.auth.userFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        {!signedIn && (
          <section className="border-t py-20 sm:py-28">
            <div className="mx-auto max-w-4xl px-4">
              <div className="rounded-2xl border bg-muted/30 px-6 py-14 text-center sm:px-14">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {dict.landing.ctaTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  {dict.landing.ctaSubtitle}
                </p>
                <Button asChild size="lg" className="mt-8">
                  <Link href="/sign-up">
                    {dict.landing.ctaButton}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="size-full object-cover" />
              ) : (
                <Boxes className="size-3.5" aria-hidden="true" />
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {dict.common.appName} — {dict.common.tagline}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/sign-in" className="hover:text-foreground">
              {dict.landing.navSignIn}
            </Link>
            <Link href="/sign-up" className="hover:text-foreground">
              {dict.landing.navGetStarted}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
