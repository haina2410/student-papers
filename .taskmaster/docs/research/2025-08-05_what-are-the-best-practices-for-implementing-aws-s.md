---
title: Research Session
query: "What are the best practices for implementing AWS S3 file upload in Next.js 15 with 15MB file size limits? Include security considerations, progress tracking, and decoupled service architecture for future migration to other storage providers."
date: 8/6/2025
time: 12:50:44 AM
timestamp: 2025-08-05T17:50:44.317Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** What are the best practices for implementing AWS S3 file upload in Next.js 15 with 15MB file size limits? Include security considerations, progress tracking, and decoupled service architecture for future migration to other storage providers.

**Response:**

To implement AWS S3 file upload in Next.js 15 with a 15MB file size limit, the best practice is to use a decoupled, service-oriented architecture that leverages S3 presigned URLs for secure, direct-to-S3 uploads, robust validation, and progress tracking. This approach maximizes security, scalability, and future portability to other storage providers.

---

## 1. Architectural Overview: Decoupling and Abstraction

**Service Abstraction Layer**  
- Create a file storage abstraction (e.g., `uploadService.ts`) that exposes generic methods like `getUploadUrl`, `saveFileReference`, and `deleteFile`.
- The S3 implementation should be encapsulated behind this interface, allowing you to swap in other providers (e.g., Google Cloud Storage, Azure Blob Storage) by implementing the same interface in the future.
- All S3-specific logic (SDK usage, presigned URL generation, etc.) should be isolated from the rest of the application[3].

**Example Interface:**
```typescript
// storageService.ts
export interface StorageService {
  getUploadUrl(params: { fileName: string; fileType: string; fileSize: number }): Promise<{ url: string; key: string }>;
  saveFileReference(params: { userId: string; key: string; ... }): Promise<void>;
  deleteFile(key: string): Promise<void>;
}
```
Implement this interface for S3, and later for other providers.

---

## 2. File Size Validation (Frontend & Backend)

**Frontend Validation**
- Before upload, check file size and type in the browser:
```javascript
const MAX_SIZE = 15 * 1024 * 1024; // 15MB
if (file.size > MAX_SIZE) {
  alert("File exceeds 15MB limit.");
  return;
}
```
- Restrict file types using the `accept` attribute on `<input type="file">`.

**Backend Validation**
- In the API route that generates the presigned URL, validate the requested file size and type again to prevent bypassing client-side checks.
- Reject requests for files >15MB with a clear error message.

---

## 3. Secure Direct-to-S3 Uploads with Presigned URLs

**Why Presigned URLs?**
- Avoids routing large files through your Next.js server, which can hit Vercel/Node.js limits and increases security by never exposing AWS credentials to the client[4][3].
- The backend generates a short-lived, single-use URL that allows the client to upload directly to S3.

**Implementation Steps:**
1. **Client requests upload:**  
   Client sends file metadata (name, type, size) to your Next.js API route (e.g., `/api/upload-url`).
2. **Backend generates presigned URL:**  
   The API route uses AWS SDK v3 to generate a presigned URL with a 15MB content-length limit and returns it to the client.
3. **Client uploads file:**  
   Client uploads the file directly to S3 using the presigned URL via a `PUT` request, tracking progress.
4. **Backend saves reference:**  
   After upload, client notifies backend to save the file reference (key, user, metadata) in the database.

**Sample Backend Code (API Route):**
```typescript
// pages/api/upload-url.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req, res) {
  const { fileName, fileType, fileSize } = req.body;
  if (fileSize > 15 * 1024 * 1024) {
    return res.status(400).json({ error: "File exceeds 15MB limit." });
  }
  // Generate unique key, e.g., `${userId}/${uuidv4()}-${fileName}`
  const key = ...;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 180 }); // 3 minutes
  res.status(200).json({ url, key });
}
```
**Sample Client Upload:**
```javascript
const xhr = new XMLHttpRequest();
xhr.upload.onprogress = (event) => {
  if (event.lengthComputable) {
    setProgress((event.loaded / event.total) * 100);
  }
};
xhr.open("PUT", presignedUrl);
xhr.setRequestHeader("Content-Type", file.type);
xhr.send(file);
```
---

## 4. Security Considerations

**IAM Permissions**
- Use a dedicated IAM user/role with the minimum required S3 permissions (`s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`) for the specific bucket[2].
- Never expose AWS credentials to the client.

**Presigned URL Restrictions**
- Set short expiration (e.g., 3 minutes).
- Restrict allowed content types and content length in the presigned URL.
- Use unique, unpredictable S3 keys (e.g., UUIDs, user IDs) to prevent enumeration.

**Bucket Policies & CORS**
- Configure S3 bucket CORS to allow only the required origins and methods (e.g., `PUT` from your frontend domain)[2][3].
- Set bucket policies to prevent public access unless explicitly required.

**Validation & Sanitization**
- Validate all inputs on both client and server.
- Sanitize file names and metadata to prevent injection attacks.

**Audit Logging**
- Log all upload attempts, including user ID, file metadata, and result, for auditing and debugging.

---

## 5. Progress Tracking

- Use the `XMLHttpRequest.upload.onprogress` event or the `onUploadProgress` callback in libraries like Axios to provide real-time progress feedback to users.
- Display a progress bar or percentage indicator in the UI.

**Example:**
```javascript
xhr.upload.onprogress = (event) => {
  if (event.lengthComputable) {
    setProgress((event.loaded / event.total) * 100);
  }
};
```

---

## 6. Integration with Database (Prisma/PostgreSQL)

- After a successful upload, the client should notify your backend (e.g., via `/api/files`) to save the file reference (S3 key, user ID, metadata) in the `File` table.
- This ensures your application can track and manage uploaded files, and supports features like approval workflows and download links[3].

---

## 7. Future-Proofing for Storage Provider Migration

- By abstracting storage operations behind a service interface, you can later implement the same interface for other providers (e.g., Google Cloud Storage, Azure Blob Storage).
- Use generic file metadata and avoid S3-specific fields in your database schema.
- Keep all S3 configuration (bucket, region, credentials) in environment variables for easy swapping.

---

## 8. Edge Cases and Pitfalls

- **Large Files:** Ensure both client and server enforce the 15MB limit to prevent abuse and avoid S3 upload failures.
- **Network Failures:** Handle upload interruptions gracefully; allow users to retry.
- **Duplicate Uploads:** Use unique keys or check for existing files to prevent accidental overwrites.
- **Expired URLs:** If a user takes too long, regenerate the presigned URL.
- **Frontend/Backend Desync:** Always validate on the backend, as client-side checks can be bypassed.

---

## 9. Example File Structure

```
/services
  └── storageService.ts      // Interface
  └── s3StorageService.ts    // S3 implementation
/pages/api
  └── upload-url.ts          // Presigned URL endpoint
  └── files.ts               // Save file reference endpoint
/components
  └── FileUploadForm.tsx     // Upload UI with progress
/prisma
  └── schema.prisma          // File model
```

---

## 10. References and Further Reading

- [Neon: How to upload to S3 in Next.js and save references in Postgres][3]
- [Vercel AWS S3 Image Upload Example][2]
- [YouTube: The Ultimate Guide to File Uploads in Next.js (S3, Presigned URLs)][4]

---

By following these practices, you ensure secure, scalable, and maintainable file uploads in Next.js 15, with a clear path for future migration to other storage providers and robust support for your application's workflow requirements.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-08-05T17:50:44.317Z*
