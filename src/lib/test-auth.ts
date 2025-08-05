// Test authentication endpoints
export async function testAuthFlow() {
  const baseUrl = "http://localhost:3000";
  
  console.log("🧪 Testing authentication flow...");

  try {
    // Test registration
    console.log("1. Testing user registration...");
    const registerResponse = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@student.edu.vn",
        password: "password123",
        cccd: "123456789012",
        name: "Nguyễn Văn Test",
      }),
    });

    const registerData = await registerResponse.json();
    console.log("Registration response:", registerData);

    if (registerResponse.ok) {
      console.log("✅ Registration successful");
    } else {
      console.log("❌ Registration failed:", registerData.error);
    }

    // Test login
    console.log("2. Testing user login...");
    const loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@student.edu.vn",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    console.log("Login response:", loginData);

    if (loginResponse.ok) {
      console.log("✅ Login successful");
    } else {
      console.log("❌ Login failed:", loginData.error);
    }

    // Test duplicate CCCD registration
    console.log("3. Testing duplicate CCCD validation...");
    const duplicateResponse = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "another@student.edu.vn",
        password: "password123",
        cccd: "123456789012", // Same CCCD
        name: "Trần Thị Test",
      }),
    });

    const duplicateData = await duplicateResponse.json();
    if (duplicateResponse.status === 409) {
      console.log("✅ CCCD uniqueness validation working");
    } else {
      console.log("❌ CCCD uniqueness validation failed");
    }

    console.log("🎉 Authentication flow test completed");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAuthFlow();
}