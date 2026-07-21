"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requirePlatformAdmin } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
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
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();
  const parsed = organizationSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.auth.invalidInput, parsed.error.flatten().fieldErrors);
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
  const dict = getDictionary(await getLocale());
  await requirePlatformAdmin();
  const parsed = systemSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.auth.invalidInput, parsed.error.flatten().fieldErrors);
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
