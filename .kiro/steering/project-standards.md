---
inclusion: always
---

# Project Standards

## Tech Stack (Non-Negotiable)

- Next.js 16+ App Router with Server Components (default to server, use 'use client' only when needed)
- TailwindCSS v4+ for styling
- ShadCN UI components (accessible, customizable)
- TanStack Form + Zod for all forms
- Motion 12+ for animations
- PostgreSQL 18+ with Drizzle ORM
- Auth.js v5 beta for authentication
- useSWR for client-side data fetching
- Resend for emails
- Lingui v5+ for internationalization (i18n)
- React Country Flag for flag icons

## Naming Conventions (Critical - Must Follow)

- Database fields: `snake_case` (e.g., `full_name`, `created_at`, `user_id`)
- TypeScript variables/functions: `camelCase` (e.g., `getUserById`, `isLoading`)
- React components: `PascalCase` (e.g., `LoginForm`, `UserProfile`)
- Component files: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
- Non-component files: `kebab-case` (e.g., `auth-utils.ts`, `db-queries.ts`)
- API routes: `kebab-case` (e.g., `route.ts` in `api/user-profile/`)

## TypeScript Rules

- NEVER use `any` type (use `unknown` if type is truly unknown)
- Define explicit return types for functions
- Use Zod schemas for runtime validation, infer TypeScript types from them
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use strict mode (already configured in tsconfig.json)

## Component Architecture

- Default to Server Components (no 'use client' directive)
- Use 'use client' only for: forms, interactive UI, hooks (useState, useEffect, useSWR)
- Keep components small (<150 lines) and single-purpose
- Extract reusable logic into custom hooks or utilities
- Use composition over prop drilling (Context API when needed)
- Implement error boundaries for client components

## Data Fetching Patterns

- Server Components: Direct database queries via Drizzle
- Client Components: useSWR for caching and revalidation
- API Routes: Validate with Zod, return typed responses
- Always handle loading and error states explicitly

## Form Handling

- Use TanStack Form + Zod for ALL forms
- Validate on client (TanStack Form) AND server (API route)
- Pass Zod schemas directly to `validators.onChange` (no adapter)
- Show field-level errors below inputs
- Disable submit button when invalid or submitting

## Security Requirements (Non-Negotiable)

- Hash passwords with bcrypt (never store plain text)
- Validate ALL inputs on both client and server
- Implement RBAC: Student, Teacher, Admin roles
- Protect routes with middleware checking session + role
- Never expose sensitive data in client-side code
- Use CSRF tokens on forms (Auth.js handles this)

## Accessibility (WCAG AA Compliance)

- Use semantic HTML (`<button>`, `<label>`, `<nav>`)
- Pair all inputs with labels (`htmlFor` + `id`)
- Provide alt text for images
- Ensure keyboard navigation works
- Use `aria-invalid`, `aria-describedby` for form errors
- Test with screen readers

## Internationalization (i18n)

- Use Lingui v5+ for all translations
- Supported languages: Khmer (km - default), English (en)
- Wrap all user-facing text with `<Trans>` component
- Use Kantumruy Pro font for Khmer text
- Use Manrope font for English text
- Store translations in `locales/{locale}/messages.po`
- Run `pnpm i18n:extract` to extract messages
- Run `pnpm i18n:compile` to compile translations
- All routes must be locale-aware: `/{locale}/path`

## Responsive Design (Cross-Platform)

- Mobile-first approach (design for mobile, enhance for desktop)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Test on: Mobile (375px), Tablet (768px), Desktop (1440px)
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Touch-friendly targets: minimum 44x44px for buttons
- Optimize images with Next.js `<Image>` component (responsive)
- Hide/show elements appropriately: `hidden lg:block`
- Stack layouts vertically on mobile, horizontal on desktop
- Test on iOS Safari, Android Chrome, Desktop Chrome/Firefox

## Project Structure

```
app/
├── [locale]/        # Locale-aware routes (km, en)
│   ├── (auth)/      # Login, register routes
│   ├── (student)/   # Student portal (/student/*)
│   ├── (teacher)/   # Teacher dashboard (/teacher/*)
│   ├── (admin)/     # Admin backoffice (/admin/*)
│   ├── unauthorized/
│   ├── layout.tsx   # Locale layout with fonts
│   └── page.tsx     # Landing page
└── api/             # API routes (no locale)

components/
├── ui/              # ShadCN components (Button, Input, etc.)
├── LanguageProvider.tsx
├── LanguageSwitcher.tsx
└── [feature]/       # Feature-specific components

lib/
├── auth/            # Auth utilities (session.ts)
├── drizzle/         # DB schema, queries, migrations
├── validations/     # Zod schemas (auth.ts, course.ts, etc.)
├── hooks/           # Custom hooks (useLocale.ts)
├── i18n.ts          # i18n configuration
└── utils.ts         # General utilities

locales/
├── km/              # Khmer translations
│   └── messages.po
└── en/              # English translations
    └── messages.po

proxy.ts             # Route protection & locale routing (Next.js 16)
```

## Performance

- Target <300ms response time for dashboard pages
- Use Server Components by default (faster initial load)
- Implement useSWR caching for client-side data
- Optimize images with Next.js `<Image>` component
- Lazy load heavy components with `next/dynamic`
