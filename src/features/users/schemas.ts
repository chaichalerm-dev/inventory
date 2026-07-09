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

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type AssignableRole = z.infer<typeof assignableRoleSchema>;
