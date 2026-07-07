"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
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
  const { orgId } = await requireSession();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors);
  }

  try {
    await prisma.category.create({
      data: { ...parsed.data, organizationId: orgId },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail("A category with this name already exists", {
        name: ["Name is already taken"],
      });
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
  const { orgId } = await requireSession();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors);
  }

  try {
    // updateMany so the org scope is part of the WHERE — a foreign id
    // belonging to another tenant matches zero rows instead of updating.
    const { count } = await prisma.category.updateMany({
      where: { id, organizationId: orgId },
      data: parsed.data,
    });
    if (count === 0) return fail("Category not found");
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail("A category with this name already exists", {
        name: ["Name is already taken"],
      });
    }
    throw error;
  }

  revalidatePath("/categories");
  return ok();
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const { orgId } = await requireSession();

  const { count } = await prisma.category.deleteMany({
    where: { id, organizationId: orgId },
  });
  if (count === 0) return fail("Category not found");

  revalidatePath("/categories");
  revalidatePath("/products"); // product rows show the category name
  return ok();
}
