"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateOrganizationAction } from "@/features/settings/actions";
import {
  organizationSettingsSchema,
  type OrganizationSettingsInput,
} from "@/features/settings/schemas";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormRootError } from "@/components/shared/form-root-error";

export function OrganizationSettingsForm({
  organizationName,
}: {
  organizationName: string;
}) {
  const { dict } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<OrganizationSettingsInput>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: { name: organizationName },
  });

  function onSubmit(values: OrganizationSettingsInput) {
    setRootError(null);
    startTransition(async () => {
      const result = await updateOrganizationAction(values);
      if (!result.ok) {
        setRootError(result.error);
        return;
      }
      toast.success(dict.settings.settingsSaved);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dict.settings.orgInfoTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-sm space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.settings.orgName}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormRootError message={rootError} />
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending ? dict.common.saving : dict.common.saveChanges}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
