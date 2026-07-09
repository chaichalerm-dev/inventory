import { cn } from "@/lib/utils";

type Strength = { score: 1 | 2 | 3 | 4; label: string; colorClass: string };

function getPasswordStrength(password: string): Strength {
  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  if (points <= 1) return { score: 1, label: "รหัสผ่านอ่อนแอ", colorClass: "bg-red-500" };
  if (points === 2) return { score: 2, label: "ปานกลาง", colorClass: "bg-amber-500" };
  if (points === 3) return { score: 3, label: "ดี", colorClass: "bg-blue-500" };
  return { score: 4, label: "แข็งแรงมาก", colorClass: "bg-emerald-500" };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, colorClass } = getPasswordStrength(password);

  return (
    <div className="space-y-1">
      <div className="flex gap-1" role="presentation">
        {([1, 2, 3, 4] as const).map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-muted",
              segment <= score && colorClass,
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
