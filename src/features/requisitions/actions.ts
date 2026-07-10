"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { isDbUnavailableError, prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary, interpolate } from "@/lib/i18n/get-dictionary";
import {
  requisitionSchema,
  type RequisitionInput,
} from "@/features/requisitions/schemas";

// Thrown inside transactions to abort with a user-facing message.
class RequisitionError extends Error {}

function revalidateStockViews() {
  revalidatePath("/requisitions");
  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/stock");
}

export async function createRequisitionAction(
  input: RequisitionInput,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const t = dict.requisitions;
  const { orgId, userId } = await requireSession();
  const parsed = requisitionSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.auth.invalidInput, parsed.error.flatten().fieldErrors);
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
    return fail(t.someProductsMissing);
  }
  // Soft check at request time — the authoritative check runs at approval.
  for (const product of products) {
    const requested = merged.get(product.id)!;
    if (requested > product.quantity) {
      return fail(
        interpolate(t.insufficientStockAtRequest, {
          name: product.name,
          available: product.quantity,
          requested,
        }),
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
      return fail(t.duplicateSubmit);
    }
    if (isDbUnavailableError(error)) {
      return fail(dict.auth.dbSlow);
    }
    throw error;
  }

  revalidateStockViews();
  return ok();
}

export async function approveRequisitionAction(id: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const t = dict.requisitions;
  const { orgId, userId, role } = await requireSession();
  if (!isAdminRole(role)) return fail(t.adminOnly);

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
      if (!requisition) throw new RequisitionError(t.notFound);
      if (requisition.status !== "PENDING") {
        throw new RequisitionError(t.alreadyProcessed);
      }
      for (const item of requisition.items) {
        if (item.quantity > item.product.quantity) {
          throw new RequisitionError(
            interpolate(t.insufficientStockAtApprove, {
              name: item.product.name,
              available: item.product.quantity,
            }),
          );
        }
      }
      for (const item of requisition.items) {
        // The loop above validated against a snapshot; a concurrent approval
        // may have consumed the stock since. Making the decrement itself
        // conditional is what actually prevents quantity going negative —
        // zero rows updated means someone else got there first.
        const { count } = await tx.product.updateMany({
          where: {
            id: item.productId,
            organizationId: orgId,
            quantity: { gte: item.quantity },
          },
          data: { quantity: { decrement: item.quantity } },
        });
        if (count === 0) {
          const current = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true, quantity: true },
          });
          throw new RequisitionError(
            interpolate(t.insufficientStockAtApprove, {
              name: current?.name ?? item.product.name,
              available: current?.quantity ?? 0,
            }),
          );
        }
        await tx.stockMovement.create({
          data: {
            organizationId: orgId,
            productId: item.productId,
            createdById: userId,
            type: "OUT",
            delta: -item.quantity,
            note: interpolate(t.stockNoteOut, { reqNumber: requisition.reqNumber }),
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
    if (isDbUnavailableError(error)) {
      return fail(dict.auth.dbSlow);
    }
    throw error;
  }

  revalidateStockViews();
  return ok();
}

export async function rejectRequisitionAction(id: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const t = dict.requisitions;
  const { orgId, userId, role } = await requireSession();
  if (!isAdminRole(role)) return fail(t.adminOnly);

  const { count } = await prisma.requisition.updateMany({
    where: { id, organizationId: orgId, status: "PENDING" },
    data: { status: "REJECTED", decidedById: userId, decidedAt: new Date() },
  });
  if (count === 0) return fail(t.notFoundOrProcessed);

  revalidateStockViews();
  return ok();
}

export async function requestReturnAction(id: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
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
  if (count === 0) return fail(dict.requisitions.cannotReturn);

  revalidateStockViews();
  return ok();
}

export async function confirmReturnAction(id: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const t = dict.requisitions;
  const { orgId, userId, role } = await requireSession();
  if (!isAdminRole(role)) return fail(t.adminOnly);

  try {
    await prisma.$transaction(async (tx) => {
      const requisition = await tx.requisition.findFirst({
        where: { id, organizationId: orgId },
        include: { items: true },
      });
      if (!requisition) throw new RequisitionError(t.notFound);
      if (requisition.status !== "RETURN_REQUESTED") {
        throw new RequisitionError(t.notReturnPending);
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
            note: interpolate(t.stockNoteIn, { reqNumber: requisition.reqNumber }),
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
    if (isDbUnavailableError(error)) {
      return fail(dict.auth.dbSlow);
    }
    throw error;
  }

  revalidateStockViews();
  return ok();
}
