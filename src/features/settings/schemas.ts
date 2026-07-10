import { z } from "zod";

export const organizationSettingsSchema = z.object({
  name: z.string().min(2, "ชื่อองค์กรต้องยาวอย่างน้อย 2 ตัวอักษร").max(100),
});

// Each control on the settings page auto-saves independently (see
// system-settings-form.tsx), so every field here must be optional — a save
// only ever sends the one field that changed, not a full snapshot.
export const systemSettingsSchema = z.object({
  showLoginDemoAccounts: z.boolean().optional(),
  // Data URL, client-side resized — same storage-free approach as
  // Product.imageUrl (see features/products/schemas.ts). null clears the
  // custom logo back to the default mark.
  logoUrl: z
    .string()
    .max(2_000_000, "ไฟล์รูปภาพใหญ่เกินไป")
    .refine((v) => v.startsWith("data:image/"), "รูปภาพไม่ถูกต้อง")
    .nullable()
    .optional(),
});

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
