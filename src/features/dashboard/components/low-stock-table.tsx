import Link from "next/link";
import { CircleCheck } from "lucide-react";
import type { LowStockProduct } from "@/features/dashboard/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LowStockTable({ products }: { products: LowStockProduct[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">สินค้าใกล้หมด / หมดสต็อก</CardTitle>
        <Link
          href="/products"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          ดูทั้งหมด
        </Link>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <CircleCheck className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            ไม่มีสินค้าใกล้หมด
          </p>
        ) : (
          <ul className="divide-y">
            {products.map((product) => {
              const isOut = product.quantity === 0;
              return (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-2 py-2.5 text-sm"
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
                      {isOut ? "หมดสต็อก" : "ใกล้หมด"}
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
