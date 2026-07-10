"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { MemberRow } from "@/features/users/queries";
import { updateMemberAction } from "@/features/users/actions";
import {
  editMemberFormSchema,
  type EditMemberFormInput,
} from "@/features/users/schemas";
import { useLanguage } from "@/lib/i18n/language-provider";
import { interpolate } from "@/lib/i18n/get-dictionary";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormRootError } from "@/components/shared/form-root-error";
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter";

// The database stores one `name` field — split naively on the first space
// so "สมชาย ใจดี" becomes ชื่อ="สมชาย" นามสกุล="ใจดี". A one-word name
// (no space) lands entirely in ชื่อ, leaving นามสกุล for the admin to fill.
function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

export function EditMemberDialog({ member }: { member: MemberRow }) {
  const [open, setOpen] = useState(false);
  const { dict } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${dict.common.edit} ${member.name}`}
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.users.editUserDialogTitle}</DialogTitle>
          <DialogDescription>
            {interpolate(dict.users.editUserDialogDesc, { name: member.name })}
          </DialogDescription>
        </DialogHeader>
        {/* Radix unmounts DialogContent children on close, so this form
            remounts with fresh state every time the dialog opens. */}
        <EditMemberForm member={member} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EditMemberForm({
  member,
  onDone,
}: {
  member: MemberRow;
  onDone: () => void;
}) {
  const { dict } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { firstName, lastName } = splitName(member.name);
  const form = useForm<EditMemberFormInput>({
    resolver: zodResolver(editMemberFormSchema),
    defaultValues: {
      firstName,
      lastName,
      email: member.email,
      password: "",
      confirmPassword: "",
    },
  });

  // useWatch (not form.watch) so the React Compiler can memoize this
  // component — watch() returns unmemoizable functions and disables it.
  const password = useWatch({ control: form.control, name: "password" });

  function onSubmit(values: EditMemberFormInput) {
    setRootError(null);
    const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
    startTransition(async () => {
      const result = await updateMemberAction(member.membershipId, {
        name,
        email: values.email,
        password: values.password,
      });
      if (!result.ok) {
        setRootError(result.error);
        if (result.fieldErrors?.email?.[0]) {
          form.setError("email", { message: result.fieldErrors.email[0] });
        }
        return;
      }
      toast.success(dict.users.saveUserSuccess);
      onDone();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.users.firstName}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.users.lastName}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
              <FormLabel>{dict.users.newPassword}</FormLabel>
              <FormControl>
                <PasswordInput
                  field={field}
                  visible={showPassword}
                  onToggleVisible={() => setShowPassword((v) => !v)}
                />
              </FormControl>
              <PasswordStrengthMeter password={password} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.users.confirmNewPassword}</FormLabel>
              <FormControl>
                <PasswordInput
                  field={field}
                  visible={showConfirmPassword}
                  onToggleVisible={() => setShowConfirmPassword((v) => !v)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootError message={rootError} />
        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !form.formState.isDirty}
        >
          {isPending ? dict.common.saving : dict.common.saveChanges}
        </Button>
      </form>
    </Form>
  );
}

function PasswordInput({
  field,
  visible,
  onToggleVisible,
}: {
  field: ControllerRenderProps<EditMemberFormInput, "password" | "confirmPassword">;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  const { dict } = useLanguage();
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        className="pr-10"
        {...field}
      />
      <button
        type="button"
        onClick={onToggleVisible}
        aria-label={visible ? dict.auth.hidePassword : dict.auth.showPassword}
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-muted-foreground hover:text-foreground"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
