import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { storageService } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Get session and verify teacher role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized - Teacher access required" },
        { status: 401 }
      );
    }

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
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
