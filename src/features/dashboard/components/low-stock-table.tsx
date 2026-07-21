import Link from "next/link";
import { CircleCheck } from "lucide-react";
import type { LowStockProduct } from "@/features/dashboard/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LowStockTableProps = {
  products: LowStockProduct[];
  title: string;
  viewAllLabel: string;
  noLowStockLabel: string;
  outOfStockLabel: string;
  lowLabel: string;
};

export function LowStockTable({
  products,
  title,
  viewAllLabel,
  noLowStockLabel,
  outOfStockLabel,
  lowLabel,
}: LowStockTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link
          href="/products"
          className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          {viewAllLabel}
        </Link>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <CircleCheck
              className="size-6 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            {noLowStockLabel}
          </p>
        ) : (
          <ul className="divide-y">
            {products.map((product) => {
              const isOut = product.quantity === 0;
              return (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-2 py-3 text-sm"
                >
                  <span className="min-w-0 truncate">{product.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "tabular-nums text-muted-foreground",
                        isOut && "font-medium text-destructive",
                      )}
                    >
                      {product.quantity} {product.unit}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-transparent",
                        isOut
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                      )}
                    >
                      {isOut ? outOfStockLabel : lowLabel}
                    </Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
