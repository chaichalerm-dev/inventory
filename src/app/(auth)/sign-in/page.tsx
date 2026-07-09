import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="size-6" aria-hidden="true" />
          </span>
          <div className="text-left">
            <p className="text-xl font-bold leading-tight">StockPro</p>
            <p className="text-xs text-muted-foreground">
              Inventory Management System
            </p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome Back!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เข้าสู่ระบบเพื่อเริ่มใช้งาน
        </p>
      </div>

      <SignInForm />
    </div>
  );
}
