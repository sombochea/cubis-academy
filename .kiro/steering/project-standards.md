---
inclusion: always
---

# Project Standards

## Tech Stack
- Next.js 16+ (App Router with Server Components)
- TailwindCSS v4+ (Utility-first CSS)
- ShadCN UI components (Accessible, customizable)
- TanStack Form (High-performance form management)
- Motion 12+ (Smooth animations)
- PostgreSQL 18+ with Drizzle ORM (Type-safe queries)
- Auth.js v5 beta (Authentication & authorization)
- Zod (TypeScript-first validation)
- useSWR (React Hooks for data fetching)
- Resend (Email service)

## Naming Conventions (Critical)
- Database fields: `snake_case` (e.g., `full_name`, `created_at`)
- TypeScript variables/functions: `camelCase`
- React components: `PascalCase`
- Files: `kebab-case` (except component files which use `PascalCase`)

## Code Style Rules
- Use TypeScript strictly - never use `any` type (use `unknown` if needed)
- Prefer server components over client components
- Use TanStack Form for all forms (with Zod validation)
- Use useSWR for client-side data fetching
- Validate all inputs on both client and server with Zod schemas
- Follow WCAG AA accessibility standards
- Create reusable components and utilities (DRY principle)
- Keep components small and focused (Single Responsibility)
- Use composition over inheritance
- Implement proper error boundaries
- Always handle loading and error states

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
