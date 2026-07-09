import type { Locale } from "@/lib/i18n/types";
import th, { type Dictionary } from "@/lib/i18n/dictionaries/th";
import en from "@/lib/i18n/dictionaries/en";

const dictionaries: Record<Locale, Dictionary> = { th, en };

// Pure — safe to call from both Server and Client Components.
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

// Minimal {placeholder} substitution — the dictionaries have no plural
// rules or nesting complex enough to warrant a full ICU library.
export function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export type { Dictionary };
