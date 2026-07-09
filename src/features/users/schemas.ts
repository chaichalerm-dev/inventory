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

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type AssignableRole = z.infer<typeof assignableRoleSchema>;
