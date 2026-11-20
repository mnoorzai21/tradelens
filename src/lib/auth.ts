import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { prisma } from "@/lib/prisma";

// Auth endpoints that change the account itself. The demo account is shared,
// so blocking these keeps it working for every visitor.
const DEMO_BLOCKED_PATHS = new Set([
  "/change-password",
  "/change-email",
  "/update-user",
  "/delete-user",
]);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
    
  user: {
    additionalFields: {
      isDemo: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
    
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [nextCookies()],
    hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!DEMO_BLOCKED_PATHS.has(ctx.path)) {
        return;
      }
      const session = await getSessionFromCtx(ctx);
      const user = session?.user as { isDemo?: boolean } | undefined;
      if (user?.isDemo) {
        throw new APIError("FORBIDDEN", {
          message: "The demo account is read-only.",
        });
      }
    }),
  },
});