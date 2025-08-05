// Test file upload with real user from database
import { prisma } from "./prisma";

export async function testUploadWithRealUser() {
  const baseUrl = "http://localhost:3000";

  console.log("🧪 Testing file upload service with real user...");

  try {
    // First, get or create a test user
    let testUser = await prisma.user.findUnique({
      where: { email: "test@student.edu.vn" },
    });

    if (!testUser) {
      console.log("Creating test user...");
      const { hash } = await import("bcryptjs");
      testUser = await prisma.user.create({
        data: {
          email: "test@student.edu.vn",
          password: await hash("password123", 12),
          cccd: "123456789013", // Different from previous test
          name: "Test Upload User",
          role: "STUDENT",
        },
      });
    }

    console.log(`Using test user: ${testUser.id}`);

    // Test 1: Generate presigned URL
    console.log("1. Testing presigned URL generation...");

    const mockFileData = {
      fileName: "test-document.pdf",
      fileType: "application/pdf",
      fileSize: 1024 * 1024, // 1MB
      userId: testUser.id, // Use real user ID
    };

    const presignedResponse = await fetch(
      `${baseUrl}/api/upload/presigned-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockFileData),
      }
    );

    const presignedData = await presignedResponse.json();
    console.log("Presigned URL response:", presignedData);

    if (presignedResponse.ok) {
      console.log("✅ Presigned URL generation successful");

      // Test 2: Complete upload
      console.log("2. Testing upload completion...");

      const completeData = {
        fileKey: presignedData.fileKey,
        fileName: "test-document.pdf",
        fileSize: 1024 * 1024,
        mimeType: "application/pdf",
        userId: testUser.id, // Use real user ID
      };

      const completeResponse = await fetch(`${baseUrl}/api/upload/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeData),
      });

      const completeResponseData = await completeResponse.json();
      console.log("Upload completion response:", completeResponseData);

      if (completeResponse.ok) {
        console.log("✅ Upload completion successful");
        console.log("File saved to database:", completeResponseData.file);
      } else {
        console.log("❌ Upload completion failed:", completeResponseData.error);
      }
    } else {
      console.log("❌ Presigned URL generation failed:", presignedData.error);
    }

    // Test 3: File size validation (too large)
    console.log("3. Testing file size validation (16MB - should fail)...");

    const largeFileData = {
      fileName: "large-file.pdf",
      fileType: "application/pdf",
      fileSize: 16 * 1024 * 1024, // 16MB (exceeds 15MB limit)
      userId: testUser.id,
    };

    const largeFileResponse = await fetch(
      `${baseUrl}/api/upload/presigned-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(largeFileData),
      }
    );

    if (largeFileResponse.status === 400) {
      console.log("✅ File size validation working correctly");
    } else {
      console.log("❌ File size validation failed - large file was accepted");
    }

    console.log("🎉 File upload service test completed successfully");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testUploadWithRealUser();
}
