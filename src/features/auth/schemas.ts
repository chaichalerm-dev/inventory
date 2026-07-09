import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

// The sign-in page has two tabs; the chosen portal travels with the form so
// the server can verify the account's role matches the tab.
export const portalSchema = z.enum(["ADMIN", "USER"]);

export const signInFormSchema = signInSchema.extend({
  portal: portalSchema,
});

export const signUpSchema = z.object({
  name: z.string().min(2, "ชื่อต้องยาวอย่างน้อย 2 ตัวอักษร").max(100),
  organizationName: z
    .string()
    .min(2, "ชื่อองค์กรต้องยาวอย่างน้อย 2 ตัวอักษร")
    .max(100),
  email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร").max(72),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type Portal = z.infer<typeof portalSchema>;
export type SignInFormInput = z.infer<typeof signInFormSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
