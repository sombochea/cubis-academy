# proxy.ts vs middleware.ts in Next.js

## Important: Always Use proxy.ts!

In this project, we use **`proxy.ts`** instead of the standard `middleware.ts` for Next.js middleware functionality.

## Why proxy.ts?

`proxy.ts` is the recommended approach when using NextAuth.js v5 with middleware because:

1. **Better Auth Integration** - Direct access to auth session via `auth()` wrapper
2. **Cleaner Code** - No need to manually call `auth()` in middleware
3. **Type Safety** - Better TypeScript support with auth context
4. **NextAuth Convention** - Follows NextAuth.js v5 best practices

## File Structure

```
project/
├── proxy.ts          ✅ Use this for middleware
├── middleware.ts     ❌ Don't create this
├── auth.ts           ✅ Auth configuration
└── auth.config.ts    ✅ Auth callbacks
```

## proxy.ts Structure

```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // req.auth contains the session
  const session = req.auth;
  
  // Your middleware logic here
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

## What We Added to proxy.ts

### 1. Session Token Validation

```typescript
// If user is logged in, validate session token
if (session?.user?.id) {
  const token = session.user as any;
  const sessionToken = token.sessionToken;

  // If no session token, this is an old JWT - force re-login
  if (!sessionToken) {
    console.log('🔒 No session token, redirecting to login');
    
    const response = NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    // Clear the session cookies
    response.cookies.delete('authjs.session-token');
    response.cookies.delete('__Secure-authjs.session-token');
    return response;
  }
}
```

### 2. Request Headers for Server Components

```typescript
// Add session token to request headers for server components to validate
const requestHeaders = new Headers(req.headers);
requestHeaders.set('x-session-token', sessionToken);
requestHeaders.set('x-user-id', session.user.id);

return NextResponse.next({
  request: {
    headers: requestHeaders,
  },
});
```

## Complete Flow

```
Request
    ↓
proxy.ts (Edge Runtime)
    ↓
Check if user logged in
    ↓
Validate session token exists
    ↓
If no token → Redirect to login
    ↓
If has token → Add to headers
    ↓
Server Component
    ↓
validateSessionServer() checks database
    ↓
If invalid → Redirect to login
    ↓
If valid → Render page
```

## Comparison

### middleware.ts (Standard Next.js)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // No direct auth access
  // Need to manually call auth()
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};
```

### proxy.ts (NextAuth.js v5)

```typescript
// proxy.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // ✅ Direct auth access via req.auth
  const session = req.auth;
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/protected/:path*'],
};
```

## Benefits of proxy.ts

| Feature | middleware.ts | proxy.ts |
|---------|---------------|----------|
| **Auth Access** | Manual | Automatic |
| **Type Safety** | Basic | Enhanced |
| **Code Clarity** | More verbose | Cleaner |
| **NextAuth Integration** | Manual | Built-in |
| **Session Access** | Need to call auth() | req.auth |

## Common Mistakes

### ❌ Don't Do This

```typescript
// Don't create middleware.ts when using NextAuth
// middleware.ts
export function middleware(request: NextRequest) {
  // This will conflict with proxy.ts
}
```

### ✅ Do This

```typescript
// Use proxy.ts instead
// proxy.ts
export default auth((req) => {
  // All middleware logic here
});
```

## Migration from middleware.ts to proxy.ts

If you have existing `middleware.ts`:

1. **Rename** `middleware.ts` to `proxy.ts`
2. **Wrap** your middleware function with `auth()`
3. **Update** session access from `await auth()` to `req.auth`
4. **Test** all protected routes

### Before (middleware.ts)

```typescript
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  const session = await auth(); // Manual call
  
  if (session?.user) {
    // Logic
  }
  
  return NextResponse.next();
}
```

### After (proxy.ts)

```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth; // Direct access
  
  if (session?.user) {
    // Logic
  }
  
  return NextResponse.next();
});
```

## Key Takeaways

1. ✅ **Always use `proxy.ts`** for middleware in this project
2. ✅ **Never create `middleware.ts`** when using NextAuth.js v5
3. ✅ **Access session via `req.auth`** in proxy.ts
4. ✅ **Follow NextAuth.js v5 conventions** for best practices

## References

- [NextAuth.js v5 Middleware](https://authjs.dev/getting-started/session-management/protecting)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Remember**: In this project, `proxy.ts` = middleware! 🎯
