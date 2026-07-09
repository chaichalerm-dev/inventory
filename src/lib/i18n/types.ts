export type Locale = "th" | "en";

export const LOCALES: Locale[] = ["th", "en"];
export const DEFAULT_LOCALE: Locale = "th";
export const LOCALE_COOKIE = "stockpro-locale";

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as string[]).includes(value);
}
