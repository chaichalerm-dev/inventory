import { Badge } from "@/components/ui/badge";

type StockBadgeProps = {
  quantity: number;
  minStock: number;
  unit: string;
};

export function StockBadge({ quantity, minStock, unit }: StockBadgeProps) {
  const isOut = quantity <= 0;
  const isLow = !isOut && quantity <= minStock;

  return (
    <span className="flex items-center gap-2">
      <span className="tabular-nums">
        {quantity.toLocaleString()} {unit}
      </span>
      {isOut ? <Badge variant="destructive">Out of stock</Badge> : null}
      {isLow ? (
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">
          Low
        </Badge>
      ) : null}
    </span>
  );
}
