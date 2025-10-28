---
inclusion: always
---

# Project Standards

## Tech Stack
- Next.js 16+ (App Router)
- TailwindCSS v4+
- ShadCN UI components
- PostgreSQL with Drizzle ORM
- Auth.js (beta) for authentication
- useSWR for data fetching
- Resend for emails

## Naming Conventions (Critical)
- Database fields: `snake_case` (e.g., `full_name`, `created_at`)
- TypeScript variables/functions: `camelCase`
- React components: `PascalCase`
- Files: `kebab-case` (except component files which use `PascalCase`)

## Code Style Rules
- Use TypeScript strictly - never use `any` type
- Prefer server components over client components
- Use useSWR for client-side data fetching
- Validate all inputs on both client and server
- Follow WCAG AA accessibility standards
- Create reusable components and utilities (DRY principle)

## Project Structure
```
app/
├── (auth)/          # Auth routes (login, register)
├── (student)/       # Student portal
├── (teacher)/       # Teacher dashboard
├── (admin)/         # Admin backoffice
└── api/             # API routes

components/
├── ui/              # ShadCN components
├── forms/           # Form components
└── shared/          # Reusable components

lib/
├── auth/            # Auth utilities
├── drizzle/         # DB schema & queries
├── utils/           # General utilities
└── validations/     # Zod schemas
```

## Security (Non-Negotiable)
- Hash all passwords
- Validate inputs client and server-side
- Implement RBAC (Student, Teacher, Admin roles)
- Use CSRF protection on forms
- Never expose sensitive data client-side
- Protect routes based on user role

## Performance Targets
- Dashboard pages: <300ms response time
- Use server components by default
- Implement proper caching with useSWR
- Optimize images with Next.js Image component
