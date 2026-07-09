"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateSystemSettingsAction } from "@/features/settings/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SystemSettingsForm({
  showLoginDemoAccounts,
}: {
  showLoginDemoAccounts: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const result = await updateSystemSettingsAction({
        showLoginDemoAccounts: checked,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("บันทึกการตั้งค่าแล้ว");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">หน้าเข้าสู่ระบบ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-md border p-3">
          <div>
            <Label htmlFor="show-demo-accounts">แสดงบัญชีทดลองใช้งานในหน้า Login</Label>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              ซ่อนกล่องอีเมล/รหัสผ่านตัวอย่างที่แสดงอยู่บนหน้าเข้าสู่ระบบ —
              การตั้งค่านี้มีผลกับทั้งระบบ ไม่ใช่เฉพาะองค์กรนี้
            </p>
          </div>
          <Switch
            id="show-demo-accounts"
            checked={showLoginDemoAccounts}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
