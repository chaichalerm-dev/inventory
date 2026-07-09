"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div>
        <h2 className="text-lg font-semibold">เกิดข้อผิดพลาด</h2>
        <p className="text-sm text-muted-foreground">
          {error.digest
            ? `รหัสอ้างอิงข้อผิดพลาด: ${error.digest}`
            : "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง"}
        </p>
      </div>
      <Button onClick={reset}>ลองใหม่อีกครั้ง</Button>
    </div>
  );
}
