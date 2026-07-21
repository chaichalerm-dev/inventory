"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useLanguage();
  const nextLocale = locale === "th" ? "en" : "th";
  const nextLabel = locale === "th" ? dict.common.english : dict.common.thai;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`${dict.common.language}: ${nextLabel}`}
      title={nextLabel}
      onClick={() => setLocale(nextLocale)}
    >
      <Languages className="size-4" aria-hidden="true" />
    </Button>
  );
}
