import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthorization, UserRole } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify teacher authorization
    const _session = await verifyAuthorization(request, UserRole.TEACHER);

    const { id } = await params;

    // Validate student ID format (basic validation)
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: "Invalid student ID provided" },
        { status: 400 }
      );
    }

    // Fetch the student submission with comprehensive details
    const submission = await prisma.file.findFirst({
      where: {
        userId: id,
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true,
        status: true,
        s3ObjectId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            cccd: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // Check if submission exists
    if (!submission) {
      return NextResponse.json(
        { error: "Student submission not found" },
        { status: 404 }
      );
    }

    // Return the submission data
    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        user: submission.user,
        filename: submission.fileName,
        originalName: submission.fileName, // Use fileName as originalName since we don't store original name separately
        fileSize: submission.fileSize,
        mimeType: submission.mimeType,
        uploadedAt: submission.uploadedAt.toISOString(),
        status: submission.status,
        s3ObjectId: submission.s3ObjectId,
      },
    });
  } catch (error) {
    console.error("Error fetching student submission:", error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
