"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { updateSystemSettingsAction } from "@/features/settings/actions";
import { resizeImageToDataUrl } from "@/lib/image";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/brand-mark";

const MAX_LOGO_DIMENSION = 256;
const MAX_LOGO_BYTES = 8 * 1024 * 1024;

export function SystemSettingsForm({
  showLoginDemoAccounts,
  logoUrl,
}: {
  showLoginDemoAccounts: boolean;
  logoUrl: string | null;
}) {
  const { dict } = useLanguage();
  const router = useRouter();
  const [isTogglePending, startToggleTransition] = useTransition();
  const [isLogoPending, startLogoTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(logoUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleToggle(checked: boolean) {
    startToggleTransition(async () => {
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

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(dict.settings.invalidLogoImage);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error(dict.settings.logoTooLarge);
      return;
    }

    let dataUrl: string;
    try {
      dataUrl = await resizeImageToDataUrl(file, MAX_LOGO_DIMENSION);
    } catch {
      toast.error(dict.settings.logoProcessError);
      return;
    }

    const previous = preview;
    setPreview(dataUrl);
    startLogoTransition(async () => {
      const result = await updateSystemSettingsAction({ logoUrl: dataUrl });
      if (!result.ok) {
        toast.error(result.error);
        setPreview(previous);
        return;
      }
      toast.success(dict.settings.logoUpdated);
      router.refresh();
    });
  }

  function handleRemoveLogo() {
    startLogoTransition(async () => {
      const result = await updateSystemSettingsAction({ logoUrl: null });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPreview(null);
      toast.success(dict.settings.logoRemoved);
      router.refresh();
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{dict.settings.brandingTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <BrandMark logoUrl={preview} className="size-16 border border-border" />
            <div className="flex flex-col gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLogoPending}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-4" />
                {preview ? dict.settings.changeLogo : dict.settings.uploadLogo}
              </Button>
              {preview ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isLogoPending}
                  onClick={handleRemoveLogo}
                >
                  <Trash2 className="size-4" />
                  {dict.settings.removeLogo}
                </Button>
              ) : null}
            </div>
          </div>
          <p className="mt-3 max-w-md text-xs text-muted-foreground">
            {dict.settings.brandingDesc}
          </p>
        </CardContent>
      </Card>
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
              disabled={isTogglePending}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
