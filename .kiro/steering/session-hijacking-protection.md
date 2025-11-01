# Session Hijacking Protection

## Overview

Comprehensive session security system that validates both session tokens and device IDs to detect and prevent session hijacking attacks. When suspicious activity is detected, users are immediately logged out with a clear security warning.

## Security Features

### 1. Dual Validation System

**Session Token Validation**:
- Validates that the session token in the cookie matches the database
- Checks if session has expired
- Detects if session has been revoked

**Device ID Validation**:
- Validates that the device ID matches the one stored in the session
- Detects if session is being used from a different device
- Prevents session token theft and reuse

### 2. Real-Time Monitoring

**Validation Frequency**:
- Initial validation: 2 seconds after login (allows session creation)
- Periodic validation: Every 3 minutes
- Continuous monitoring during active sessions

**Benefits**:
- Quick detection of session hijacking
- Minimal performance impact
- Balance between security and user experience

### 3. Security Alert Dialog

**Warning Levels**:
- **Critical** (Red): Session hijacking detected, device mismatch
- **Warning** (Yellow): Session expired or revoked

**User Experience**:
- Clear, non-technical language
- Actionable security tips for hijacking scenarios
- Single "Log In Again" button
- Cannot be dismissed (forces logout)

## Implementation

### API Endpoint: `/api/sessions/validate-device`

**Request**:
```typescript
POST /api/sessions/validate-device
Body: { deviceId: string }
```

**Response (Success)**:
```json
{
  "valid": true
}
```

**Response (Device Mismatch)**:
```json
{
  "valid": false,
  "reason": "session_hijacking",
  "message": "Your session is being used on another device...",
  "shouldLogout": true,
  "severity": "critical"
}
```

**Response (Token Mismatch)**:
```json
{
  "valid": false,
  "reason": "session_token_mismatch",
  "message": "Your session token is invalid...",
  "shouldLogout": true,
  "severity": "critical"
}
```

**Response (Expired)**:
```json
{
  "valid": false,
  "reason": "session_expired",
  "message": "Your session has expired...",
  "shouldLogout": true,
  "severity": "warning"
}
```

### Validation Checks

**1. Device ID Match**:
```typescript
if (dbSession.deviceId && dbSession.deviceId !== deviceId) {
  // Session hijacking detected
  return { valid: false, reason: 'session_hijacking' };
}
```

**2. Session Token Match**:
```typescript
if (dbSession.sessionToken !== currentSessionToken) {
  // Token mismatch detected
  return { valid: false, reason: 'session_token_mismatch' };
}
```

**3. Session Expiration**:
```typescript
if (dbSession.expires && new Date(dbSession.expires) < new Date()) {
  // Session expired
  return { valid: false, reason: 'session_expired' };
}
```

### SessionValidator Component

**Location**: `components/SessionValidator.tsx`

**Features**:
- Runs on all authenticated pages
- Validates session + device ID every 3 minutes
- Shows security alert dialog on validation failure
- Forces logout with appropriate redirect

**Usage**:
```typescript
// Already included in root layout
<SessionValidator />
```

## Security Scenarios

### Scenario 1: Session Token Stolen

**Attack**:
1. Attacker steals session token from victim's browser
2. Attacker tries to use token from their device

**Detection**:
- Device ID mismatch detected
- Validation fails with `session_hijacking` reason

**Response**:
- Critical security alert shown
- User logged out immediately
- Security tip displayed about password change

### Scenario 2: Session Replayed

**Attack**:
1. Attacker captures session token
2. Attacker replays token after victim logs out

**Detection**:
- Session token no longer exists in database
- Or session has expired

**Response**:
- Warning alert shown
- User logged out
- Redirected to login page

### Scenario 3: Concurrent Logins

**Legitimate Use**:
1. User logs in from laptop
2. User logs in from phone (different device)

**Behavior**:
- Each device gets its own session
- Each session has unique device ID
- Both sessions remain valid
- No false positives

## Security Logging

### Console Warnings

**Device Mismatch**:
```
🚨 SECURITY ALERT - Device ID mismatch detected!
{
  userId: "uuid",
  userName: "John Doe",
  expectedDeviceId: "abc12345...",
  receivedDeviceId: "xyz98765...",
  timestamp: "2025-01-15T10:30:00Z"
}
```

**Token Mismatch**:
```
🚨 SECURITY ALERT - Session token mismatch!
{
  userId: "uuid",
  userName: "John Doe",
  timestamp: "2025-01-15T10:30:00Z"
}
```

### Monitoring Recommendations

1. **Log Aggregation**: Send security alerts to logging service
2. **Alerting**: Set up alerts for multiple failed validations
3. **Rate Limiting**: Implement rate limiting on validation endpoint
4. **IP Tracking**: Log IP addresses for forensic analysis

## User Experience

### Normal Flow

1. User logs in
2. Session created with device ID
3. Validation runs every 3 minutes
4. User continues working normally
5. No interruptions

### Security Alert Flow

1. Validation detects issue
2. Alert dialog appears immediately
3. User reads security message
4. User clicks "Log In Again"
5. User redirected to login page
6. User logs in with fresh session

### Alert Messages

**Session Hijacking**:
> Your session is being used on another device. For security reasons, you have been logged out.
>
> **Security Tip**: If you didn't log in from another device, your account may be compromised. Please change your password immediately after logging in.

**Session Expired**:
> Your session has expired. Please log in again.

**Token Invalid**:
> Your session token is invalid. Please log in again.

## Configuration

### Validation Interval

**Current**: 3 minutes (180,000ms)

**Adjust**:
```typescript
// In SessionValidator.tsx
const interval = setInterval(validateSession, 3 * 60 * 1000);

// More frequent (higher security, more API calls)
const interval = setInterval(validateSession, 1 * 60 * 1000); // 1 minute

// Less frequent (lower security, fewer API calls)
const interval = setInterval(validateSession, 5 * 60 * 1000); // 5 minutes
```

### Initial Delay

**Current**: 2 seconds

**Purpose**: Allow SessionInitializer to create session in database

**Adjust**:
```typescript
const initialTimeout = setTimeout(() => {
  validateSession();
  setInitialized(true);
}, 2000); // 2 seconds
```

## Testing

### Test Session Hijacking

1. Log in from Browser A
2. Copy session token from cookies
3. Open Browser B (different device ID)
4. Manually set session token in Browser B
5. Wait for validation (max 3 minutes)
6. Security alert should appear in Browser B

### Test Session Expiration

1. Log in normally
2. Manually expire session in database
3. Wait for validation (max 3 minutes)
4. Warning alert should appear

### Test Concurrent Logins

1. Log in from Browser A
2. Log in from Browser B (different account or same account)
3. Both sessions should remain valid
4. No false alerts

## Performance Impact

### API Calls

**Per User**:
- 1 validation every 3 minutes
- ~20 validations per hour
- ~480 validations per day (24h active)

**Database Queries**:
- 1 SELECT query per validation
- Indexed on sessionToken and deviceId
- Fast lookup (<10ms)

**Network**:
- ~200 bytes per request
- ~200 bytes per response
- Minimal bandwidth usage

### Optimization

**Caching**:
- Consider caching validation results for 30 seconds
- Reduces database load for rapid page changes

**Batching**:
- Could batch validations if multiple tabs open
- Use BroadcastChannel API for cross-tab communication

## Security Best Practices

### For Users

1. **Log out** when using shared computers
2. **Change password** if hijacking alert appears
3. **Review sessions** regularly in settings
4. **Enable 2FA** for additional security (future feature)

### For Developers

1. **Never log** full session tokens or device IDs
2. **Use HTTPS** always (session tokens in cookies)
3. **Rotate tokens** on password change
4. **Implement rate limiting** on validation endpoint
5. **Monitor** for suspicious patterns

## Future Enhancements

### Phase 2
- [ ] Email notification on session hijacking
- [ ] SMS/2FA verification for suspicious logins
- [ ] IP address validation
- [ ] Geolocation-based alerts
- [ ] Session history with device details

### Phase 3
- [ ] Machine learning for anomaly detection
- [ ] Risk scoring for sessions
- [ ] Automatic session revocation for high-risk activities
- [ ] Integration with security information and event management (SIEM)

### Phase 4
- [ ] Biometric authentication
- [ ] Hardware token support (WebAuthn)
- [ ] Zero-trust architecture
- [ ] Continuous authentication

## Related Files

- `app/api/sessions/validate-device/route.ts` - Device validation endpoint
- `components/SessionValidator.tsx` - Client-side validation component
- `lib/browser-fingerprint.ts` - Device ID generation
- `lib/session-store.ts` - Session storage and retrieval

## Status

✅ **IMPLEMENTED** - Session hijacking protection active

## Notes

- Validation runs every 3 minutes (configurable)
- Alert dialog cannot be dismissed (forces logout)
- Security tips shown for hijacking scenarios
- All security events logged to console
- Compatible with concurrent logins from different devices
- No false positives for legitimate multi-device usage

