import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export async function testDatabaseConnection() {
  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Test creating a test user (we'll delete it after)
    const testUser = await prisma.user.create({
      data: {
        cccd: "123456789012",
        email: "test@example.com",
        name: "Test User",
        password: "hashedpassword",
        role: "STUDENT",
      },
    });
    console.log("✅ User creation successful:", testUser);

    // Test unique constraint on CCCD
    try {
      await prisma.user.create({
        data: {
          cccd: "123456789012", // Same CCCD should fail
          email: "test2@example.com",
          name: "Test User 2",
          password: "hashedpassword",
          role: "STUDENT",
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          console.log("✅ CCCD unique constraint working correctly");
        } else {
          throw error;
        }
      }
    }

    // Clean up test data
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log("✅ Test cleanup successful");

    return true;
  } catch (error) {
    console.error("❌ Database test failed:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection();
}
