"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateSystemSettingsAction } from "@/features/settings/actions";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SystemSettingsForm({
  showLoginDemoAccounts,
}: {
  showLoginDemoAccounts: boolean;
}) {
  const { dict } = useLanguage();
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const result = await updateSystemSettingsAction({
        showLoginDemoAccounts: checked,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(dict.settings.settingsSaved);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{dict.settings.loginPageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-md border p-3">
          <div>
            <Label htmlFor="show-demo-accounts">{dict.settings.showDemoAccounts}</Label>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              {dict.settings.showDemoAccountsDesc}
            </p>
          </div>
          <Switch
            id="show-demo-accounts"
            checked={showLoginDemoAccounts}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
