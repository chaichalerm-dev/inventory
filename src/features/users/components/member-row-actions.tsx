"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { MemberRow } from "@/features/users/queries";
import { removeMemberAction, updateMemberRoleAction } from "@/features/users/actions";
import type { AssignableRole } from "@/features/users/schemas";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EditMemberDialog } from "@/features/users/components/edit-member-dialog";

export function MemberRowActions({
  member,
  isSelf,
}: {
  member: MemberRow;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (member.role === "OWNER") {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">เจ้าของระบบ</span>
        <EditMemberDialog member={member} />
      </div>
    );
  }

  function handleRoleChange(role: AssignableRole) {
    startTransition(async () => {
      const result = await updateMemberRoleAction(member.membershipId, role);
      if (!result.ok) toast.error(result.error);
      else toast.success("เปลี่ยนสิทธิ์การใช้งานแล้ว");
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeMemberAction(member.membershipId);
      if (!result.ok) toast.error(result.error);
      else toast.success("ลบผู้ใช้งานออกจากระบบแล้ว");
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Select
        value={member.role}
        onValueChange={(value) => handleRoleChange(value as AssignableRole)}
        disabled={isPending || isSelf}
      >
        <SelectTrigger className="w-36" aria-label={`สิทธิ์ของ ${member.name}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MEMBER">พนักงาน (User)</SelectItem>
          <SelectItem value="ADMIN">ผู้ดูแลระบบ (Admin)</SelectItem>
        </SelectContent>
      </Select>
      <EditMemberDialog member={member} />
      <Button
        variant="ghost"
        size="icon"
        aria-label={`ลบ ${member.name}`}
        disabled={isPending || isSelf}
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`ลบ "${member.name}" ออกจากระบบ?`}
        description="ผู้ใช้งานนี้จะไม่สามารถเข้าสู่ระบบขององค์กรนี้ได้อีก"
        confirmLabel="ลบผู้ใช้งาน"
        onConfirm={handleRemove}
      />
    </div>
  );
}
