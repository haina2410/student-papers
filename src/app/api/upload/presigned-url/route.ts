import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storageService } from "@/lib/storage";
import { validateFileOnServer } from "@/lib/validation";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/types/storage";

const presignedUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z
    .string()
    .refine((type) => ALLOWED_FILE_TYPES.includes(type as any), {
      message: `File type must be one of: ${ALLOWED_FILE_TYPES.join(", ")}`,
    }),
  fileSize: z
    .number()
    .min(1, "File size must be greater than 0")
    .max(
      MAX_FILE_SIZE,
      `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    ),
  userId: z.string().min(1, "User ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = presignedUrlSchema.parse(body);
    const { fileName, fileType, fileSize, userId } = validatedData;

    // Additional server-side validation
    const validation = validateFileOnServer(fileName, fileSize, fileType);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate presigned URL
    const uploadResponse = await storageService.generateUploadUrl({
      fileName,
      fileType,
      fileSize,
      userId,
    });

    return NextResponse.json(uploadResponse, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Presigned URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
