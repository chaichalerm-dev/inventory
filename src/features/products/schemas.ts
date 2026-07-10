import { z } from "zod";

/** Sentinel for "no category" in the form's Select (Radix forbids ""). */
export const NO_CATEGORY = "none";

export const productSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(50),
  name: z.string().trim().min(1, "Name is required").max(150),
  description: z.string().trim().max(500).optional(),
  // Data URL, client-side resized — same storage-free approach as
  // User.avatarUrl (see profile/schemas.ts). null clears the photo.
  imageUrl: z
    .string()
    .max(2_000_000, "ไฟล์รูปภาพใหญ่เกินไป")
    .refine((v) => v.startsWith("data:image/"), "รูปภาพไม่ถูกต้อง")
    .nullable()
    .optional(),
  categoryId: z.string().min(1),
  unit: z.string().trim().min(1, "Unit is required").max(20),
  // Plain z.number() (not z.coerce) so the schema's input and output types
  // match — required for React Hook Form's generics. Number inputs convert
  // strings via valueAsNumber at the field level.
  price: z.number("Enter a valid price").min(0, "Price cannot be negative"),
  costPrice: z.number("Enter a valid cost").min(0, "Cost cannot be negative"),
  minStock: z
    .number("Enter a valid quantity")
    .int("Must be a whole number")
    .min(0),
});

export type ProductInput = z.infer<typeof productSchema>;
