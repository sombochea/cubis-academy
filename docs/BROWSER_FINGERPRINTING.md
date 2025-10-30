# Browser Fingerprinting & Device ID System

## Overview

The system now includes persistent browser fingerprinting to uniquely identify devices across sessions. This helps with:
- ✅ **Session Management**: Track sessions per device
- ✅ **Security**: Detect suspicious login patterns
- ✅ **User Experience**: Remember devices for "trusted device" features
- ✅ **Analytics**: Understand user behavior across devices

## How It Works

### 1. Device ID Generation

When a user first visits the site, a unique device ID is generated and stored in `localStorage`:

```typescript
// Generates UUID v4
deviceId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Key Features**:
- ✅ **Persistent**: Survives browser restarts
- ✅ **Unique**: UUID v4 format
- ✅ **Client-Side**: Generated in browser
- ✅ **Stored**: localStorage (not cookies)

### 2. Browser Fingerprint

In addition to device ID, we generate a fingerprint based on browser characteristics:

```typescript
fingerprint = hash(
  userAgent +
  language +
  platform +
  screen resolution +
  color depth +
  timezone +
  storage support
)
```

**Purpose**: Detect if the same browser is being used even if device ID is cleared

### 3. Session Tracking

Each session now includes:
- `session_token`: Auth.js session token (unique per login)
- `device_id`: Persistent browser identifier
- `device`: Device type (desktop/mobile/tablet)
- `browser`: Browser name and version
- `os`: Operating system
- `ip_address`: IP address
- `location`: Geographic location (if available)

## Database Schema

### user_sessions Table

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_id VARCHAR(255), -- NEW: Persistent browser ID
  ip_address VARCHAR(45),
  user_agent TEXT,
  device VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created TIMESTAMP DEFAULT NOW()
);

CREATE INDEX user_sessions_device_id_idx ON user_sessions(device_id);
```

## Implementation

### Client-Side (Browser)

**File**: `lib/browser-fingerprint.ts`

**Functions**:

```typescript
// Get or create persistent device ID
getDeviceId(): string

// Get device information
getDeviceInfo(): DeviceInfo | null

// Get browser fingerprint
getBrowserFingerprint(): string

// Clear device ID (logout/testing)
clearDeviceId(): void

// Check if device ID exists
hasDeviceId(): boolean

// Get device name for display
getDeviceName(): string

// Get comprehensive device info
getDeviceInfoForSession(): object
```

**Usage**:

```typescript
import { getDeviceId, getDeviceName } from '@/lib/browser-fingerprint';

// Get device ID
const deviceId = getDeviceId();
console.log('Device ID:', deviceId);

// Get device name
const deviceName = getDeviceName();
console.log('Device:', deviceName); // "Mac", "Windows PC", "iPhone", etc.
```

### Server-Side (API)

**File**: `app/api/sessions/ensure/route.ts`

**Flow**:
1. Client sends POST request with `deviceId` in body
2. Server checks if session exists
3. If not, creates session with `deviceId`
4. Session stored in database and cache

**Request**:
```json
POST /api/sessions/ensure
{
  "deviceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response**:
```json
{
  "created": true
}
```

### Session Store

**File**: `lib/session-store.ts`

**Updated Functions**:

```typescript
interface CreateSessionOptions {
  userId: string;
  sessionToken: string;
  deviceId?: string; // NEW
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  expiresAt: Date;
}

createSession(options: CreateSessionOptions): Promise<SessionData>
```

### Component Integration

**File**: `components/SessionInitializer.tsx`

**Flow**:
1. Component mounts when user is authenticated
2. Gets device ID from browser
3. Sends to API to create/update session
4. Session includes device ID

```typescript
const deviceId = getDeviceId();

fetch('/api/sessions/ensure', {
  method: 'POST',
  body: JSON.stringify({ deviceId }),
});
```

## Use Cases

### 1. Trusted Devices

Track which devices a user has logged in from:

```sql
SELECT 
  device_id,
  device,
  browser,
  os,
  COUNT(*) as login_count,
  MAX(last_activity) as last_seen
FROM user_sessions
WHERE user_id = 'user-123'
GROUP BY device_id, device, browser, os
ORDER BY last_seen DESC;
```

**Result**:
```
| device_id | device  | browser | os      | login_count | last_seen           |
|-----------|---------|---------|---------|-------------|---------------------|
| abc-123   | Mac     | Chrome  | macOS   | 45          | 2025-10-30 10:00:00 |
| def-456   | iPhone  | Safari  | iOS     | 12          | 2025-10-29 15:30:00 |
| ghi-789   | Windows | Firefox | Windows | 3           | 2025-10-25 09:15:00 |
```

### 2. New Device Detection

Detect when user logs in from a new device:

```typescript
// Check if device ID has been seen before
const existingSessions = await db.query.userSessions.findMany({
  where: and(
    eq(userSessions.userId, userId),
    eq(userSessions.deviceId, deviceId)
  ),
});

if (existingSessions.length === 0) {
  // New device! Send notification email
  await sendLoginNotification({
    userId,
    device: 'New Device',
    // ...
  });
}
```

### 3. Session Management UI

Show user all their active sessions grouped by device:

```typescript
const sessions = await db.query.userSessions.findMany({
  where: and(
    eq(userSessions.userId, userId),
    eq(userSessions.isActive, true)
  ),
});

// Group by device_id
const deviceSessions = sessions.reduce((acc, session) => {
  const key = session.deviceId || 'unknown';
  if (!acc[key]) acc[key] = [];
  acc[key].push(session);
  return acc;
}, {});
```

**Display**:
```
Your Active Sessions:

📱 iPhone (Safari on iOS)
   - Session 1: Last active 2 hours ago
   - Session 2: Last active 1 day ago
   [Revoke All]

💻 Mac (Chrome on macOS) ← Current Device
   - Session 1: Active now
   [Keep]

🖥️ Windows PC (Firefox on Windows)
   - Session 1: Last active 3 days ago
   [Revoke]
```

### 4. Security Alerts

Detect suspicious activity:

```typescript
// Check if user is logging in from unusual device
const recentDevices = await db.query.userSessions.findMany({
  where: and(
    eq(userSessions.userId, userId),
    gt(userSessions.lastActivity, thirtyDaysAgo)
  ),
  columns: {
    deviceId: true,
    device: true,
    location: true,
  },
});

const knownDeviceIds = recentDevices.map(s => s.deviceId);

if (!knownDeviceIds.includes(currentDeviceId)) {
  // New device from different location
  if (currentLocation !== recentDevices[0].location) {
    // ALERT: Suspicious login!
    await sendSecurityAlert({
      userId,
      reason: 'New device from different location',
    });
  }
}
```

## Storage Details

### localStorage Keys

```typescript
// Device ID
'cubis_device_id': "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

// Device Info
'cubis_device_info': {
  "deviceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "fingerprint": "abc123def456",
  "userAgent": "Mozilla/5.0...",
  "screen": "1920x1080",
  "timezone": "America/Los_Angeles",
  "language": "en-US",
  "platform": "MacIntel",
  "createdAt": "2025-10-30T10:00:00.000Z",
  "lastSeen": "2025-10-30T10:00:00.000Z"
}
```

### Persistence

**Survives**:
- ✅ Browser restart
- ✅ Tab close/reopen
- ✅ Computer restart
- ✅ Network changes

**Cleared By**:
- ❌ Clear browsing data (localStorage)
- ❌ Incognito/Private mode (separate storage)
- ❌ Different browser (separate storage)
- ❌ Different browser profile (separate storage)

## Privacy Considerations

### What We Collect

**Stored in Database**:
- ✅ Device ID (UUID, not personally identifiable)
- ✅ Device type (desktop/mobile/tablet)
- ✅ Browser name and version
- ✅ Operating system
- ✅ IP address
- ✅ Approximate location (city/country)

**NOT Collected**:
- ❌ Exact GPS coordinates
- ❌ Personal files or data
- ❌ Browsing history
- ❌ Passwords or sensitive data
- ❌ Cross-site tracking

### User Control

Users can:
- ✅ View all active sessions
- ✅ Revoke specific sessions
- ✅ Clear device ID (logout)
- ✅ See device information

### GDPR Compliance

- ✅ **Transparency**: Users can see what data is collected
- ✅ **Control**: Users can delete their sessions
- ✅ **Purpose**: Data used only for security and UX
- ✅ **Retention**: Sessions expire after 30 days

## Testing

### Test 1: Device ID Creation

```typescript
import { getDeviceId, hasDeviceId } from '@/lib/browser-fingerprint';

// First visit
console.log(hasDeviceId()); // false
const deviceId = getDeviceId();
console.log(hasDeviceId()); // true
console.log(deviceId); // "a1b2c3d4-..."
```

### Test 2: Device ID Persistence

```typescript
// Get device ID
const deviceId1 = getDeviceId();

// Refresh page
location.reload();

// Get device ID again
const deviceId2 = getDeviceId();

console.log(deviceId1 === deviceId2); // true ✅
```

### Test 3: Multiple Browsers

```
1. Open Chrome → Login
   - Device ID: abc-123
   
2. Open Firefox → Login
   - Device ID: def-456 (different!)
   
3. Check database:
   - 2 sessions with different device_ids ✅
```

### Test 4: Clear Device ID

```typescript
import { clearDeviceId, hasDeviceId } from '@/lib/browser-fingerprint';

console.log(hasDeviceId()); // true
clearDeviceId();
console.log(hasDeviceId()); // false
```

## Troubleshooting

### Issue: Device ID Not Persisting

**Cause**: localStorage disabled or blocked

**Solution**:
```typescript
// Check if localStorage is available
if (typeof window !== 'undefined' && window.localStorage) {
  // localStorage available
} else {
  // Fallback to session-based ID
}
```

### Issue: Different Device ID Each Time

**Cause**: Incognito mode or localStorage being cleared

**Check**:
```typescript
// Test localStorage persistence
localStorage.setItem('test', '123');
const value = localStorage.getItem('test');
console.log(value); // Should be '123'
```

### Issue: Duplicate Session Errors

**Fixed**: The `createSession` function now checks if session exists before inserting

**Before** (❌):
```typescript
// Always insert → Duplicate key error
await db.insert(userSessions).values({...});
```

**After** (✅):
```typescript
// Check first, update if exists
const existing = await db.query.userSessions.findFirst({
  where: eq(userSessions.sessionToken, token),
});

if (existing) {
  // Update existing
  await db.update(userSessions).set({...});
} else {
  // Insert new
  await db.insert(userSessions).values({...});
}
```

## Migration

### Database Migration

**File**: `lib/drizzle/migrations/0002_grey_deathbird.sql`

```sql
ALTER TABLE "user_sessions" ADD COLUMN "device_id" varchar(255);
CREATE INDEX "user_sessions_device_id_idx" ON "user_sessions" USING btree ("device_id");
```

**Applied**: ✅ Migration run successfully

### Backward Compatibility

- ✅ Existing sessions work (device_id is nullable)
- ✅ New sessions include device_id
- ✅ No breaking changes

## Future Enhancements

### Planned Features

1. **Trusted Device Management**
   - Mark devices as "trusted"
   - Skip 2FA on trusted devices
   - Notify when new device is added

2. **Device Nicknames**
   - Let users name their devices
   - "My MacBook Pro", "Work iPhone", etc.

3. **Device-Based Permissions**
   - Restrict certain actions to specific devices
   - "Only allow payments from trusted devices"

4. **Advanced Fingerprinting**
   - Canvas fingerprinting
   - WebGL fingerprinting
   - Audio fingerprinting
   - More accurate device detection

5. **Device Analytics**
   - Most used devices
   - Login patterns by device
   - Device-specific user behavior

## Summary

✅ **Device ID System**: Persistent browser identification
✅ **Database Schema**: Added `device_id` column with index
✅ **Duplicate Fix**: Session creation now checks for existing sessions
✅ **Client Library**: Complete browser fingerprinting utilities
✅ **API Integration**: Session ensure endpoint includes device_id
✅ **Component Update**: SessionInitializer sends device_id
✅ **Privacy Conscious**: Transparent data collection
✅ **GDPR Compliant**: User control and data retention

---

**Status**: ✅ Complete and ready to use

**Migration**: ✅ Applied successfully

**Testing**: Ready for testing in browser
