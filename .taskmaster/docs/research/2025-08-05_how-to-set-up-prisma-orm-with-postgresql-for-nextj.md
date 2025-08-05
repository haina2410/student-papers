---
title: Research Session
query: "How to set up Prisma ORM with PostgreSQL for Next.js 15? Include schema design for User and File models, better-auth integration, and migration best practices for Vietnamese student management systems."
date: 8/6/2025
time: 12:51:13 AM
timestamp: 2025-08-05T17:51:13.559Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** How to set up Prisma ORM with PostgreSQL for Next.js 15? Include schema design for User and File models, better-auth integration, and migration best practices for Vietnamese student management systems.

**Response:**

To set up Prisma ORM with PostgreSQL for a Next.js 15 project—tailored for a Vietnamese student management system with User and File models, better-auth integration, and robust migration practices—follow these detailed steps. This guide covers installation, schema design, integration, and best practices, with actionable code and configuration examples.

---

## 1. Project Initialization and Dependencies

**a. Initialize Next.js 15 with TypeScript and pnpm**

```bash
pnpm create next-app@latest student-mgmt --typescript
cd student-mgmt
```

**b. Install Prisma, PostgreSQL driver, and Better-Auth**

```bash
pnpm add @prisma/client pg
pnpm add -D prisma
pnpm add better-auth # Replace with the actual package name if different
```

**c. Initialize Prisma**

```bash
npx prisma init
```
This creates a `prisma/` directory with `schema.prisma` and a `.env` file for your database connection[1][4].

---

## 2. PostgreSQL Connection Configuration

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/student_mgmt"
```
- Use a strong password and a dedicated database for development.
- For production, use a managed PostgreSQL instance and secure credentials.

---

## 3. Prisma Schema Design

### a. User Model (with better-auth compatibility)

For Vietnamese student management, the User model should include:
- `id`: Primary key (UUID or cuid for global uniqueness)
- `cccd`: Unique Vietnamese citizen ID (string, unique)
- `email`: Unique, required for authentication
- `name`: Student's full name
- `password`: Hashed password (managed by better-auth)
- `role`: Enum (e.g., STUDENT, TEACHER, ADMIN)
- `createdAt`, `updatedAt`: Timestamps

**Example: `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

model User {
  id        String   @id @default(cuid())
  cccd      String   @unique
  email     String   @unique
  name      String
  password  String
  role      Role     @default(STUDENT)
  files     File[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
- `cccd` is unique and required, matching Vietnamese requirements.
- `role` allows for future expansion (e.g., GV = Giáo viên/Teacher).

### b. File Model

The File model should:
- Link to a User (foreign key)
- Store S3 object ID (or local file path)
- Track upload and approval status

**Example:**

```prisma
model File {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  s3ObjectId String
  fileName   String
  status     FileStatus @default(PENDING)
  uploadedAt DateTime   @default(now())
  approvedAt DateTime?
}

enum FileStatus {
  PENDING
  APPROVED
  REJECTED
}
```
- `s3ObjectId` maps to the S3 key or file identifier.
- `status` supports the GV approval workflow (Task 11).
- `approvedAt` is nullable, set when a file is approved.

---

## 4. Migration Best Practices

**a. Running Initial Migration**

```bash
npx prisma migrate dev --name init
```
- This creates tables and applies the schema to your local database[3].
- Use descriptive migration names (e.g., `add-user-and-file-models`).

**b. Handling Schema Changes**

- For each schema update, run:
  ```bash
  npx prisma migrate dev --name <change-description>
  ```
- Review generated SQL in `prisma/migrations/` for accuracy.
- For production, use `npx prisma migrate deploy` to apply migrations safely.

**c. Seeding Data**

- Create `prisma/seed.ts` for initial data (e.g., admin user).
- Run with:
  ```bash
  npx prisma db seed
  ```

**d. Migration Tips**
- Never edit migration files manually unless you understand the risks.
- Always back up production data before applying new migrations.
- Use unique constraints (`@unique`) for fields like `cccd` and `email` to enforce data integrity.

---

## 5. Better-Auth Integration

**a. User Model Compatibility**

- Ensure your User model matches better-auth’s requirements (typically: `id`, `email`, `password`).
- Add `cccd` as a unique field and ensure registration flow collects it.

**b. Registration Flow**

- Extend the registration form to include `cccd`.
- On registration, check for existing `cccd` and `email` to prevent duplicates.
- Use Prisma’s unique constraint error handling to provide user feedback.

**Example (API Route):**

```typescript
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export default async function register(req, res) {
  const { email, password, cccd, name } = req.body;
  // Validate input (sanitize, check format)
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: await hash(password, 10),
        cccd,
        name,
      },
    });
    res.status(201).json({ user });
  } catch (e) {
    if (e.code === 'P2002') { // Unique constraint failed
      res.status(409).json({ error: 'Email or CCCD already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
}
```

**c. Authentication**

- Use better-auth’s hooks to authenticate via email/password.
- Ensure all queries use Prisma’s parameterized methods to prevent SQL injection.

**d. Password Reset**

- Use better-auth’s built-in password reset, ensuring email is unique and verified.
- For development, mock the email service as per Task 3.

---

## 6. Testing and Validation

**a. Prisma Studio**

```bash
npx prisma studio
```
- Use this GUI to inspect and edit database records, validate constraints, and test relationships.

**b. Sample Query**

```typescript
const user = await prisma.user.findUnique({ where: { cccd: '012345678901' } });
```
- Test insertion and retrieval for both User and File models.

**c. Unique Constraint Validation**

- Attempt to insert duplicate `cccd` or `email` and confirm errors are thrown.

---

## 7. Edge Cases and Pitfalls

- **CCCD Format:** Validate CCCD format (12 digits, numeric) at both frontend and backend.
- **File Ownership:** Ensure only the owning user or authorized GV can access/modify File records.
- **Migration Conflicts:** If multiple developers work on the schema, coordinate migrations to avoid conflicts.
- **Production Secrets:** Never commit `.env` with real credentials; use environment variables in deployment.

---

## 8. Example Directory Structure

```
/prisma
  schema.prisma
  seed.ts
/pages/api/auth/...
/lib/prisma.ts
.env
```

**lib/prisma.ts:**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 9. References and Further Reading

- [Prisma with Next.js 15 and PostgreSQL step-by-step][1]
- [Vercel guide: Next.js, Prisma, Postgres][2]
- [Prisma migration and seeding best practices][3]
- [Better-auth documentation (official)][project context]

---

## 10. Summary Table: Key Steps

| Step                | Command/Action                                    | File/Location         |
|---------------------|---------------------------------------------------|-----------------------|
| Install Prisma/pg   | `pnpm add @prisma/client pg`                      | root                  |
| Init Prisma         | `npx prisma init`                                 | prisma/schema.prisma  |
| Define Models       | Edit `schema.prisma`                              | prisma/schema.prisma  |
| Run Migration       | `npx prisma migrate dev --name init`              | prisma/migrations/    |
| Seed Data           | `npx prisma db seed`                              | prisma/seed.ts        |
| Test with Studio    | `npx prisma studio`                               | browser               |
| Integrate Auth      | Use better-auth, extend registration for `cccd`   | pages/api/auth/       |

---

**By following this approach, you will have a robust, scalable, and secure Prisma/PostgreSQL setup for your Next.js 15-based Vietnamese student management system, with full support for unique CCCD-based authentication and file management workflows.**


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-08-05T17:51:13.559Z*
