import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  cccd: z.string().regex(/^\d{12}$/, "CCCD must be exactly 12 digits"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = registerSchema.parse(body);
    const { email, password, cccd, name } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { cccd }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
      if (existingUser.cccd === cccd) {
        return NextResponse.json(
          { error: "CCCD already registered" },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        cccd,
        name,
        role: "STUDENT",
      },
      select: {
        id: true,
        email: true,
        name: true,
        cccd: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(error) },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
