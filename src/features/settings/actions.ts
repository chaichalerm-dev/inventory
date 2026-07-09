"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  organizationSettingsSchema,
  type OrganizationSettingsInput,
} from "@/features/settings/schemas";

export async function updateOrganizationAction(
  input: OrganizationSettingsInput,
): Promise<ActionResult> {
  const { orgId } = await requireAdmin();
  const parsed = organizationSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return fail("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return ok();
}
