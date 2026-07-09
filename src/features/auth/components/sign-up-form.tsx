"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpAction } from "@/features/auth/actions";
import { signUpSchema, type SignUpInput } from "@/features/auth/schemas";
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

export function SignUpForm() {
  const { dict } = useLanguage();
  const fields = [
    { name: "name", label: dict.auth.yourName, type: "text", autoComplete: "name" },
    {
      name: "organizationName",
      label: dict.auth.organizationName,
      type: "text",
      autoComplete: "organization",
    },
    { name: "email", label: dict.auth.email, type: "email", autoComplete: "email" },
    {
      name: "password",
      label: dict.auth.password,
      type: "password",
      autoComplete: "new-password",
    },
  ] as const;
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", organizationName: "", email: "", password: "" },
  });

  function onSubmit(values: SignUpInput) {
    setRootError(null);
    startTransition(async () => {
      const result = await signUpAction(values);
      if (!result.ok) setRootError(result.error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {fields.map(({ name, label, type, autoComplete }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input type={type} autoComplete={autoComplete} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <FormRootError message={rootError} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? dict.auth.creatingAccount : dict.auth.createAccount}
        </Button>
      </form>
    </Form>
  );
}
