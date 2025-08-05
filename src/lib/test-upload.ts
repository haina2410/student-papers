// Test file upload service without actual S3 connection
export async function testUploadService() {
  const baseUrl = "http://localhost:3000";

  console.log("🧪 Testing file upload service...");

  try {
    // Test 1: Generate presigned URL
    console.log("1. Testing presigned URL generation...");

    const mockFileData = {
      fileName: "test-document.pdf",
      fileType: "application/pdf",
      fileSize: 1024 * 1024, // 1MB
      userId: "test-user-id",
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
    } else {
      console.log("❌ Presigned URL generation failed:", presignedData.error);
    }

    // Test 2: File size validation (too large)
    console.log("2. Testing file size validation (16MB - should fail)...");

    const largeFileData = {
      fileName: "large-file.pdf",
      fileType: "application/pdf",
      fileSize: 16 * 1024 * 1024, // 16MB (exceeds 15MB limit)
      userId: "test-user-id",
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

    const largeFileData2 = await largeFileResponse.json();

    if (largeFileResponse.status === 400) {
      console.log("✅ File size validation working correctly");
    } else {
      console.log("❌ File size validation failed - large file was accepted");
    }

    // Test 3: Invalid file type
    console.log(
      "3. Testing file type validation (executable - should fail)..."
    );

    const invalidTypeData = {
      fileName: "malicious.exe",
      fileType: "application/x-executable",
      fileSize: 1024,
      userId: "test-user-id",
    };

    const invalidTypeResponse = await fetch(
      `${baseUrl}/api/upload/presigned-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidTypeData),
      }
    );

    if (invalidTypeResponse.status === 400) {
      console.log("✅ File type validation working correctly");
    } else {
      console.log("❌ File type validation failed - invalid type was accepted");
    }

    // Test 4: Complete upload (mock)
    console.log("4. Testing upload completion...");

    const completeData = {
      fileKey: "uploads/test-user-id/test-file.pdf",
      fileName: "test-document.pdf",
      fileSize: 1024 * 1024,
      mimeType: "application/pdf",
      userId: "test-user-id",
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
    } else {
      console.log("❌ Upload completion failed:", completeResponseData.error);
    }

    console.log("🎉 File upload service test completed");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testUploadService();
}
