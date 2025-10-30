# Email Verification Flow for Email Changes

## Overview

When a user changes their email address, they must verify the new email with a 6-digit code before the change is completed.

## Flow Diagram

```
User changes email → Confirmation dialog → Send code → Enter code → Email updated
```

## Step-by-Step Process

### 1. User Initiates Email Change

- User edits email in profile form
- Clicks "Update Profile"
- Confirmation dialog appears

### 2. Confirmation Dialog

- Shows old email → new email
- Warns about verification requirement
- User clicks "Send Verification Code"

### 3. Code Generation & Sending

- API generates 6-digit random code
- Code stored in `email_verification_codes` table
- Code expires in 15 minutes
- Code logged to server console (for development)
- Email sent to new address (placeholder - logs to console)

### 4. Code Verification Dialog

- User enters 6-digit code
- Code validated against database
- Must match user_id, code, not expired, not already used

### 5. Email Update

- If code valid:
  - User email updated
  - `email_verified_at` set to current timestamp
  - Profile data (name, phone, photo) also updated
  - Verification record marked as used
- If code invalid/expired:
  - Error message shown
  - User can request new code

## Database Schema

### `email_verification_codes` Table

| Field      | Type      | Description                    |
| ---------- | --------- | ------------------------------ |
| id         | UUID      | Primary key                    |
| user_id    | UUID      | Foreign key to users.id        |
| email      | String    | New email address              |
| code       | String(6) | 6-digit verification code      |
| expires_at | Timestamp | Expiration time (15 min)       |
| verified   | Boolean   | Whether code has been used     |
| created    | Timestamp | When code was generated        |

**Indexes:**
- `user_id` - Fast user lookup
- `email` - Email-based queries
- `code` - Code verification
- `expires_at` - Cleanup expired codes

## API Endpoints

### POST `/api/profile/request-email-change`

Request a verification code for email change.

**Request:**
```json
{
  "newEmail": "newemail@example.com"
}
```

**Response:**
```json
{
  "message": "Verification code sent to your new email address",
  "email": "newemail@example.com"
}
```

**Errors:**
- 401: Unauthorized
- 409: Email already in use
- 500: Server error

### POST `/api/profile/verify-email-change`

Verify code and complete email change.

**Request:**
```json
{
  "code": "123456",
  "name": "John Doe",
  "phone": "+855 12 345 678",
  "photo": "https://..."
}
```

**Response:**
```json
{
  "message": "Email changed successfully",
  "user": {
    "name": "John Doe",
    "email": "newemail@example.com",
    "phone": "+855 12 345 678"
  }
}
```

**Errors:**
- 400: Invalid or expired code
- 401: Unauthorized
- 500: Server error

## Security Features

1. **Time-Limited Codes**: Expire after 15 minutes
2. **One-Time Use**: Codes marked as verified after use
3. **User-Specific**: Codes tied to specific user_id
4. **Email Uniqueness**: Prevents duplicate emails
5. **Server-Side Validation**: All validation on backend

## Development Notes

### Viewing Verification Codes

During development, codes are logged to the server console:

```
🔐 Email Verification Code Generated:
   User ID: abc-123-def
   New Email: newemail@example.com
   Code: 123456
   Expires: 2025-10-30T12:45:00.000Z
```

### Testing

1. Change email in profile
2. Check server logs for verification code
3. Enter code in verification dialog
4. Email should be updated

### Email Integration (TODO)

To enable actual email sending:

1. Configure Resend API key in `.env.local`:
   ```
   RESEND_API_KEY=re_...
   ```

2. Update `lib/email-verification.ts`:
   ```typescript
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   export async function sendVerificationEmail(email: string, code: string) {
     await resend.emails.send({
       from: 'CUBIS Academy <noreply@cubisacademy.com>',
       to: email,
       subject: 'Verify Your New Email Address',
       html: `
         <h1>Email Verification</h1>
         <p>Your verification code is: <strong>${code}</strong></p>
         <p>This code expires in 15 minutes.</p>
       `,
     });
   }
   ```

## Cleanup

Expired codes should be cleaned up periodically:

```sql
DELETE FROM email_verification_codes 
WHERE expires_at < NOW() 
AND verified = false;
```

Consider running this as a cron job or scheduled task.

## User Experience

- Clear messaging at each step
- Visual feedback (loading states)
- Error handling with helpful messages
- Mobile-friendly dialogs
- Internationalized (Khmer/English)
