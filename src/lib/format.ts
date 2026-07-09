// Currency-agnostic for now; swap to Intl currency formatting once the
// organization gets a currency setting.
const moneyFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: number): string {
  return moneyFormat.format(value);
}

// th-TH defaults to the Buddhist calendar, e.g. "9 ก.ค. 2569".
const thaiDateFormat = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// en-GB gives "9 Jul 2026" — day-first, matching the Thai format's order.
const enDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDateThai(value: Date | string): string {
  return thaiDateFormat.format(typeof value === "string" ? new Date(value) : value);
}

/** Locale-aware date formatting — Buddhist calendar for "th", Gregorian for "en". */
export function formatDate(value: Date | string, locale: "th" | "en"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return locale === "th" ? thaiDateFormat.format(date) : enDateFormat.format(date);
}

