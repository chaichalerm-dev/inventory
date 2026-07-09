"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { signInAction } from "@/features/auth/actions";
import { signInSchema, type Portal, type SignInInput } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-5">
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
    </div>
  );
}
