"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { signUpAction } from "@/features/auth/actions";
import { signUpFormSchema, type SignUpFormInput } from "@/features/auth/schemas";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormRootError } from "@/components/shared/form-root-error";
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter";

export function SignUpForm() {
  const { dict } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpFormInput>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      organizationName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // useWatch (not form.watch) so the React Compiler can memoize this
  // component — watch() returns unmemoizable functions and disables it.
  const password = useWatch({ control: form.control, name: "password" });

  function onSubmit(values: SignUpFormInput) {
    setRootError(null);
    const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
    startTransition(async () => {
      const result = await signUpAction({
        name,
        organizationName: values.organizationName,
        email: values.email,
        password: values.password,
      });
      if (!result.ok) setRootError(result.error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.users.firstName}</FormLabel>
                <FormControl>
                  <Input autoComplete="given-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.users.lastName}</FormLabel>
                <FormControl>
                  <Input autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.auth.organizationName}</FormLabel>
              <FormControl>
                <Input autoComplete="organization" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.auth.email}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
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
              <FormLabel>{dict.auth.password}</FormLabel>
              <FormControl>
                <PasswordInput
                  field={field}
                  visible={showPassword}
                  onToggleVisible={() => setShowPassword((v) => !v)}
                />
              </FormControl>
              <PasswordStrengthMeter password={password} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.auth.confirmPassword}</FormLabel>
              <FormControl>
                <PasswordInput
                  field={field}
                  visible={showConfirmPassword}
                  onToggleVisible={() => setShowConfirmPassword((v) => !v)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootError message={rootError} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? dict.auth.creatingAccount : dict.auth.createAccount}
        </Button>
      </form>
    </Form>
  );
}

function PasswordInput({
  field,
  visible,
  onToggleVisible,
}: {
  field: ControllerRenderProps<SignUpFormInput, "password" | "confirmPassword">;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  const { dict } = useLanguage();
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        className="pr-10"
        {...field}
      />
      <button
        type="button"
        onClick={onToggleVisible}
        aria-label={visible ? dict.auth.hidePassword : dict.auth.showPassword}
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-muted-foreground hover:text-foreground"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
