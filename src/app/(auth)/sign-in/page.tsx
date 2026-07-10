import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { getSystemSettings } from "@/features/settings/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ · Sign in" };

export default async function SignInPage() {
  const [{ showLoginDemoAccounts, logoUrl }, dict] = await Promise.all([
    getSystemSettings(),
    getLocale().then(getDictionary),
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <Boxes className="size-6" aria-hidden="true" />
            )}
          </span>
          <div className="text-left">
            <p className="text-xl font-bold leading-tight">{dict.common.appName}</p>
            <p className="text-xs text-muted-foreground">{dict.common.tagline}</p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.auth.welcomeBack}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.auth.signInSubtitle}</p>
      </div>

      <SignInForm showDemoAccounts={showLoginDemoAccounts} />
    </div>
  );
}
