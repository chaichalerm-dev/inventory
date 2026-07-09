"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon, UserRound } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type UserMenuProps = {
  name: string;
  email: string;
  roleLabel: string;
  avatarUrl: string | null;
};

export function UserMenu({ name, email, roleLabel, avatarUrl }: UserMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="เมนูผู้ใช้">
            <Avatar className="size-8">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
              <AvatarFallback>
                <UserIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs font-normal text-muted-foreground">{email}</p>
            <p className="mt-1 text-xs font-normal text-muted-foreground">{roleLabel}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserRound className="size-4" />
              โปรไฟล์ของฉัน
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirmOpen(true)}>
            <LogOut className="size-4" />
            ออกจากระบบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ออกจากระบบ?"
        description="คุณต้องเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งานต่อ"
        confirmLabel={isPending ? "กำลังออกจากระบบ…" : "ออกจากระบบ"}
        onConfirm={handleSignOut}
      />
    </>
  );
}
