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

export function formatDateThai(value: Date | string): string {
  return thaiDateFormat.format(typeof value === "string" ? new Date(value) : value);
}

