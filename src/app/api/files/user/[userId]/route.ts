import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch files for the user
    const files = await prisma.file.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        status: true,
        uploadedAt: true,
        mimeType: true,
      },
    });

    return NextResponse.json(
      {
        files: files,
        count: files.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user files:", error);
    return NextResponse.json(
      { error: "Failed to fetch user files" },
      { status: 500 }
    );
  }
}
