# Edge Runtime Session Fix

## Problem

When using Next.js Edge Runtime (middleware, auth callbacks), Node.js modules like `crypto` are not available:

```
Error: The edge runtime does not support Node.js 'crypto' module.
```

## Solution

We moved session creation from middleware to a client-side API call.

## Changes Made

### 1. Use Web Crypto API in auth.config.ts

**Before (Node.js crypto):**
```typescript
token.sessionToken = crypto.randomUUID(); // ❌ Not available in edge runtime
```

**After (Web Crypto API):**
```typescript
// ✅ Edge-compatible
if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
  token.sessionToken = globalThis.crypto.randomUUID();
} else {
  // Fallback
  token.sessionToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
```

### 2. Remove Session Creation from Middleware

**Before:**
```typescript
// middleware.ts
import { createSession } from './lib/session-store'; // ❌ Uses Node.js modules

export async function middleware(request: NextRequest) {
  await createSession({ ... }); // ❌ Can't use in edge runtime
}
```

**After:**
```typescript
// Removed middleware.ts entirely
// Session creation moved to API route
```

### 3. Create API Route for Session Creation

**New file: `app/api/sessions/ensure/route.ts`**
```typescript
// ✅ Runs in Node.js runtime, can use all modules
export async function POST(req: Request) {
  const session = await auth();
  
  if (session?.user?.id) {
    const existingSession = await getSession(sessionToken);
    
    if (!existingSession) {
      await createSession({
        userId: session.user.id,
        sessionToken,
        ipAddress: req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }
}
```

### 4. Create Client-Side Hook

**New file: `lib/hooks/useEnsureSession.ts`**
```typescript
'use client';

export function useEnsureSession() {
  useEffect(() => {
    // Call API to ensure session exists
    fetch('/api/sessions/ensure', { method: 'POST' });
  }, []);
}
```

### 5. Use Hook in SessionsManager

```typescript
export function SessionsManager() {
  // Ensure session is created on first load
  useEnsureSession();
  
  // ... rest of component
}
```

## Flow Comparison

### Before (Middleware - ❌ Broken)

```
User logs in
    ↓
JWT created with sessionToken
    ↓
Middleware runs (Edge Runtime)
    ↓
❌ Try to import session-store (Node.js modules)
    ↓
❌ Error: Node.js modules not available in edge runtime
```

### After (API Route - ✅ Working)

```
User logs in
    ↓
JWT created with sessionToken (Web Crypto API)
    ↓
User visits profile page
    ↓
useEnsureSession() hook runs
    ↓
Calls /api/sessions/ensure (Node.js runtime)
    ↓
✅ Session created with full Node.js module access
```

## Why This Works

### Edge Runtime Limitations

Edge Runtime is a lightweight JavaScript runtime that:
- ✅ Supports Web APIs (fetch, crypto, etc.)
- ❌ Does NOT support Node.js modules (fs, crypto, etc.)
- ✅ Fast and globally distributed
- ❌ Limited functionality

### Node.js Runtime

API routes run in Node.js runtime:
- ✅ Full Node.js module support
- ✅ Can use database connections
- ✅ Can use Redis/Keyv
- ✅ Can use any npm package

## Best Practices

### ✅ Do

1. **Use Web APIs in edge runtime:**
   ```typescript
   // ✅ Good
   globalThis.crypto.randomUUID()
   fetch()
   Response
   Request
   ```

2. **Use API routes for Node.js modules:**
   ```typescript
   // ✅ Good - in API route
   import { db } from '@/lib/drizzle/db';
   import { createSession } from '@/lib/session-store';
   ```

3. **Call API routes from client:**
   ```typescript
   // ✅ Good - client-side
   fetch('/api/sessions/ensure', { method: 'POST' });
   ```

### ❌ Don't

1. **Don't use Node.js modules in edge runtime:**
   ```typescript
   // ❌ Bad - in middleware or auth.config.ts
   import crypto from 'crypto';
   import { db } from '@/lib/drizzle/db';
   ```

2. **Don't use crypto.randomUUID() without checking:**
   ```typescript
   // ❌ Bad - might not exist
   crypto.randomUUID()
   
   // ✅ Good - check first
   globalThis.crypto?.randomUUID()
   ```

## Edge Runtime Compatible Modules

### ✅ Safe to Use

- `next/server` (NextResponse, NextRequest)
- `next-auth` (auth callbacks)
- Web APIs (fetch, crypto, etc.)
- Pure JavaScript utilities

### ❌ Not Safe to Use

- Database clients (pg, mysql, etc.)
- Redis clients (ioredis, redis)
- File system (fs)
- Node.js crypto
- Most npm packages that use Node.js APIs

## Testing

### Test Edge Runtime Compatibility

```bash
# Start dev server
pnpm dev

# Check for errors
# Should NOT see: "The edge runtime does not support Node.js 'crypto' module"
```

### Test Session Creation

1. Login to the application
2. Go to profile page
3. Check browser console - should see API call to `/api/sessions/ensure`
4. Check server logs - should see "✅ Session created for user: ..."
5. Refresh page - should see "exists: true" (session already exists)

## Troubleshooting

### Error: "crypto is not defined"

**Cause**: Using Node.js crypto in edge runtime

**Solution**: Use `globalThis.crypto.randomUUID()` instead

### Error: "Cannot find module 'pg'"

**Cause**: Importing database client in edge runtime

**Solution**: Move database calls to API routes

### Session Not Created

**Cause**: API route not being called

**Solution**: Check that `useEnsureSession()` hook is being used

## Summary

✅ **Problem**: Edge runtime doesn't support Node.js modules
✅ **Solution**: Move session creation to API route
✅ **Result**: Sessions work correctly without edge runtime errors

---

**Key Takeaway**: Use API routes for Node.js modules, use Web APIs in edge runtime.
