import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storageService } from "@/lib/storage";

const completeUploadSchema = z.object({
  fileKey: z.string().min(1, "File key is required"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  userId: z.string().min(1, "User ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = completeUploadSchema.parse(body);
    const { fileKey, fileName, fileSize, mimeType, userId } = validatedData;

    // Save file metadata to database
    const fileMetadata = await storageService.saveFileMetadata({
      userId,
      fileName,
      fileSize,
      mimeType,
      s3ObjectId: fileKey,
      status: "PENDING",
    });

    return NextResponse.json(
      {
        message: "File upload completed successfully",
        file: fileMetadata,
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

    console.error("Upload completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete file upload" },
      { status: 500 }
    );
  }
}
