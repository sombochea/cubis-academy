# Password Change Security Feature

## Overview

When users change their password, the system automatically:
1. ✅ Validates current password
2. ✅ Updates to new password (hashed with bcrypt)
3. ✅ Revokes ALL other active sessions (keeps current session)
4. ✅ Sends notification email to user

## Security Benefits

### 🔒 Automatic Session Revocation

- **Problem**: If someone else has access to your account, changing password alone isn't enough
- **Solution**: All other sessions are automatically logged out
- **Result**: Only the device where you changed the password remains logged in

### 📧 Email Notifications

- **Immediate Awareness**: User gets email confirmation
- **Unauthorized Changes**: If user didn't change password, they know immediately
- **Session Count**: Email shows how many other devices were logged out

## How It Works

### User Flow

```
User goes to Profile → Security
    ↓
Enters current password
    ↓
Enters new password (min 6 characters)
    ↓
Confirms new password
    ↓
Clicks "Change Password"
    ↓
System validates current password ✅
    ↓
System updates password (bcrypt hash)
    ↓
System revokes all other sessions
    ↓
System sends notification email
    ↓
Success message shows:
  - "Password changed successfully!"
  - "X other sessions logged out"
  - "Notification email sent"
```

### Technical Flow

```typescript
// 1. Validate current password
const isValid = await bcrypt.compare(currentPassword, user.password);

// 2. Hash new password
const hashedPassword = await bcrypt.hash(newPassword, 10);

// 3. Update in database
await db.update(users)
  .set({ password: hashedPassword })
  .where(eq(users.id, userId));

// 4. Revoke other sessions (keep current)
const revokedCount = await revokeAllUserSessionsExceptCurrent(
  userId,
  currentSessionToken
);

// 5. Send notification email (async)
sendPasswordChangeNotification(userId, revokedCount);
```

## API Endpoint

### PUT /api/profile/password

**Authentication**: Required (session token)

**Request Body**:
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456",
  "confirmPassword": "newpass456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully",
  "revokedSessions": 2
}
```

**Error Responses**:

**401 Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request** (wrong current password):
```json
{
  "error": "Current password is incorrect"
}
```

**400 Bad Request** (same password):
```json
{
  "error": "New password must be different from current password"
}
```

**400 Bad Request** (validation error):
```json
{
  "error": "New password must be at least 6 characters"
}
```

**400 Bad Request** (OAuth account):
```json
{
  "error": "Cannot change password for OAuth accounts"
}
```

## Validation Rules

### Client-Side (TanStack Form + Zod)

```typescript
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

**Rules**:
- ✅ Current password: Required
- ✅ New password: Minimum 6 characters
- ✅ Confirm password: Must match new password

### Server-Side (API Route)

**Additional Checks**:
- ✅ User is authenticated
- ✅ Current password is correct (bcrypt compare)
- ✅ New password is different from current
- ✅ User has a password (not OAuth-only account)

## Session Revocation Logic

### Function: `revokeAllUserSessionsExceptCurrent`

```typescript
export async function revokeAllUserSessionsExceptCurrent(
  userId: string,
  currentSessionToken: string
): Promise<number> {
  // 1. Find all active sessions except current
  const sessions = await db.query.userSessions.findMany({
    where: and(
      eq(userSessions.userId, userId),
      eq(userSessions.isActive, true),
      ne(userSessions.sessionToken, currentSessionToken)
    ),
  });

  // 2. Mark as inactive in database
  await db.update(userSessions)
    .set({ isActive: false })
    .where(
      and(
        eq(userSessions.userId, userId),
        ne(userSessions.sessionToken, currentSessionToken)
      )
    );

  // 3. Remove from cache (Redis/PostgreSQL/Memory)
  const keyv = getCache();
  await Promise.all(sessions.map((s) => keyv.delete(s.sessionToken)));

  // 4. Return count of revoked sessions
  return sessions.length;
}
```

**Key Points**:
- Uses `ne()` (not equal) to exclude current session
- Updates both database AND cache
- Returns count for user feedback

## Email Notification

### Email Content

**Subject**: 🔐 Your CUBIS Academy password has been changed

**Body Includes**:
- ✅ User name
- ✅ Change timestamp
- ✅ Number of sessions revoked
- ✅ Security information
- ✅ Link to account security page
- ✅ Warning if user didn't make the change

### Email Template Preview

```
✅ Password Changed Successfully

Hi John Doe, your password has been updated

┌─────────────────────────────────────┐
│ Changed At:        Monday, Oct 30,  │
│                    2025 at 2:30 PM  │
│ Sessions Revoked:  2 other devices  │
└─────────────────────────────────────┘

🛡️ Security Enhanced
Your password has been successfully changed 
and all other active sessions have been 
automatically logged out for your security.

🔒 Sessions Logged Out
We've automatically logged out 2 other active 
sessions on your account. You'll need to log 
in again on those devices with your new password.

[View Account Security]

Didn't change your password?
If you didn't make this change, please contact 
our support team immediately.
```

### Email Configuration

**With Resend API Key**:
```env
RESEND_API_KEY=re_your_api_key_here
```
- Emails sent via Resend
- Production-ready
- Deliverability tracking

**Without API Key** (Development):
- Emails logged to console
- No actual sending
- Perfect for testing

```
📧 Password change notification (email not configured):
   To: user@example.com
   Subject: 🔐 Your CUBIS Academy password has been changed
   Time: Monday, October 30, 2025 at 2:30 PM PST
   Revoked Sessions: 2
```

## UI Components

### PasswordChangeForm

**Location**: `components/PasswordChangeForm.tsx`

**Features**:
- ✅ TanStack Form with Zod validation
- ✅ Password visibility toggles (eye icons)
- ✅ Real-time validation
- ✅ Loading states
- ✅ Success/error messages
- ✅ Shows revoked session count
- ✅ Internationalized (Lingui)

**Usage**:
```typescript
import { PasswordChangeForm } from '@/components/PasswordChangeForm';

<PasswordChangeForm locale={locale} />
```

### Success Message

Shows after successful password change:

```
✅ Password changed successfully!

2 other sessions logged out for security.
A notification email has been sent.
```

## Security Considerations

### Why Revoke Other Sessions?

**Scenario 1: Compromised Account**
```
1. Attacker gains access to your account
2. You notice suspicious activity
3. You change your password
4. ✅ Attacker is automatically logged out
5. ✅ Only you remain logged in
```

**Scenario 2: Shared Device**
```
1. You logged in on a friend's computer
2. You forgot to log out
3. You change your password at home
4. ✅ Friend's computer is logged out
5. ✅ Your data is protected
```

### Why Keep Current Session?

**User Experience**:
- ❌ Bad: User changes password → Gets logged out → Must log in again
- ✅ Good: User changes password → Stays logged in → Seamless experience

**Implementation**:
```typescript
// Get current session token from cookies
const sessionToken = cookieStore.get('authjs.session-token')?.value;

// Revoke all EXCEPT current
await revokeAllUserSessionsExceptCurrent(userId, sessionToken);
```

### Password Requirements

**Current Requirements**:
- Minimum 6 characters
- Must be different from current password

**Future Enhancements** (Recommended):
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character
- Check against common passwords
- Password strength meter

## Testing

### Test 1: Successful Password Change

```
1. Login to account
2. Go to Profile → Security
3. Enter current password: "oldpass123"
4. Enter new password: "newpass456"
5. Confirm new password: "newpass456"
6. Click "Change Password"
7. ✅ Should see success message
8. ✅ Should show revoked session count
9. ✅ Should receive email notification
10. ✅ Should still be logged in
```

### Test 2: Wrong Current Password

```
1. Enter wrong current password
2. Click "Change Password"
3. ✅ Should see error: "Current password is incorrect"
4. ✅ Password should NOT be changed
5. ✅ No sessions revoked
6. ✅ No email sent
```

### Test 3: Passwords Don't Match

```
1. Enter new password: "newpass456"
2. Enter confirm password: "different789"
3. ✅ Should see error: "Passwords don't match"
4. ✅ Submit button should be disabled
```

### Test 4: Same Password

```
1. Enter current password: "oldpass123"
2. Enter new password: "oldpass123"
3. Click "Change Password"
4. ✅ Should see error: "New password must be different"
```

### Test 5: Multiple Sessions

```
1. Login on Device A (Desktop)
2. Login on Device B (Mobile)
3. Login on Device C (Tablet)
4. On Device A, change password
5. ✅ Device A: Still logged in
6. ✅ Device B: Logged out (session revoked)
7. ✅ Device C: Logged out (session revoked)
8. ✅ Email shows: "2 other sessions logged out"
```

### Test 6: OAuth Account

```
1. Login with Google OAuth
2. Try to change password
3. ✅ Should see error: "Cannot change password for OAuth accounts"
```

## Database Changes

### Sessions Table

**Before Password Change**:
```sql
SELECT * FROM user_sessions WHERE user_id = 'user-123';

| id  | user_id  | session_token | is_active |
|-----|----------|---------------|-----------|
| 1   | user-123 | token-aaa     | true      |
| 2   | user-123 | token-bbb     | true      |
| 3   | user-123 | token-ccc     | true      |
```

**After Password Change** (current session: token-aaa):
```sql
SELECT * FROM user_sessions WHERE user_id = 'user-123';

| id  | user_id  | session_token | is_active |
|-----|----------|---------------|-----------|
| 1   | user-123 | token-aaa     | true      | ← Current (kept)
| 2   | user-123 | token-bbb     | false     | ← Revoked
| 3   | user-123 | token-ccc     | false     | ← Revoked
```

### Users Table

**Password Update**:
```sql
UPDATE users 
SET 
  password = '$2a$10$newhashedpassword...',
  updated = NOW()
WHERE id = 'user-123';
```

## Performance

### Impact Analysis

**Password Change Operation**:
1. Validate current password: ~50-100ms (bcrypt compare)
2. Hash new password: ~50-100ms (bcrypt hash)
3. Update database: ~10-20ms
4. Find other sessions: ~10-20ms
5. Revoke sessions (DB): ~10-20ms
6. Clear cache: ~5-10ms
7. Send email (async): 0ms (doesn't block)

**Total**: ~150-300ms (acceptable for security operation)

### Optimization

**Already Optimized**:
- ✅ Email sending is asynchronous (doesn't block response)
- ✅ Cache clearing uses Promise.all (parallel)
- ✅ Single database update for all sessions

**Future Optimizations**:
- Background job for session cleanup
- Batch email notifications
- Redis pub/sub for real-time session invalidation

## Troubleshooting

### Issue: Email Not Received

**Check 1: Resend API Key**
```bash
echo $RESEND_API_KEY
# Should show: re_...
```

**Check 2: Console Logs**
```
# Should see:
"✅ Password changed successfully"
"🔒 2 sessions revoked for user: user-123"
"✅ Password change notification sent to: user@example.com"
```

**Check 3: Email Address**
```sql
SELECT email FROM users WHERE id = 'user-123';
# Make sure email is valid
```

### Issue: Still Logged In on Other Devices

**Check 1: Session Revocation**
```sql
SELECT * FROM user_sessions 
WHERE user_id = 'user-123' AND is_active = true;
# Should only show current session
```

**Check 2: Cache Cleared**
```bash
# Redis
redis-cli
> KEYS session:*
# Should not show revoked sessions
```

**Check 3: Browser Cache**
- Other devices may have cached session
- They'll be logged out on next request
- Force refresh or clear browser cache

### Issue: Can't Change Password

**Check 1: OAuth Account**
```sql
SELECT password FROM users WHERE id = 'user-123';
# If NULL, user signed up with OAuth
```

**Check 2: Current Password**
- Make sure you're entering correct current password
- Check for typos, caps lock

## Future Enhancements

### Planned Features

1. **2FA Integration**
   - Require 2FA code when changing password
   - Extra security layer

2. **Password History**
   - Prevent reusing last 5 passwords
   - Store hashed password history

3. **Suspicious Activity Detection**
   - Alert if password changed from new location
   - Require email verification for password change

4. **Session Management UI**
   - View all active sessions
   - Manually revoke specific sessions
   - See device details

5. **Password Strength Meter**
   - Real-time strength indicator
   - Suggestions for stronger passwords

6. **Forced Password Change**
   - Admin can force user to change password
   - Automatic after security breach

## Summary

✅ **Automatic Session Revocation**: All other devices logged out
✅ **Email Notifications**: User immediately informed
✅ **Current Session Kept**: Seamless user experience
✅ **Secure Implementation**: bcrypt hashing, validation
✅ **Database + Cache**: Both updated for consistency
✅ **Async Email**: Doesn't block password change
✅ **Comprehensive Testing**: Multiple scenarios covered

---

**Status**: ✅ Complete and production-ready

**Setup**: Add `RESEND_API_KEY` to `.env` for email notifications!
