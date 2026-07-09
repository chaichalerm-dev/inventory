"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  organizationSettingsSchema,
  systemSettingsSchema,
  type OrganizationSettingsInput,
  type SystemSettingsInput,
} from "@/features/settings/schemas";

const SYSTEM_SETTINGS_ID = "global";

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

export async function updateSystemSettingsAction(
  input: SystemSettingsInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = systemSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return fail("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }

  await prisma.systemSetting.upsert({
    where: { id: SYSTEM_SETTINGS_ID },
    create: { id: SYSTEM_SETTINGS_ID, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/settings");
  revalidatePath("/sign-in");
  return ok();
}
