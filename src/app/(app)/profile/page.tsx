import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AvatarUpload } from "@/features/profile/components/avatar-upload";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "โปรไฟล์ของฉัน" };

export default async function ProfilePage() {
  const { userId } = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, avatarUrl: true },
  });

  return (
    <>
      <PageHeader title="โปรไฟล์ของฉัน" description="จัดการรูปโปรไฟล์ของคุณ" />
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
