import { S3StorageService } from "./s3-service";
import type { StorageService } from "@/types/storage";

// Storage service factory - makes it easy to swap implementations
export function createStorageService(): StorageService {
  // For now, we only have S3 implementation
  // In the future, we can add other providers like Google Cloud, Azure, etc.
  const provider = process.env.STORAGE_PROVIDER || "s3";

  switch (provider.toLowerCase()) {
    case "s3":
      return new S3StorageService();
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

// Export the default instance
export const storageService = createStorageService();
