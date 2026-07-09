import { z } from "zod";

export const organizationSettingsSchema = z.object({
  name: z.string().min(2, "ชื่อองค์กรต้องยาวอย่างน้อย 2 ตัวอักษร").max(100),
});

export const systemSettingsSchema = z.object({
  showLoginDemoAccounts: z.boolean(),
});

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
