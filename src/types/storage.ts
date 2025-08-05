export interface UploadUrlParams {
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

export interface FileMetadata {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3ObjectId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  uploadedAt: Date;
}

export interface StorageService {
  generateUploadUrl(params: UploadUrlParams): Promise<UploadUrlResponse>;
  saveFileMetadata(
    metadata: Omit<FileMetadata, "id" | "uploadedAt">
  ): Promise<FileMetadata>;
  deleteFile(fileKey: string): Promise<void>;
  getFileUrl(fileKey: string): Promise<string>;
}

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/jpg",
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
