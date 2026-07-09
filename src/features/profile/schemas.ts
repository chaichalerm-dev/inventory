import { z } from "zod";

// Stored as a data URL (client-side resized before upload — see
// avatar-upload.tsx) rather than a hosted file, since no object storage is
// wired up for this project. null clears the picture back to the default
// user icon.
export const updateAvatarSchema = z.object({
  avatarUrl: z
    .string()
    .max(2_000_000, "ไฟล์รูปภาพใหญ่เกินไป")
    .refine((v) => v.startsWith("data:image/"), "รูปภาพไม่ถูกต้อง")
    .nullable(),
});

export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
