import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthorization, UserRole, handleAuthError } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify teacher authorization
    const _session = await verifyAuthorization(request, UserRole.TEACHER);

    const { id } = params;

    // Validate student ID format (basic validation)
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: "Invalid student ID provided" },
        { status: 400 }
      );
    }

    // Additional validation: check if ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid student ID format" },
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
        originalName: true,
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
        originalName: submission.originalName,
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
      return handleAuthError();
    }

    // Handle other errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
