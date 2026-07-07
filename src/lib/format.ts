// Currency-agnostic for now; swap to Intl currency formatting once the
// organization gets a currency setting.
const moneyFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: number): string {
  return moneyFormat.format(value);
}
