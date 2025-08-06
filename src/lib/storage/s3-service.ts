import "server-only";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import type {
  StorageService,
  UploadUrlParams,
  UploadUrlResponse,
  FileMetadata,
} from "@/types/storage";

export class S3StorageService implements StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: "us-east-1",
      forcePathStyle: false,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET || "";

    if (!this.bucketName) {
      throw new Error("AWS_S3_BUCKET environment variable is required");
    }
  }

  async generateUploadUrl(params: UploadUrlParams): Promise<UploadUrlResponse> {
    const { fileName, fileType, fileSize, userId } = params;

    // Generate unique file key
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const fileKey = `uploads/${userId}/${uniqueFileName}`;

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        userId,
        originalFileName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

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
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    await this.s3Client.send(command);
  }

  async getFileUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return url;
  }
}
