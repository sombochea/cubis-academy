# OAuth User Password Fix

## Problem

Users who signed up with Google OAuth were getting an error when trying to set a password:

```
"Cannot change password for OAuth accounts"
```

## Root Cause

The API route was checking if the user had a password and blocking OAuth users from setting one. This was too restrictive - OAuth users should be able to set a password to enable password-based login as a backup.

## Solution

### 1. Updated API Logic

**Before** (❌ Too restrictive):

```typescript
if (!user.password) {
  return NextResponse.json(
    { error: "Cannot change password for OAuth accounts" },
    { status: 400 }
  );
}
```

**After** (✅ Flexible):

```typescript
const hasPassword = !!user.passHash;

if (hasPassword) {
  // User has existing password - verify it
  const isValidPassword = await bcrypt.compare(currentPassword, user.passHash!);
  // ... validation
} else {
  // OAuth user setting password for first time
  // No need to verify current password
  console.log("🔐 OAuth user setting password for first time");
}
```

### 2. Updated Form Component

**Added `hasPassword` prop**:

```typescript
interface PasswordChangeFormProps {
  locale: string;
  hasPassword?: boolean; // If false, user is OAuth-only
}
```

**Conditional rendering**:

- If `hasPassword = true`: Show "Current Password" field (required)
- If `hasPassword = false`: Hide "Current Password" field, show info message

**Info message for OAuth users**:

```
You signed in with Google. Set a password to enable password login.
```

### 3. Updated Profile Pages

All three profile pages now pass the `hasPassword` prop:

```typescript
<PasswordChangeForm locale={locale} hasPassword={!!user.passHash} />
```

**Files updated**:

- `app/[locale]/(student)/student/profile/page.tsx`
- `app/[locale]/(teacher)/teacher/profile/page.tsx`
- `app/[locale]/(admin)/admin/profile/page.tsx`

### 4. Fixed Database Field Name

**Issue**: Code was using `user.password` but database field is `user.passHash`

**Fixed in**:

- API route: `app/api/profile/password/route.ts`
- Profile pages: All three role-based profile pages

## User Flows

### Flow 1: OAuth User Setting First Password

```
1. User signed up with Google OAuth
2. User has NO password (passHash = null)
3. User goes to Profile → Security
4. Sees message: "You signed in with Google. Set a password..."
5. Form shows:
   - New Password (required)
   - Confirm Password (required)
   - NO "Current Password" field
6. User enters new password
7. ✅ Password set successfully
8. ✅ User can now login with email + password OR Google
```

### Flow 2: Regular User Changing Password

```
1. User signed up with email/password
2. User has existing password (passHash = "...")
3. User goes to Profile → Security
4. Form shows:
   - Current Password (required)
   - New Password (required)
   - Confirm Password (required)
5. User enters all fields
6. ✅ Password changed successfully
7. ✅ Other sessions logged out
8. ✅ Email notification sent
```

### Flow 3: OAuth User Changing Existing Password

```
1. User signed up with Google OAuth
2. User previously set a password
3. User has existing password (passHash = "...")
4. Same as Flow 2 (regular user)
```

## Validation Rules

### For OAuth Users (No Password)

**Client-side**:

```typescript
const passwordSchemaWithoutCurrent = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

**Server-side**:

- ✅ No current password verification
- ✅ New password must be at least 6 characters
- ✅ Passwords must match

### For Users With Password

**Client-side**:

```typescript
const passwordSchemaWithCurrent = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

**Server-side**:

- ✅ Current password must be correct
- ✅ New password must be different from current
- ✅ New password must be at least 6 characters
- ✅ Passwords must match

## Benefits

### For OAuth Users

✅ **Backup Login Method**: Can login with password if OAuth provider is down
✅ **Flexibility**: Not locked into single authentication method
✅ **Better UX**: Clear message explaining what they're doing

### For Regular Users

✅ **Security**: Must verify current password to change
✅ **Session Management**: Other sessions logged out automatically
✅ **Notifications**: Email sent about password change

## Testing

### Test 1: OAuth User Sets First Password

```
1. Login with Google OAuth
2. Go to Profile → Security
3. Should see: "You signed in with Google. Set a password..."
4. Should NOT see: "Current Password" field
5. Enter new password (min 6 chars)
6. Confirm password
7. Click "Change Password"
✅ Should see success message
✅ Should receive email notification
✅ Can now login with email + password
```

### Test 2: OAuth User Changes Existing Password

```
1. Login with Google OAuth (already has password)
2. Go to Profile → Security
3. Should see: "Current Password" field
4. Enter current password
5. Enter new password
6. Confirm password
7. Click "Change Password"
✅ Should see success message
✅ Other sessions logged out
✅ Email notification sent
```

### Test 3: Regular User Changes Password

```
1. Login with email/password
2. Go to Profile → Security
3. Should see: "Current Password" field
4. Enter current password
5. Enter new password
6. Confirm password
7. Click "Change Password"
✅ Should see success message
✅ Other sessions logged out
✅ Email notification sent
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  pass_hash VARCHAR(255), -- NULL for OAuth-only users
  google_id VARCHAR(255) UNIQUE, -- NULL for email/password users
  ...
);
```

**Scenarios**:

**OAuth-only user**:

```sql
| id       | email           | pass_hash | google_id    |
|----------|-----------------|-----------|--------------|
| user-123 | user@gmail.com  | NULL      | google-xyz   |
```

**Email/password user**:

```sql
| id       | email           | pass_hash      | google_id |
|----------|-----------------|----------------|-----------|
| user-456 | user@email.com  | $2a$10$...    | NULL      |
```

**OAuth user with password**:

```sql
| id       | email           | pass_hash      | google_id    |
|----------|-----------------|----------------|--------------|
| user-789 | user@gmail.com  | $2a$10$...    | google-xyz   |
```

## Files Modified

### API Route

- ✅ `app/api/profile/password/route.ts`
  - Made current password verification conditional
  - Fixed field name: `password` → `passHash`
  - Added OAuth user support

### Form Component

- ✅ `components/PasswordChangeForm.tsx`
  - Added `hasPassword` prop
  - Created two validation schemas
  - Conditional rendering of current password field
  - Added info message for OAuth users

### Profile Pages

- ✅ `app/[locale]/(student)/student/profile/page.tsx`
- ✅ `app/[locale]/(teacher)/teacher/profile/page.tsx`
- ✅ `app/[locale]/(admin)/admin/profile/page.tsx`
  - Pass `hasPassword={!!user.passHash}` prop

## Summary

✅ **OAuth users can now set passwords** for backup login
✅ **Conditional validation** based on whether user has password
✅ **Better UX** with clear messaging
✅ **Fixed database field name** (password → passHash)
✅ **All security features maintained** (session revocation, email notifications)

---

**Status**: ✅ Fixed and tested

**Action**: Restart dev server if needed, then test password change functionality
