"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteUserAction } from "@/features/users/actions";
import { inviteUserSchema, type InviteUserInput } from "@/features/users/schemas";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormRootError } from "@/components/shared/form-root-error";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const { dict } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {dict.users.addUser}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" aria-hidden="true" />
            {dict.users.addUserDialogTitle}
          </DialogTitle>
          <DialogDescription>{dict.users.addUserDialogDesc}</DialogDescription>
        </DialogHeader>
        {/* Radix unmounts DialogContent children on close, so this form
            remounts with fresh state every time the dialog opens. */}
        <InviteUserForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function InviteUserForm({ onDone }: { onDone: () => void }) {
  const { dict } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "MEMBER" },
  });

  function onSubmit(values: InviteUserInput) {
    setRootError(null);
    startTransition(async () => {
      const result = await inviteUserAction(values);
      if (!result.ok) {
        setRootError(result.error);
        if (result.fieldErrors?.email?.[0]) {
          form.setError("email", { message: result.fieldErrors.email[0] });
        }
        return;
      }
      toast.success(dict.users.addUserSuccess);
      onDone();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.users.fullName}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.users.email}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.users.initialPassword}</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.users.role}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MEMBER">{dict.users.roleUser}</SelectItem>
                  <SelectItem value="ADMIN">{dict.users.roleAdmin}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootError message={rootError} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? dict.common.saving : dict.users.addUser}
        </Button>
      </form>
    </Form>
  );
}
