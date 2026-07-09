"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import type { MemberRow } from "@/features/users/queries";
import { updateMemberAction } from "@/features/users/actions";
import { updateMemberSchema, type UpdateMemberInput } from "@/features/users/schemas";
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

export function EditMemberDialog({ member }: { member: MemberRow }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`แก้ไข ${member.name}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลผู้ใช้งาน</DialogTitle>
          <DialogDescription>
            แก้ไขชื่อ อีเมล หรือตั้งรหัสผ่านใหม่ให้ {member.name}
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
  const [isPending, startTransition] = useTransition();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<UpdateMemberInput>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: { name: member.name, email: member.email, password: "" },
  });

  function onSubmit(values: UpdateMemberInput) {
    setRootError(null);
    startTransition(async () => {
      const result = await updateMemberAction(member.membershipId, values);
      if (!result.ok) {
        setRootError(result.error);
        if (result.fieldErrors?.email?.[0]) {
          form.setError("email", { message: result.fieldErrors.email[0] });
        }
        return;
      }
      toast.success("บันทึกข้อมูลผู้ใช้งานแล้ว");
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
              <FormLabel>ชื่อ-นามสกุล</FormLabel>
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
              <FormLabel>อีเมล</FormLabel>
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
              <FormLabel>รหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormRootError message={rootError} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "กำลังบันทึก…" : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </form>
    </Form>
  );
}
