import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserRole } from "../types/auth";

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
        defaultValue: "STUDENT" as UserRole,
        // Extend with validation for role values
        validate: (value: string): value is UserRole => {
          return ["STUDENT", "TEACHER", "ADMIN"].includes(value as UserRole);
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
