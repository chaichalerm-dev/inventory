"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { categorySchema, type CategoryInput } from "@/features/categories/schemas";

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function createCategoryAction(
  input: CategoryInput,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.categories.invalidInput, parsed.error.flatten().fieldErrors);
  }

  try {
    await prisma.category.create({
      data: { ...parsed.data, organizationId: orgId },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(dict.categories.nameTaken, { name: [dict.categories.nameTaken] });
    }
    throw error;
  }

  revalidatePath("/categories");
  return ok();
}

export async function updateCategoryAction(
  id: string,
  input: CategoryInput,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.categories.invalidInput, parsed.error.flatten().fieldErrors);
  }

  try {
    // updateMany so the org scope is part of the WHERE — a foreign id
    // belonging to another tenant matches zero rows instead of updating.
    const { count } = await prisma.category.updateMany({
      where: { id, organizationId: orgId },
      data: parsed.data,
    });
    if (count === 0) return fail(dict.categories.notFound);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail(dict.categories.nameTaken, { name: [dict.categories.nameTaken] });
    }
    throw error;
  }

  revalidatePath("/categories");
  return ok();
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();

  const { count } = await prisma.category.deleteMany({
    where: { id, organizationId: orgId },
  });
  if (count === 0) return fail(dict.categories.notFound);

  revalidatePath("/categories");
  revalidatePath("/products"); // product rows show the category name
  return ok();
}
