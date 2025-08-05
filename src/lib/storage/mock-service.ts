import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import type {
  StorageService,
  UploadUrlParams,
  UploadUrlResponse,
  FileMetadata,
} from "@/types/storage";

export class MockStorageService implements StorageService {
  async generateUploadUrl(params: UploadUrlParams): Promise<UploadUrlResponse> {
    const { fileName, userId } = params;

    // Generate a mock presigned URL
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const fileKey = `uploads/${userId}/${uniqueFileName}`;

    // Return a mock presigned URL
    const uploadUrl = `https://mock-s3-bucket.s3.amazonaws.com/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock&X-Amz-Date=20250805T184500Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=mock-signature`;

    return {
      uploadUrl,
      fileKey,
      expiresIn: 300,
    };
  }

  async saveFileMetadata(
    metadata: Omit<FileMetadata, "id" | "uploadedAt">
  ): Promise<FileMetadata> {
    const file = await prisma.file.create({
      data: {
        userId: metadata.userId,
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        s3ObjectId: metadata.s3ObjectId,
        status: metadata.status,
      },
    });

    return {
      id: file.id,
      userId: file.userId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      s3ObjectId: file.s3ObjectId,
      status: file.status as "PENDING" | "APPROVED" | "REJECTED",
      uploadedAt: file.uploadedAt,
    };
  }

  async deleteFile(fileKey: string): Promise<void> {
    console.log(`Mock: Would delete file with key: ${fileKey}`);
    // In a real implementation, this would delete from S3
    return Promise.resolve();
  }

  async getFileUrl(fileKey: string): Promise<string> {
    // Return a mock download URL
    return `https://mock-s3-bucket.s3.amazonaws.com/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock&X-Amz-Date=20250805T184500Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=mock-signature`;
  }
}
