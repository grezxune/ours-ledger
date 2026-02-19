import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      platformRole: "user" | "super_admin";
    };
  }

  interface User {
    platformRole?: "user" | "super_admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    platformRole?: "user" | "super_admin";
  }
}
