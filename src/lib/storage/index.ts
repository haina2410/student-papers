import { S3StorageService } from "./s3-service";
import { MockStorageService } from "./mock-service";
import type { StorageService } from "@/types/storage";

// Storage service factory - makes it easy to swap implementations
export function createStorageService(): StorageService {
  const provider = process.env.STORAGE_PROVIDER || "s3";

  switch (provider.toLowerCase()) {
    case "s3":
      return new S3StorageService();
    case "mock":
      return new MockStorageService();
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

// Export the default instance
export const storageService = createStorageService();
