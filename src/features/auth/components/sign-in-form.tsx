"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Eye,
  EyeOff,
  PlayCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { signInAction } from "@/features/auth/actions";
import { signInSchema, type Portal, type SignInInput } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormRootError } from "@/components/shared/form-root-error";

const REMEMBER_EMAIL_KEY = "stockpro.remembered-email";

// Public demo credentials — this project is set up for people to try live,
// so the accounts are shown right under the role they belong to.
type DemoAccount = { portal: Portal; email: string; password: string };

const ADMIN_DEMO: DemoAccount = {
  portal: "ADMIN",
  email: "admin@stockpro.test",
  password: "Demo@1234",
};
const USER_DEMO: DemoAccount = {
  portal: "USER",
  email: "user@stockpro.test",
  password: "Demo@1234",
};

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

export function SignInForm() {
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);
  const [portal, setPortal] = useState<Portal>("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    // One-time hydration from localStorage (a browser-only API unavailable
    // during SSR) — not state synchronized from props, so an effect is the
    // correct tool here despite the lint rule's default suspicion of it.
    const saved = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      form.setValue("email", saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRememberEmail(true);
    }
  }, [form]);

  function fillDemoAccount(account: DemoAccount) {
    setPortal(account.portal);
    form.setValue("email", account.email);
    form.setValue("password", account.password);
    setRootError(null);
  }

  function onSubmit(values: SignInInput) {
    setRootError(null);
    if (rememberEmail) {
      window.localStorage.setItem(REMEMBER_EMAIL_KEY, values.email);
    } else {
      window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
    startTransition(async () => {
      const result = await signInAction({ ...values, portal });
      if (!result.ok) setRootError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-5 pt-6">
          <Tabs value={portal} onValueChange={(value) => setPortal(value as Portal)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ADMIN">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Admin Login
              </TabsTrigger>
              <TabsTrigger value="USER">
                <UserRound className="size-4" aria-hidden="true" />
                User Login
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="กรอกอีเมลของคุณ"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="กรอกรหัสผ่าน"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" aria-hidden="true" />
                          ) : (
                            <Eye className="size-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-email"
                    checked={rememberEmail}
                    onCheckedChange={(checked) => setRememberEmail(checked === true)}
                  />
                  <Label htmlFor="remember-email" className="text-sm font-normal">
                    จดจำอีเมล
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน")
                  }
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              <FormRootError message={rootError} />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </Form>
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
              <DemoAccountBox account={ADMIN_DEMO} onUse={fillDemoAccount} />
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
              <DemoAccountBox account={USER_DEMO} onUse={fillDemoAccount} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DemoAccountBox({
  account,
  onUse,
}: {
  account: DemoAccount;
  onUse: (account: DemoAccount) => void;
}) {
  return (
    <div className="mt-3 space-y-1.5 rounded-md border border-dashed p-2">
      <p className="text-xs font-medium text-muted-foreground">ทดลองใช้งาน</p>
      <p className="break-all text-xs text-muted-foreground">{account.email}</p>
      <p className="text-xs text-muted-foreground">{account.password}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onUse(account)}
      >
        <PlayCircle className="size-3.5" aria-hidden="true" />
        ใช้บัญชีนี้
      </Button>
    </div>
  );
}
