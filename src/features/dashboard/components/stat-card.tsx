import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type StatTone = "blue" | "green" | "amber" | "red" | "violet";

const toneClasses: Record<StatTone, string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  red: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
};

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  tone?: StatTone;
  suffix?: string;
};

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "blue",
  suffix,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">
            {value.toLocaleString()}
            {suffix ? (
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                {suffix}
              </span>
            ) : null}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
