import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AvatarUpload } from "@/features/profile/components/avatar-upload";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "โปรไฟล์ของฉัน · My Profile" };

export default async function ProfilePage() {
  const { userId } = await requireSession();
  const [user, dict] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true, avatarUrl: true },
    }),
    getLocale().then(getDictionary),
  ]);

  return (
    <>
      <PageHeader title={dict.profile.title} description={dict.profile.desc} />
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <AvatarUpload name={user.name} avatarUrl={user.avatarUrl} />
          <div className="mt-6 space-y-1 text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
