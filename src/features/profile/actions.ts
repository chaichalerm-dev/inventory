"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { updateAvatarSchema, type UpdateAvatarInput } from "@/features/profile/schemas";

export async function updateAvatarAction(
  input: UpdateAvatarInput,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { userId } = await requireSession();
  const parsed = updateAvatarSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.profile.invalidImage);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: parsed.data.avatarUrl },
  });

  // The avatar is rendered by (app)/layout.tsx (outside the profile route
  // itself), so the whole app-shell layout needs revalidating, not just
  // /profile.
  revalidatePath("/", "layout");
  return ok();
}
