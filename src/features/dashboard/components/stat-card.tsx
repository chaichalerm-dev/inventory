import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  emphasis?: "default" | "warning";
};

export function StatCard({ title, value, icon: Icon, emphasis = "default" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-2xl font-semibold",
            emphasis === "warning" && value > 0 && "text-destructive",
          )}
        >
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
