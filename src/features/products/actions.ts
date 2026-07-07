"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  NO_CATEGORY,
  productSchema,
  type ProductInput,
} from "@/features/products/schemas";

function isKnownError(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

async function toData(orgId: string, input: ProductInput) {
  const { categoryId, ...rest } = input;
  const resolvedCategoryId = categoryId === NO_CATEGORY ? null : categoryId;

  // Validate the category belongs to this org — a crafted request could
  // otherwise attach a foreign tenant's category.
  if (resolvedCategoryId) {
    const category = await prisma.category.findFirst({
      where: { id: resolvedCategoryId, organizationId: orgId },
      select: { id: true },
    });
    if (!category) return null;
  }
  return { ...rest, categoryId: resolvedCategoryId };
}

export async function createProductAction(
  input: ProductInput,
): Promise<ActionResult> {
  const { orgId } = await requireSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors);
  }

  const data = await toData(orgId, parsed.data);
  if (!data) return fail("Category not found");

  try {
    await prisma.product.create({ data: { ...data, organizationId: orgId } });
  } catch (error) {
    if (isKnownError(error, "P2002")) {
      return fail("A product with this SKU already exists", {
        sku: ["SKU is already taken"],
      });
    }
    throw error;
  }

  revalidatePath("/products");
  return ok();
}

export async function updateProductAction(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  const { orgId } = await requireSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors);
  }

  const data = await toData(orgId, parsed.data);
  if (!data) return fail("Category not found");

  try {
    const { count } = await prisma.product.updateMany({
      where: { id, organizationId: orgId },
      data,
    });
    if (count === 0) return fail("Product not found");
  } catch (error) {
    if (isKnownError(error, "P2002")) {
      return fail("A product with this SKU already exists", {
        sku: ["SKU is already taken"],
      });
    }
    throw error;
  }

  revalidatePath("/products");
  return ok();
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const { orgId } = await requireSession();

  try {
    const { count } = await prisma.product.deleteMany({
      where: { id, organizationId: orgId },
    });
    if (count === 0) return fail("Product not found");
  } catch (error) {
    // FK Restrict: the product has stock movements — history must survive.
    if (isKnownError(error, "P2003")) {
      return fail("This product has stock history and cannot be deleted");
    }
    throw error;
  }

  revalidatePath("/products");
  return ok();
}
