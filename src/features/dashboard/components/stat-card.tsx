import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type StatTone = "blue" | "green" | "amber" | "red" | "violet";

const toneClasses: Record<StatTone, string> = {
  blue: "bg-sky-700 text-white dark:bg-sky-600",
  green: "bg-emerald-700 text-white dark:bg-emerald-600",
  amber: "bg-amber-500 text-amber-950 dark:bg-amber-400",
  red: "bg-[#d85c43] text-white",
  violet: "bg-violet-700 text-white dark:bg-violet-600",
};

const toneRuleClasses: Record<StatTone, string> = {
  blue: "bg-sky-700 dark:bg-sky-500",
  green: "bg-emerald-700 dark:bg-emerald-500",
  amber: "bg-amber-500 dark:bg-amber-400",
  red: "bg-[#d85c43]",
  violet: "bg-violet-700 dark:bg-violet-500",
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
    <Card className="relative min-h-32 overflow-hidden">
      <span className={`absolute inset-x-0 top-0 h-[3px] ${toneRuleClasses[tone]}`} aria-hidden="true" />
      <CardContent className="flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-[-0.045em] tabular-nums">
            {value.toLocaleString()}
            {suffix ? (
              <span className="ml-2 text-xs font-medium tracking-normal text-muted-foreground">
                {suffix}
              </span>
            ) : null}
          </p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-[2px] ${toneClasses[tone]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
