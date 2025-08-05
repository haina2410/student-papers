import {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  type AllowedFileType,
} from "@/types/storage";

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
    return {
      isValid: false,
      error: `File type ${
        file.type
      } is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: "File is empty",
    };
  }

  return { isValid: true };
}

export function validateFileOnServer(
  fileName: string,
  fileSize: number,
  mimeType: string
): FileValidationResult {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(mimeType as AllowedFileType)) {
    return {
      isValid: false,
      error: `File type ${mimeType} is not allowed`,
    };
  }

  // Check if file size is reasonable (not 0)
  if (fileSize <= 0) {
    return {
      isValid: false,
      error: "Invalid file size",
    };
  }

  // Basic file name validation
  if (!fileName || fileName.trim().length === 0) {
    return {
      isValid: false,
      error: "File name is required",
    };
  }

  // Check for dangerous file names
  const dangerousPatterns = [
    "..",
    "/",
    "\\",
    "<",
    ">",
    ":",
    '"',
    "|",
    "?",
    "*",
  ];
  if (dangerousPatterns.some((pattern) => fileName.includes(pattern))) {
    return {
      isValid: false,
      error: "File name contains invalid characters",
    };
  }

  return { isValid: true };
}
