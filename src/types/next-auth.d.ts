import type { MembershipRole } from "@/generated/prisma/enums";
import type { DefaultSession } from "next-auth";
// Required so `declare module "next-auth/jwt"` below augments the real
// module instead of declaring a new ambient one.
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      orgId: string;
      role: MembershipRole;
    } & DefaultSession["user"];
  }

  interface User {
    orgId: string;
    role: MembershipRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    orgId: string;
    role: MembershipRole;
  }
}
