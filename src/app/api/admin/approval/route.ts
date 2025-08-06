import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthorization } from "@/lib/auth-utils";
import { FileStatus } from "@prisma/client";
import { UserRole } from "@/types/auth";

// Define the request body type
interface ApprovalRequest {
  fileId: string;
  status: FileStatus;
  comment?: string;
}

// Define the response type
interface ApprovalResponse {
  success: boolean;
  file: {
    id: string;
    status: FileStatus;
    approvedAt: string | null;
    approvedBy: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      cccd: string;
    };
  };
  message: string;
}

export async function PUT(request: NextRequest) {
  try {
    // Verify teacher authorization
    const session = await verifyAuthorization(request, UserRole.TEACHER);

    // Parse and validate request body
    const body: ApprovalRequest = await request.json();
    const { fileId, status, comment } = body;

    // Input validation
    if (!fileId || typeof fileId !== 'string' || fileId.trim() === '') {
      return NextResponse.json(
        { error: "File ID is required and must be a valid string" },
        { status: 400 }
      );
    }

    if (!status || !Object.values(FileStatus).includes(status)) {
      return NextResponse.json(
        { 
          error: "Status is required and must be one of: PENDING, APPROVED, REJECTED",
          validStatuses: Object.values(FileStatus)
        },
        { status: 400 }
      );
    }

    // Validate file ID format (CUID format check)
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(fileId)) {
      return NextResponse.json(
        { error: "Invalid file ID format" },
        { status: 400 }
      );
    }

    // Check if the file exists
    const existingFile = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            cccd: true,
          },
        },
      },
    });

    if (!existingFile) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      status: FileStatus;
      approvedAt?: Date | null;
      approvedBy?: string | null;
    } = {
      status,
    };

    // Set approval metadata based on status
    if (status === FileStatus.APPROVED || status === FileStatus.REJECTED) {
      updateData.approvedAt = new Date();
      updateData.approvedBy = session.user.id;
    } else if (status === FileStatus.PENDING) {
      // Reset approval metadata when setting back to pending
      updateData.approvedAt = null;
      updateData.approvedBy = null;
    }

    // Update the file status atomically
    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            cccd: true,
          },
        },
      },
    });

    // Prepare response
    const response: ApprovalResponse = {
      success: true,
      file: {
        id: updatedFile.id,
        status: updatedFile.status,
        approvedAt: updatedFile.approvedAt?.toISOString() || null,
        approvedBy: updatedFile.approvedBy,
        user: updatedFile.user,
      },
      message: `Submission status updated to ${status}`,
    };

    // Log the approval action for audit purposes
    console.log(`[APPROVAL] User ${session.user.id} (${session.user.email}) updated file ${fileId} status to ${status}${comment ? ` with comment: ${comment}` : ''}`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error updating approval status:", error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message: string };
      
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
      
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: "Database constraint violation" },
          { status: 400 }
        );
      }
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to retrieve approval history or status
export async function GET(request: NextRequest) {
  try {
    // Verify teacher authorization
    const _session = await verifyAuthorization(request, UserRole.TEACHER);

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID query parameter is required" },
        { status: 400 }
      );
    }

    // Validate file ID format
    const cuidRegex = /^c[a-z0-9]{24}$/;
    if (!cuidRegex.test(fileId)) {
      return NextResponse.json(
        { error: "Invalid file ID format" },
        { status: 400 }
      );
    }

    // Fetch the file with approval information
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        status: true,
        approvedAt: true,
        approvedBy: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        status: file.status,
        approvedAt: file.approvedAt?.toISOString() || null,
        approvedBy: file.approvedBy,
        user: file.user,
      },
    });
  } catch (error) {
    console.error("Error fetching approval status:", error);
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('authorization')) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
