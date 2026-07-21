import type { Metadata } from "next";
import { getSystemSettings } from "@/features/settings/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ · Sign in" };

export default async function SignInPage() {
  const [{ showLoginDemoAccounts }, dict] = await Promise.all([
    getSystemSettings(),
    getLocale().then(getDictionary),
  ]);

  return (
    <div className="space-y-7">
      <div className="border-l-[3px] border-primary pl-4">
        <p className="mb-1 text-[0.65rem] font-semibold tracking-[0.14em] text-primary uppercase">{dict.common.tagline}</p>
        <h1 className="text-3xl font-bold tracking-[-0.035em]">{dict.auth.welcomeBack}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{dict.auth.signInSubtitle}</p>
      </div>

      <SignInForm showDemoAccounts={showLoginDemoAccounts} />
    </div>
  );
}
