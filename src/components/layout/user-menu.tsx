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
import { useLanguage } from "@/lib/i18n/language-provider";

type UserMenuProps = {
  name: string;
  email: string;
  roleLabel: string;
  avatarUrl: string | null;
};

export function UserMenu({ name, email, roleLabel, avatarUrl }: UserMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { dict } = useLanguage();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={dict.nav.userMenu}
          >
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
              {dict.nav.profile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirmOpen(true)}>
            <LogOut className="size-4" />
            {dict.nav.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={dict.auth.signOutConfirmTitle}
        description={dict.auth.signOutConfirmDesc}
        confirmLabel={isPending ? dict.auth.signingOut : dict.auth.signOutConfirm}
        onConfirm={handleSignOut}
      />
    </>
  );
}
