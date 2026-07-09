import { z } from "zod";

// Org admins can only grant ADMIN or MEMBER — OWNER belongs solely to the
// account that created the organization.
export const assignableRoleSchema = z.enum(["ADMIN", "MEMBER"]);

export const inviteUserSchema = z.object({
  name: z.string().min(2, "ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร").max(100),
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร").max(72),
  role: assignableRoleSchema,
});

// Password is optional here — an empty string means "keep the current
// password" so admins aren't forced to reset it just to fix a typo'd name.
export const updateMemberSchema = z.object({
  name: z.string().min(2, "ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร").max(100),
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z
    .union([z.literal(""), z.string().min(8).max(72)])
    .refine((v) => v === "" || v.length >= 8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร"),
});

// Client-side only shape for the edit dialog: the database stores one
// `name` field, but the form splits it into ชื่อ/นามสกุล for editing —
// EditMemberDialog joins them back into `name` before calling the server
// action, which still validates against updateMemberSchema above.
// confirmPassword never leaves the client either — it exists purely so the
// form can catch a mistyped password before submitting.
export const editMemberFormSchema = z
  .object({
    firstName: z.string().min(1, "กรุณากรอกชื่อ").max(50),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล").max(50),
    email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
    password: z
      .union([z.literal(""), z.string().min(8).max(72)])
      .refine((v) => v === "" || v.length >= 8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านยืนยันไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type EditMemberFormInput = z.infer<typeof editMemberFormSchema>;
export type AssignableRole = z.infer<typeof assignableRoleSchema>;
