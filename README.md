# CUBIS Academy

A modern Learning Management System (LMS) platform for short-term and professional skill-based courses, connecting teachers and students for online tutoring and collaboration.

## Overview

CUBIS Academy focuses on technology-related subjects including Web Development, UX/UI Design, DevOps, Programming, and Problem-Solving Skills. The platform provides a clean, secure, and scalable environment for online learning.

## Key Features

### For Students
- **Registration & Authentication** - Sign up via email/password or Google OAuth2
- **Profile Management** - Manage personal information and preferences
- **Course Enrollment** - Browse and enroll in available courses
- **Payment System** - Secure payment processing and history tracking
- **Learning Materials** - Access course videos, resources, and live session links
- **Progress Tracking** - View scores and attendance records

### For Teachers
- **Schedule Management** - View and manage teaching schedules
- **Course Materials** - Upload and organize teaching resources
- **Online Tutoring** - Share Zoom/Google Meet links for live sessions
- **Student Assessment** - Add and update student scores
- **Attendance Tracking** - Mark and monitor student attendance

### For Administrators
- **Teacher Management** - Add, remove, and assign teachers to courses
- **Student Oversight** - Monitor student enrollments and progress
- **Course Management** - Oversee course catalog and assignments
- **Payment Oversight** - Track and manage payment transactions

## Tech Stack

- **Framework**: Next.js 16+
- **Styling**: TailwindCSS v4+
- **UI Components**: ShadCN UI
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Auth.js (beta) with Email + Google OAuth2
- **Email Service**: Resend
- **Data Fetching**: useSWR
- **Deployment**: Vercel

## Project Structure

```
root/
├── app/              # Next.js app router
│   ├── (auth)/       # Authentication routes
│   ├── (student)/    # Student portal
│   ├── (teacher)/    # Teacher dashboard
│   ├── (admin)/      # Admin backoffice
│   └── api/          # API routes
├── components/       # React components
│   ├── ui/           # ShadCN UI components
│   ├── forms/        # Form components
│   └── shared/       # Shared components
├── lib/              # Utilities and configurations
│   ├── auth/         # Authentication logic
│   ├── drizzle/      # Database schema
│   ├── utils/        # Helper functions
│   └── validations/  # Input validation
├── hooks/            # Custom React hooks
├── docs/             # Documentation
└── types/            # TypeScript definitions
```

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL (18+)
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cubis_academy

# Auth.js
AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
```

## Development Guidelines

- Follow Next.js and Vercel best practices
- Use `snake_case` for database fields
- Use `camelCase` for TypeScript/JavaScript
- Implement proper error handling and validation
- Write accessible, semantic HTML
- Document all features in `/docs`

## Security

- Secure authentication with Auth.js
- Role-based access control (RBAC)
- Input validation and sanitization
- CSRF protection
- Rate limiting on API routes

## Performance Targets

- Page load time: <300ms average
- First Contentful Paint: <1.5s
- Time to Interactive: <3s

## Contributing

Please read our contribution guidelines before submitting pull requests.

## Contributors

- Sambo Chea <cs@cubetiqs.com>

## License

Private - All rights reserved
