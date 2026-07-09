"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
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
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.products.invalidInput, parsed.error.flatten().fieldErrors);
  }

  const data = await toData(orgId, parsed.data);
  if (!data) return fail(dict.products.categoryNotFound);

  try {
    await prisma.product.create({ data: { ...data, organizationId: orgId } });
  } catch (error) {
    if (isKnownError(error, "P2002")) {
      return fail(dict.products.skuTaken, { sku: [dict.products.skuTaken] });
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
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.products.invalidInput, parsed.error.flatten().fieldErrors);
  }

  const data = await toData(orgId, parsed.data);
  if (!data) return fail(dict.products.categoryNotFound);

  try {
    const { count } = await prisma.product.updateMany({
      where: { id, organizationId: orgId },
      data,
    });
    if (count === 0) return fail(dict.products.notFound);
  } catch (error) {
    if (isKnownError(error, "P2002")) {
      return fail(dict.products.skuTaken, { sku: [dict.products.skuTaken] });
    }
    throw error;
  }

  revalidatePath("/products");
  return ok();
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();

  try {
    const { count } = await prisma.product.deleteMany({
      where: { id, organizationId: orgId },
    });
    if (count === 0) return fail(dict.products.notFound);
  } catch (error) {
    // FK Restrict: the product has stock movements — history must survive.
    if (isKnownError(error, "P2003")) {
      return fail(dict.products.deleteConfirmDesc);
    }
    throw error;
  }

  revalidatePath("/products");
  return ok();
}
