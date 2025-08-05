---
title: Research Session
query: "What are the latest best practices for implementing better-auth with Next.js 15 in 2024? Include authentication setup, CCCD custom field integration, and security considerations for Vietnamese student management systems."
date: 8/6/2025
time: 12:50:04 AM
timestamp: 2025-08-05T17:50:04.710Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** What are the latest best practices for implementing better-auth with Next.js 15 in 2024? Include authentication setup, CCCD custom field integration, and security considerations for Vietnamese student management systems.

**Response:**

To implement authentication using Better-Auth in a Next.js 15 application for a Vietnamese student management system—with CCCD (Vietnamese national ID) as a custom field—follow these best practices for 2024. This guide covers authentication setup, CCCD integration, and security considerations, tailored to your project’s requirements and tasks.

---

## 1. Authentication Setup in Next.js 15 with Better-Auth

### 1.1. Why Better-Auth?
Better-Auth is a modern, open-source authentication solution designed for Next.js 15+ that supports both server and client components, integrates with modern ORMs (like Prisma), and is extensible for custom fields such as CCCD[4].

### 1.2. Installation and Initial Configuration

**Install Better-Auth:**
```bash
pnpm add better-auth
```
or
```bash
npm install better-auth
```
[4]

**Directory Structure:**
- Place authentication logic in `/app/api/auth/` or `/pages/api/auth/` depending on your routing strategy.
- Use `/lib/auth/` for reusable auth utilities.

**Basic Setup Example:**
```typescript
// /app/api/auth/[...betterauth]/route.ts
import { BetterAuth } from 'better-auth';
import { PrismaAdapter } from '@better-auth/prisma-adapter';
import prisma from '@/lib/prisma';

export default BetterAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Add providers as needed (credentials, OAuth, etc.)
  ],
  // Add custom fields and callbacks here
});
```
[4]

---

## 2. CCCD Custom Field Integration

### 2.1. Database Model with Prisma

**User Model Example:**
```prisma
model User {
  id        String   @id @default(uuid())
  cccd      String   @unique
  email     String   @unique
  password  String
  // ...other fields
}
```
- Ensure `cccd` is unique at the database level to prevent duplicates[2].

### 2.2. Registration Flow with CCCD

**Frontend Registration Form:**
- Add a CCCD input field with validation (length, numeric, etc.).
- Use Tailwind CSS for styling as per Task 4.

**API Route Example:**
```typescript
// /app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { cccd, email, password } = await req.json();

  // Validate CCCD (e.g., length, numeric)
  if (!/^\d{12}$/.test(cccd)) {
    return NextResponse.json({ error: 'Invalid CCCD' }, { status: 400 });
  }

  // Check uniqueness
  const existing = await prisma.user.findUnique({ where: { cccd } });
  if (existing) {
    return NextResponse.json({ error: 'CCCD already registered' }, { status: 409 });
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: { cccd, email, password: hashed },
  });

  return NextResponse.json({ user: { id: user.id, cccd: user.cccd, email: user.email } });
}
```
[3]

**Testing:**
- Write unit tests to ensure CCCD uniqueness and validation logic.
- Simulate registration with valid and invalid CCCD values.

---

## 3. Authentication Flows and Session Management

### 3.1. Sign-In and Sign-Out

- Use Better-Auth’s built-in methods for sign-in and sign-out.
- For credentials-based login, validate CCCD and password.

**Example:**
```typescript
// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { cccd, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { cccd } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  // Generate session/token here
  // ...
}
```
[3]

### 3.2. Protecting Routes

- Use Next.js 15 middleware to guard API routes and pages.
- Check for valid session or JWT before allowing access to protected resources (e.g., GV approval endpoints)[1][2].

**Example Middleware:**
```typescript
// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check session or token
  const isAuthenticated = /* logic */;
  if (!isAuthenticated) {
    return NextResponse.redirect('/auth/login');
  }
  return NextResponse.next();
}
```
[1]

---

## 4. Security Best Practices

### 4.1. Input Validation and Sanitization

- Validate all user inputs (CCCD, email, password) on both client and server.
- Use libraries like `zod` or `yup` for schema validation[3].
- Sanitize inputs to prevent SQL injection, even when using Prisma.

### 4.2. Password Handling

- Always hash passwords with a strong algorithm (bcrypt, argon2).
- Never store plaintext passwords.

### 4.3. Session and Token Security

- Use HTTP-only, Secure cookies for session tokens.
- Set appropriate SameSite policies.
- Rotate session secrets regularly[1][2].

### 4.4. Rate Limiting and Brute Force Protection

- Implement rate limiting on authentication endpoints to prevent brute-force attacks.
- Consider using libraries like `express-rate-limit` or custom middleware.

### 4.5. Logging and Monitoring

- Integrate Sentry for error monitoring as per Task 12.
- Log authentication failures for audit purposes, but never log sensitive data (passwords, CCCD).

---

## 5. Vietnamese Student Management System Considerations

### 5.1. CCCD as Primary Identifier

- CCCD is sensitive personal data; ensure compliance with Vietnamese data protection laws.
- Mask CCCD in logs and UI where not strictly necessary.

### 5.2. Role-Based Access Control (RBAC)

- Implement roles (e.g., SV for students, GV for teachers) in the user model.
- Use middleware to enforce permissions (e.g., only GV can approve submissions as per Task 11).

### 5.3. Localization

- Provide error messages and UI in Vietnamese for end-users.
- Validate CCCD format according to Vietnamese standards.

---

## 6. Example: End-to-End Registration and Login Flow

1. **Student visits `/register` page.**
2. **Fills out form:** CCCD, email, password.
3. **Client-side validation:** Checks CCCD is 12 digits, email format, password strength.
4. **POST to `/api/auth/register`:** Server validates, checks uniqueness, hashes password, creates user.
5. **On success:** Redirect to login or dashboard.
6. **Login:** User enters CCCD and password, server validates, creates session/JWT.
7. **Session stored:** In HTTP-only cookie.
8. **Protected routes:** Middleware checks session before allowing access.

---

## 7. Integration with Project Tasks

- **Task 3 & 4:** Use the above registration and login flows, ensuring CCCD is unique and validated.
- **Task 11:** Use authentication middleware to ensure only GV users can update approval status.
- **Task 12:** Monitor authentication endpoints with Sentry and test under load with k6.
- **Task 2:** Ensure Prisma schema includes unique CCCD and integrates with Better-Auth’s adapter.

---

## 8. Edge Cases and Pitfalls

- **Duplicate CCCD:** Ensure atomic checks and unique constraints at the DB level to prevent race conditions.
- **Password Reset:** Implement secure password reset via email, using tokenized links.
- **Session Expiry:** Handle session expiration gracefully, prompting re-login.
- **CCCD Exposure:** Never expose full CCCD in client-side code or logs.
- **Internationalization:** Prepare for future support of non-Vietnamese users by abstracting identifier logic.

---

## 9. References and Further Reading

- [Next.js 15 Authentication Best Practices][1]
- [Next.js 15 Auth.js Boilerplate][2]
- [Next.js Official Auth Guide][3]
- [Better-Auth with Next.js 15 (YouTube)][4]

---

By following these practices, you will have a secure, scalable, and compliant authentication system tailored for Vietnamese student management, with robust CCCD integration and modern Next.js 15 features.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-08-05T17:50:04.710Z*
