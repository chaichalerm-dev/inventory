import { z } from "zod";

export const requisitionItemSchema = z.object({
  productId: z.string().min(1, "กรุณาเลือกสินค้า"),
  quantity: z
    .number("กรุณากรอกจำนวน")
    .int("จำนวนต้องเป็นจำนวนเต็ม")
    .min(1, "จำนวนต้องอย่างน้อย 1"),
});

export const requisitionSchema = z.object({
  note: z.string().max(500, "หมายเหตุยาวเกินไป").optional(),
  items: z
    .array(requisitionItemSchema)
    .min(1, "ต้องมีสินค้าอย่างน้อย 1 รายการ"),
});

export type RequisitionInput = z.infer<typeof requisitionSchema>;
