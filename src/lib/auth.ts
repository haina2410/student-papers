import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole } from "../types/auth";

const betterAuthURL = process.env.BETTER_AUTH_URL!;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET!;

if (!betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

if (!betterAuthURL) {
  throw new Error("BETTER_AUTH_URL is not set");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  logger: {
    level: "info",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for development
  },
  user: {
    additionalFields: {
      cccd: {
        type: "string",
        required: true,
        unique: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        // Extend with validation for role values
        validate: (value: string): value is UserRole => {
          return (["STUDENT", "TEACHER", "ADMIN"].includes(value));
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: betterAuthSecret,
  baseURL: betterAuthURL,
});
