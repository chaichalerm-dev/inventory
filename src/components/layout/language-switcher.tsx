"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={dict.common.language}>
          <Languages className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className={cn(locale === "th" && "font-medium text-foreground")}
          onSelect={() => setLocale("th")}
        >
          {dict.common.thai}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(locale === "en" && "font-medium text-foreground")}
          onSelect={() => setLocale("en")}
        >
          {dict.common.english}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
