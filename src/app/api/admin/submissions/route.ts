import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
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

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: Prisma.FileWhereInput = {};
    
    if (status && status !== "ALL") {
      whereClause.status = status as Prisma.EnumFileStatusFilter;
    }

    // If search term is provided, search by user name, email, or CCCD
    if (search) {
      whereClause.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cccd: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Fetch submissions with user information
    const [submissions, totalCount] = await Promise.all([
      prisma.file.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: {
          uploadedAt: 'desc',
        },
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          status: true,
          uploadedAt: true,
          approvedAt: true,
          approvedBy: true,
          mimeType: true,
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
      }),
      prisma.file.count({
        where: whereClause,
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        submissions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
