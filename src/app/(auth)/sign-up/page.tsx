import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const metadata: Metadata = { title: "สร้างบัญชี · Create account" };

export default async function SignUpPage() {
  const dict = getDictionary(await getLocale());

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.auth.signUpTitle}</CardTitle>
        <CardDescription>{dict.auth.signUpDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>
          {dict.auth.alreadyHaveAccount}{" "}
          <Link href="/sign-in" className="text-foreground underline underline-offset-4">
            {dict.auth.signIn}
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
