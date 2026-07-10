"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { MemberRow } from "@/features/users/queries";
import { removeMemberAction, updateMemberRoleAction } from "@/features/users/actions";
import type { AssignableRole } from "@/features/users/schemas";
import { useLanguage } from "@/lib/i18n/language-provider";
import { interpolate } from "@/lib/i18n/get-dictionary";
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
  const { dict } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (member.role === "OWNER") {
    // Only the owner may edit the owner (the server enforces this too) —
    // showing the dialog to other admins would just invite a failed save.
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">{dict.users.roleOwner}</span>
        {isSelf ? <EditMemberDialog member={member} /> : null}
      </div>
    );
  }

  function handleRoleChange(role: AssignableRole) {
    startTransition(async () => {
      const result = await updateMemberRoleAction(member.membershipId, role);
      if (!result.ok) toast.error(result.error);
      else toast.success(dict.users.roleChangeSuccess);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeMemberAction(member.membershipId);
      if (!result.ok) toast.error(result.error);
      else toast.success(dict.users.deleteSuccess);
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Select
        value={member.role}
        onValueChange={(value) => handleRoleChange(value as AssignableRole)}
        disabled={isPending || isSelf}
      >
        <SelectTrigger className="w-36" aria-label={`${dict.users.role} ${member.name}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MEMBER">{dict.users.roleUser}</SelectItem>
          <SelectItem value="ADMIN">{dict.users.roleAdmin}</SelectItem>
        </SelectContent>
      </Select>
      <EditMemberDialog member={member} />
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${dict.common.delete} ${member.name}`}
        disabled={isPending || isSelf}
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={interpolate(dict.users.deleteConfirmTitle, { name: member.name })}
        description={dict.users.deleteConfirmDesc}
        confirmLabel={dict.users.deleteUser}
        onConfirm={handleRemove}
      />
    </div>
  );
}
