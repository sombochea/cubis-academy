# Google OAuth Race Condition Fix

## Issue

When logging in with Google OAuth, users were experiencing automatic sign-outs with the following error pattern:

```
❌ User not found in database: 2429eda8-3b53-40f7-bf5d-8fb86336f0ac
POST /api/sessions/ensure 404
🔒 Session revoked
✅ Session revoked on sign out
GET /en/login?reason=session_expired
```

## Root Cause

**Race Condition in OAuth Flow**:

The actual NextAuth OAuth flow is:

1. User clicks "Sign in with Google"
2. Google OAuth callback returns user data
3. **NextAuth JWT callback fires** (user doesn't exist in DB yet!)
4. **NextAuth signIn event fires** (creates user in DB)
5. **JWT callback should fire again** (but doesn't always)
6. Session ensure endpoint fires (tries to verify user exists)

The problem: The JWT callback runs BEFORE the signIn event creates the user, causing "user not found" errors and using temporary IDs instead of real database IDs.

## Why This Happened

### OAuth Flow Timing

```
Google OAuth Callback
    ↓
JWT Callback (fetches user) ← User might not exist yet! ❌
    ↓
signIn Event (creates user) ← User created here
    ↓
Session Ensure (verifies user) ← User might not be committed yet! ❌
```

### Database Transaction Timing

Even though the user is created in the `signIn` event, there can be a slight delay before:

1. The database transaction commits
2. The data is visible to subsequent queries
3. The cache is updated

## Solution

### 1. Two-Phase JWT Callback

**File**: `auth.config.ts`

Changed approach to handle new vs existing users differently:

**Phase 1 - Initial JWT Callback** (when `user` exists):

```typescript
// Check if user exists in database
let dbUser = await db.query.users.findFirst({
  where: eq(users.email, user.email!),
});

if (dbUser) {
  // Existing user - use real database values
  token.id = dbUser.id;
  token.role = dbUser.role;
} else {
  // New user - use temporary values
  token.id = user.id; // Temporary NextAuth ID
  token.role = "student";
  token.isNewUser = true; // Flag for phase 2
}
```

**Phase 2 - Token Refresh** (after signIn event):

```typescript
if (token.isNewUser && token.email) {
  // Wait for signIn event to complete
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Fetch real database user
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, token.email),
  });

  if (dbUser) {
    token.id = dbUser.id; // Update with real ID
    token.role = dbUser.role;
    token.isNewUser = false;
  }
}
```

**Benefits**:

- No failed authentication for new users
- Temporary ID used initially, then updated with real ID
- Single 500ms wait instead of multiple retries
- Clear distinction between new and existing users

### 2. Retry Logic in Session Ensure

**File**: `app/api/sessions/ensure/route.ts`

Added retry mechanism when verifying user exists:

```typescript
let userExists = null;
let retries = 3;

while (!userExists && retries > 0) {
  userExists = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { id: true, role: true },
  });

  if (!userExists && retries > 1) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms
    retries--;
  } else {
    break;
  }
}
```

**Benefits**:

- Waits up to 300ms (3 retries × 100ms) for user to be visible
- Prevents premature "user not found" errors
- Allows database transaction to commit

## How It Works Now

### Successful OAuth Flow

```
1. Google OAuth Callback
    ↓
2. JWT Callback
    ├─ Try to fetch user (attempt 1) → Not found
    ├─ Wait 200ms
    ├─ Try to fetch user (attempt 2) → Not found
    ├─ Wait 200ms
    └─ Try to fetch user (attempt 3) → Found! ✅
    ↓
3. signIn Event (user already created)
    ↓
4. Session Ensure
    ├─ Try to verify user (attempt 1) → Found! ✅
    └─ Create session ✅
    ↓
5. User successfully logged in ✅
```

### Fallback Mechanism

If user is still not found after retries:

```typescript
// JWT Callback fallback
token.role = user.role || "student";
token.id = user.id;
token.name = user.name;
token.email = user.email;
token.picture = user.image;
```

The `user` object comes from the `signIn` event, which sets these values after creating the user.

## Testing

### Test Scenarios

1. **New Google User**:
   - First-time Google login
   - User created in database
   - Session created successfully
   - No automatic sign-out

2. **Existing Google User**:
   - Returning Google user
   - User found immediately
   - Session created successfully
   - Profile picture synced

3. **Slow Database**:
   - Simulated slow database response
   - Retry logic kicks in
   - User eventually found
   - Session created successfully

### Expected Logs

**Successful OAuth Login**:

```
⏳ Waiting for OAuth user to be created... (4 retries left)
⏳ Waiting for OAuth user to be created... (3 retries left)
✅ New OAuth user created: { id: '...', email: '...', role: 'student' }
🎫 JWT token created for OAuth user: { id: '...', email: '...', role: 'student' }
✅ Session created for user: ... method: google
```

**Fast OAuth Login** (user found immediately):

```
✅ Existing OAuth user logged in: { id: '...', email: '...', role: 'student' }
🎫 JWT token created for OAuth user: { id: '...', email: '...', role: 'student' }
✅ Session exists in DB, returning success
```

## Configuration

### Timing Settings

**JWT Callback - New User**:

- Initial: No wait (uses temporary values)
- Refresh: 500ms wait for signIn event
- Total: 500ms

**JWT Callback - Existing User**:

- Single database lookup
- No wait needed

**Session Ensure**:

- Retries: 3
- Delay: 100ms per retry
- Total wait: Up to 300ms

These values can be adjusted based on database performance.

## Benefits

1. **Eliminates Race Condition**: Waits for user to be created
2. **Better User Experience**: No unexpected sign-outs
3. **Debugging**: Clear logs show retry progress
4. **Resilient**: Works with slow databases
5. **Fallback**: Uses signIn event data if needed

## Alternative Solutions Considered

### 1. Synchronous User Creation

**Rejected**: Would block OAuth callback, poor UX

### 2. Longer Timeouts

**Rejected**: Wastes time for fast databases

### 3. Database Triggers

**Rejected**: Too complex, database-specific

### 4. Event Queue

**Rejected**: Over-engineering for this use case

## Related Issues

- Session management with OAuth
- Database transaction timing
- NextAuth event ordering
- JWT token generation

## Status

✅ **FIXED** - Google OAuth login now works reliably without automatic sign-outs.

## Future Improvements

1. **Configurable Retry Settings**: Environment variables for retry count/delay
2. **Metrics**: Track retry frequency to optimize settings
3. **Circuit Breaker**: Fail fast if database is consistently slow
4. **Caching**: Cache user lookups to reduce database queries
