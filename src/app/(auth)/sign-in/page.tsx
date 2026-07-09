import type { Metadata } from "next";
import { Boxes, Check, ShieldCheck, UserRound } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

const adminFeatures = [
  "จัดการข้อมูลทั้งหมด",
  "เพิ่ม / แก้ไข / ลบสินค้า",
  "จัดการผู้ใช้งาน",
  "ดูรายงานและตั้งค่าระบบ",
];

const userFeatures = [
  "ดูรายการสินค้า",
  "ค้นหาและเบิกสินค้า",
  "แจ้งคืนสินค้า",
  "ดูประวัติของตนเอง",
];

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

      <Card>
        <CardContent className="pt-6">
          <SignInForm />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี? ติดต่อผู้ดูแลระบบของคุณ
        </CardFooter>
      </Card>

      <Card className="bg-muted/40">
        <CardContent className="pt-6">
          <p className="mb-4 text-center text-sm font-semibold">
            ระบบแยกตามสิทธิ์การใช้งาน
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                Admin
              </p>
              <ul className="space-y-1.5">
                {adminFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-1.5 text-xs text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative pl-4">
              <Separator orientation="vertical" className="absolute left-0" />
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <UserRound className="size-4 text-primary" aria-hidden="true" />
                User (พนักงาน)
              </p>
              <ul className="space-y-1.5">
                {userFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-1.5 text-xs text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
