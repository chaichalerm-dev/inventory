import { z } from "zod";

// Emails are normalized (trimmed + lowercased) at every entry point so
// "User@x.com" typed at sign-up and "user@x.com" typed at sign-in resolve
// to the same account — email is the User table's unique key.
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("กรุณากรอกอีเมลให้ถูกต้อง");

export const signInSchema = z.object({
  email: emailSchema,
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
  email: emailSchema,
  password: z.string().min(8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร").max(72),
});

// Client-side only shape: the database stores one `name` field, but the
// form splits it into ชื่อ/นามสกุล — SignUpForm joins them back into `name`
// before calling signUpAction, which still validates against signUpSchema.
// confirmPassword never leaves the client either — it exists purely so the
// form can catch a mistyped password before submitting.
export const signUpFormSchema = z
  .object({
    firstName: z.string().min(1, "กรุณากรอกชื่อ").max(50),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล").max(50),
    organizationName: z
      .string()
      .min(2, "ชื่อองค์กรต้องยาวอย่างน้อย 2 ตัวอักษร")
      .max(100),
    email: emailSchema,
    password: z.string().min(8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร").max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านยืนยันไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type Portal = z.infer<typeof portalSchema>;
export type SignInFormInput = z.infer<typeof signInFormSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignUpFormInput = z.infer<typeof signUpFormSchema>;
