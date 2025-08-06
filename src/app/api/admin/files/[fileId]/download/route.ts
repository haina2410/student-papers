import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storageService } from "@/lib/storage";
import { verifyAuthorization, handleAuthError } from "@/lib/auth-utils";
import { UserRole } from "@/types/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Verify teacher authorization
    const _session = await verifyAuthorization(request, UserRole.TEACHER);

    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Fetch file details from database
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        id: true,
        s3ObjectId: true,
        fileName: true,
        mimeType: true,
        user: {
          select: {
            name: true,
            cccd: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Generate presigned URL for download
    const downloadUrl = await storageService.getFileUrl(file.s3ObjectId);

    return NextResponse.json(
      {
        downloadUrl,
        fileName: file.fileName,
        mimeType: file.mimeType,
        studentName: file.user.name,
        studentCccd: file.user.cccd,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating download URL:", error);
    
    const authError = handleAuthError(error);
    if (authError.statusCode !== 500) {
      return NextResponse.json(
        { error: authError.error, code: authError.code },
        { status: authError.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
