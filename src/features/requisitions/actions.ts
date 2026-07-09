"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  requisitionSchema,
  type RequisitionInput,
} from "@/features/requisitions/schemas";

// Thrown inside transactions to abort with a user-facing message.
class RequisitionError extends Error {}

// The pooled connection can be slow to hand out a transaction slot under
// load; surface this as a retryable message instead of a generic 500.
function isTransactionTimeout(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2028"
  );
}

function revalidateStockViews() {
  revalidatePath("/requisitions");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
}

export async function createRequisitionAction(
  input: RequisitionInput,
): Promise<ActionResult> {
  const { orgId, userId } = await requireSession();
  const parsed = requisitionSchema.safeParse(input);
  if (!parsed.success) {
    return fail("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }

  // Merge duplicate product rows so the unique(requisitionId, productId)
  // constraint never trips on user input.
  const merged = new Map<string, number>();
  for (const item of parsed.data.items) {
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: [...merged.keys()] },
      organizationId: orgId,
      isArchived: false,
    },
    select: { id: true, name: true, quantity: true },
  });
  if (products.length !== merged.size) {
    return fail("มีสินค้าที่ไม่พบในระบบ กรุณาลองใหม่อีกครั้ง");
  }
  // Soft check at request time — the authoritative check runs at approval.
  for (const product of products) {
    const requested = merged.get(product.id)!;
    if (requested > product.quantity) {
      return fail(
        `"${product.name}" คงเหลือ ${product.quantity} ไม่พอสำหรับจำนวนที่ขอเบิก (${requested})`,
      );
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear();
      const count = await tx.requisition.count({
        where: { organizationId: orgId, reqNumber: { startsWith: `REQ-${year}-` } },
      });
      const reqNumber = `REQ-${year}-${String(count + 1).padStart(4, "0")}`;
      await tx.requisition.create({
        data: {
          organizationId: orgId,
          requesterId: userId,
          reqNumber,
          note: parsed.data.note || null,
          items: {
            create: [...merged].map(([productId, quantity]) => ({
              productId,
              quantity,
            })),
          },
        },
      });
    });
  } catch (error) {
    // Concurrent submits can collide on the generated running number.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("เกิดข้อผิดพลาดชั่วคราว กรุณากดบันทึกอีกครั้ง");
    }
    if (isTransactionTimeout(error)) {
      return fail("ระบบทำงานช้าในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    }
    throw error;
  }

  revalidateStockViews();
  return ok();
}

export async function approveRequisitionAction(id: string): Promise<ActionResult> {
  const { orgId, userId, role } = await requireSession();
  if (!isAdminRole(role)) return fail("เฉพาะผู้ดูแลระบบเท่านั้น");

  try {
    await prisma.$transaction(async (tx) => {
      const requisition = await tx.requisition.findFirst({
        where: { id, organizationId: orgId },
        include: {
          items: {
            include: {
              product: { select: { name: true, quantity: true } },
            },
          },
        },
      });
      if (!requisition) throw new RequisitionError("ไม่พบรายการเบิก");
      if (requisition.status !== "PENDING") {
        throw new RequisitionError("รายการนี้ถูกดำเนินการไปแล้ว");
      }
      for (const item of requisition.items) {
        if (item.quantity > item.product.quantity) {
          throw new RequisitionError(
            `สต็อก "${item.product.name}" ไม่พอ (คงเหลือ ${item.product.quantity})`,
          );
        }
      }
      for (const item of requisition.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            organizationId: orgId,
            productId: item.productId,
            createdById: userId,
            type: "OUT",
            delta: -item.quantity,
            note: `เบิกสินค้า ${requisition.reqNumber}`,
            referenceId: requisition.id,
          },
        });
      }
      await tx.requisition.update({
        where: { id: requisition.id },
        data: { status: "APPROVED", decidedById: userId, decidedAt: new Date() },
      });
    });
  } catch (error) {
    if (error instanceof RequisitionError) return fail(error.message);
    if (isTransactionTimeout(error)) {
      return fail("ระบบทำงานช้าในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    }
    throw error;
  }

  revalidateStockViews();
  return ok();
}

export async function rejectRequisitionAction(id: string): Promise<ActionResult> {
  const { orgId, userId, role } = await requireSession();
  if (!isAdminRole(role)) return fail("เฉพาะผู้ดูแลระบบเท่านั้น");

  const { count } = await prisma.requisition.updateMany({
    where: { id, organizationId: orgId, status: "PENDING" },
    data: { status: "REJECTED", decidedById: userId, decidedAt: new Date() },
  });
  if (count === 0) return fail("ไม่พบรายการ หรือรายการถูกดำเนินการไปแล้ว");

  revalidateStockViews();
  return ok();
}

export async function requestReturnAction(id: string): Promise<ActionResult> {
  const { orgId, userId } = await requireSession();

  // Only the requester of an approved requisition can flag a return.
  const { count } = await prisma.requisition.updateMany({
    where: {
      id,
      organizationId: orgId,
      requesterId: userId,
      status: "APPROVED",
    },
    data: { status: "RETURN_REQUESTED" },
  });
  if (count === 0) return fail("ไม่สามารถแจ้งคืนรายการนี้ได้");

  revalidateStockViews();
  return ok();
}

export async function confirmReturnAction(id: string): Promise<ActionResult> {
  const { orgId, userId, role } = await requireSession();
  if (!isAdminRole(role)) return fail("เฉพาะผู้ดูแลระบบเท่านั้น");

  try {
    await prisma.$transaction(async (tx) => {
      const requisition = await tx.requisition.findFirst({
        where: { id, organizationId: orgId },
        include: { items: true },
      });
      if (!requisition) throw new RequisitionError("ไม่พบรายการเบิก");
      if (requisition.status !== "RETURN_REQUESTED") {
        throw new RequisitionError("รายการนี้ไม่ได้อยู่ในสถานะรอรับคืน");
      }
      for (const item of requisition.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            organizationId: orgId,
            productId: item.productId,
            createdById: userId,
            type: "IN",
            delta: item.quantity,
            note: `รับคืนสินค้า ${requisition.reqNumber}`,
            referenceId: requisition.id,
          },
        });
      }
      await tx.requisition.update({
        where: { id: requisition.id },
        data: { status: "RETURNED", returnedAt: new Date() },
      });
    });
  } catch (error) {
    if (error instanceof RequisitionError) return fail(error.message);
    if (isTransactionTimeout(error)) {
      return fail("ระบบทำงานช้าในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    }
    throw error;
  }

  revalidateStockViews();
  return ok();
}
