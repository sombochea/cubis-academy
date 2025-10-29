# Edge Runtime Fix - Complete Solution

## The Problem

Next.js middleware runs in the **Edge Runtime**, which doesn't support Node.js modules like `crypto`. The error occurred because:

1. `bcrypt` requires Node.js `crypto` module
2. Middleware was importing code that used `bcrypt`
3. Edge Runtime doesn't support `crypto`

## The Solution

We split the authentication into two separate NextAuth instances:

### 1. Edge-Compatible Config (`auth.config.ts`)

Contains only Edge-compatible code - NO bcrypt, NO Node.js modules:

```typescript
// auth.config.ts - Edge compatible
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Empty - providers added in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Route protection logic
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      // ... route checks
      return true;
    },
    jwt({ token, user }) { ... },
    session({ session, token }) { ... },
  },
  pages: { signIn: '/login' },
} satisfies NextAuthConfig;
```

### 2. Full Config with Node.js Support (`auth.ts`)

Runs in Node.js runtime with full access to bcrypt and database:

```typescript
// auth.ts - Node.js runtime
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs'; // ✅ OK here - Node.js runtime

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({ ... }),
    Credentials({
      async authorize(credentials) {
        // bcrypt.compare() works here
        const isValid = await bcrypt.compare(password, user.passHash);
        return isValid ? user : null;
      },
    }),
  ],
  // ... rest of config
});
```

### 3. Middleware (`middleware.ts`)

Creates its own NextAuth instance using ONLY the Edge-compatible config:

```typescript
// middleware.ts - Edge runtime
import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // ✅ No bcrypt here

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

**Critical**: Middleware imports `authConfig` directly, NOT from `./auth`, preventing bcrypt from loading.

## How It Works

```
┌─────────────────────────────────────────────┐
│  Middleware (Edge Runtime)                  │
│  ├─ NextAuth(authConfig)                    │
│  ├─ Route protection                        │
│  └─ NO bcrypt ✅                            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  API Routes (Node.js Runtime)               │
│  ├─ NextAuth with providers                 │
│  ├─ bcrypt.compare() ✅                     │
│  └─ Database access ✅                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Pages (Node.js Runtime)                    │
│  ├─ auth() from ./auth                      │
│  ├─ Full database access ✅                 │
│  └─ All Node.js features ✅                 │
└─────────────────────────────────────────────┘
```

## Why This Works

1. **Two Separate NextAuth Instances**:
   - Middleware: `NextAuth(authConfig)` - Edge-compatible
   - API/Pages: `NextAuth({ ...authConfig, providers })` - Full Node.js

2. **No Shared Imports**:
   - Middleware never imports from `./auth`
   - Middleware only uses `authConfig` (no bcrypt)

3. **Runtime Separation**:
   - Edge Runtime: Route checks only
   - Node.js Runtime: Authentication logic

## Testing

```bash
# Clear cache
rm -rf .next

# Build should succeed
pnpm build

# Dev server should work
pnpm dev
```

Visit http://localhost:3000 - No more Edge Runtime errors! 🎉

## Files Structure

```
auth.config.ts    → Edge-compatible (no bcrypt)
auth.ts           → Full Node.js (with bcrypt)
middleware.ts     → Uses auth.config.ts only
```

## Key Takeaways

✅ **Do**: Create separate NextAuth instances for Edge and Node.js
✅ **Do**: Keep bcrypt and Node.js modules in `auth.ts` only
✅ **Do**: Import `authConfig` in middleware, not `auth`
❌ **Don't**: Import from `./auth` in middleware
❌ **Don't**: Put bcrypt in `auth.config.ts`

## References

- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [Auth.js Edge Compatibility](https://authjs.dev/getting-started/deployment#edge-compatibility)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
