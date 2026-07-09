"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-provider";
import { interpolate } from "@/lib/i18n/get-dictionary";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dict } = useLanguage();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div>
        <h2 className="text-lg font-semibold">{dict.errors.generic}</h2>
        <p className="text-sm text-muted-foreground">
          {error.digest
            ? interpolate(dict.errors.errorRef, { digest: error.digest })
            : dict.errors.unexpected}
        </p>
      </div>
      <Button onClick={reset}>{dict.errors.tryAgain}</Button>
    </div>
  );
}
