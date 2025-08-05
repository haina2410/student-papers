# Vietnamese Student Paper Submission System

A system for new IT students to submit their documents before entering university, with teacher approval workflow.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Package Manager:** pnpm 10.14.0
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** better-auth with CCCD integration
- **File Storage:** AWS S3
- **Deployment:** Vercel

## Features

### Student Features (SV)
- Account registration with CCCD as unique identifier
- Download sample forms
- Upload completed documents (15MB limit)
- View submission status

### Teacher Features (GV)
- View all student submissions in table format
- Download student files
- View detailed student information
- Approve/reject submissions

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm 10.14.0
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database and AWS credentials
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

### Database Setup
- Local development uses PostgreSQL at `localhost:5432`
- Database name: `student_papers`
- Prisma migrations will be set up in the next phase

## Project Structure

```
src/
├── app/           # Next.js 15 App Router pages
├── components/    # Reusable React components
├── lib/           # Utility functions and configurations
└── types/         # TypeScript type definitions
```

## Development Status

✅ **Task 1 Complete:** Project setup with Next.js 15, TypeScript, Tailwind CSS, and ESLint

**Next:** Database configuration with Prisma and PostgreSQL

## Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## License

Private project for educational purposes.