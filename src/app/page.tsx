import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  CheckCircle2,
  Package,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { BrandMark } from "@/components/brand/brand-mark";
import { getSystemSettings } from "@/features/settings/queries";
import { hasActiveSession } from "@/lib/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "StockPro · ระบบจัดการคลังสินค้า",
  description: "จัดการสต็อก คำขอเบิก-คืน และรายงานภาพรวมธุรกิจได้ในที่เดียว",
};

export default async function LandingPage() {
  const [{ logoUrl }, signedIn, dict] = await Promise.all([
    getSystemSettings(),
    hasActiveSession(),
    getLocale().then(getDictionary),
  ]);

  const features = [
    { icon: Package, title: dict.landing.featureStockTitle, desc: dict.landing.featureStockDesc },
    { icon: ArrowLeftRight, title: dict.landing.featureRequisitionTitle, desc: dict.landing.featureRequisitionDesc },
    { icon: BarChart3, title: dict.landing.featureReportsTitle, desc: dict.landing.featureReportsDesc },
    { icon: ShieldCheck, title: dict.landing.featureRolesTitle, desc: dict.landing.featureRolesDesc },
  ];

  const previewStats = [
    { icon: Package, value: "128", label: dict.dashboard.admin.totalProducts, tone: "bg-sky-700" },
    { icon: CheckCircle2, value: "96", label: dict.dashboard.admin.inStock, tone: "bg-emerald-700" },
    { icon: AlertTriangle, value: "14", label: dict.dashboard.admin.lowStock, tone: "bg-amber-500" },
    { icon: XCircle, value: "2", label: dict.dashboard.admin.outOfStock, tone: "bg-[#d85c43]" },
  ];
  const previewBars = [40, 65, 50, 80, 60, 90, 70];

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark logoUrl={logoUrl} className="size-9" />
            <span>
              <span className="block text-base font-bold leading-none tracking-[-0.025em]">{dict.common.appName}</span>
              <span className="mt-1 hidden text-[0.58rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase sm:block">{dict.common.tagline}</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            {signedIn ? (
              <Button asChild size="sm"><Link href="/dashboard">{dict.landing.navGoToDashboard}</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link href="/sign-in">{dict.landing.navSignIn}</Link></Button>
                <Button asChild size="sm" className="hidden sm:inline-flex"><Link href="/sign-up">{dict.landing.navGetStarted}</Link></Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="app-canvas relative overflow-hidden border-b">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-sidebar lg:block" aria-hidden="true" />
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative px-4 py-20 sm:px-6 sm:py-28 lg:py-36 lg:pr-14">
              <div className="mb-7 flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.15em] text-primary uppercase">
                <span className="h-px w-10 bg-primary" />
                {dict.landing.heroEyebrow}
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.15rem]">
                {dict.landing.heroTitle}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {dict.landing.heroSubtitle}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={signedIn ? "/dashboard" : "/sign-up"}>
                    {signedIn ? dict.landing.navGoToDashboard : dict.landing.heroCtaPrimary}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                {!signedIn && <Button asChild variant="outline" size="lg"><Link href="/sign-in">{dict.landing.heroCtaSecondary}</Link></Button>}
              </div>
              <div className="mt-12 flex gap-8 border-t pt-5 text-[0.68rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                <span>01 Stock</span><span>02 Request</span><span>03 Report</span>
              </div>
            </div>

            <div className="relative flex items-center bg-sidebar px-4 py-16 sm:px-10 lg:px-12 lg:py-24">
              <div className="paper-noise absolute inset-0 opacity-20" aria-hidden="true" />
              <div className="relative w-full border border-slate-300 bg-white p-4 text-slate-950 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-5">
                <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 bg-[#f17755]" /><span className="size-2 bg-amber-400" /><span className="size-2 bg-primary" />
                  </div>
                  <span className="font-mono text-[0.62rem] tracking-[0.08em] text-muted-foreground uppercase">{dict.common.appName} / {dict.dashboard.admin.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-px border bg-border">
                  {previewStats.map(({ icon: Icon, value, label, tone }) => (
                    <div key={label} className="relative bg-white p-4 text-slate-950">
                      <span className={`absolute top-0 left-0 h-full w-0.5 ${tone}`} />
                      <Icon className="size-4 text-slate-600" aria-hidden="true" />
                      <p className="mt-4 text-2xl font-bold tracking-[-0.04em] text-foreground">{value}</p>
                      <p className="mt-1 truncate text-[0.68rem] font-medium text-slate-600">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border border-slate-200 bg-white p-4 text-slate-950">
                  <p className="text-[0.68rem] font-semibold tracking-[0.06em] text-slate-600 uppercase">{dict.dashboard.admin.movementChartTitle}</p>
                  <div className="mt-5 flex h-24 items-end gap-2 border-b border-l px-2">
                    {previewBars.map((height, index) => <div key={index} className="flex-1 bg-primary/80" style={{ height: `${height}%` }} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
              <div>
                <p className="text-[0.68rem] font-bold tracking-[0.15em] text-primary uppercase">{dict.landing.heroEyebrow}</p>
                <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{dict.landing.featuresTitle}</h2>
                <p className="mt-4 max-w-md leading-7 text-muted-foreground">{dict.landing.featuresSubtitle}</p>
              </div>
              <div className="grid border-t sm:grid-cols-2">
                {features.map(({ icon: Icon, title, desc }, index) => (
                  <article key={title} className="group border-b p-6 sm:odd:border-r sm:p-8">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[0.68rem] text-muted-foreground">0{index + 1}</span>
                      <Icon className="size-5 text-primary transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-10 text-lg font-semibold tracking-[-0.02em]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col gap-4 border-l-[3px] border-[#f17755] pl-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{dict.auth.roleSplitTitle}</h2>
              <p className="font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground uppercase">Admin / {dict.auth.userRoleLabel}</p>
            </div>
            <div className="grid border bg-border md:grid-cols-2 md:gap-px">
              {[
                { title: "Admin", icon: ShieldCheck, items: dict.auth.adminFeatures, dark: true },
                { title: dict.auth.userRoleLabel, icon: Boxes, items: dict.auth.userFeatures, dark: false },
              ].map(({ title, icon: Icon, items, dark }) => (
                <div key={title} className={dark ? "bg-sidebar p-7 text-white sm:p-10" : "bg-background p-7 text-foreground sm:p-10"}>
                  <div className="flex items-center gap-3 border-b border-current/15 pb-5">
                    <Icon className={dark ? "size-5 text-sidebar-primary" : "size-5 text-primary"} aria-hidden="true" />
                    <h3 className="text-xl font-bold">{title}</h3>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {items.map((item) => <li key={item} className={`flex items-start gap-3 text-sm ${dark ? "text-white/80" : "text-muted-foreground"}`}><Check className={`mt-0.5 size-4 shrink-0 ${dark ? "text-sidebar-primary" : "text-primary"}`} />{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!signedIn && (
          <section className="border-t bg-sidebar py-20 text-white sm:py-24">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[0.68rem] font-bold tracking-[0.15em] text-sidebar-primary uppercase">{dict.landing.heroEyebrow}</p>
                <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{dict.landing.ctaTitle}</h2>
                <p className="mt-4 max-w-xl leading-7 text-white/80">{dict.landing.ctaSubtitle}</p>
              </div>
              <Button asChild size="lg" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"><Link href="/sign-up">{dict.landing.ctaButton}<ArrowRight className="size-4" /></Link></Button>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} {dict.common.appName} · {dict.common.tagline}</span>
          <div className="flex items-center gap-5"><Link href="/sign-in" className="hover:text-foreground">{dict.landing.navSignIn}</Link><Link href="/sign-up" className="hover:text-foreground">{dict.landing.navGetStarted}</Link></div>
        </div>
      </footer>
    </div>
  );
}
