# Session Management System

## Overview

CUBIS Academy implements a comprehensive session management system with:
- **Redis caching** for fast session access (optional)
- **Database persistence** for reliability
- **Session validation** to prevent deleted/inactive users from accessing the system
- **Multi-device tracking** with device, browser, and OS information
- **Session revocation** - users can view and revoke sessions

## Architecture

### Dual Storage Strategy

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     Cache Hit     ┌─────────────┐
│   Redis     │◄─────────────────►│  Fast Read  │
│  (Optional) │                    └─────────────┘
└──────┬──────┘
       │ Cache Miss
       ▼
┌─────────────┐
│  PostgreSQL │
│  (Primary)  │
└─────────────┘
```

**Benefits:**
- **Fast**: Redis provides sub-millisecond session lookups
- **Reliable**: PostgreSQL ensures sessions persist across Redis restarts
- **Flexible**: Works with or without Redis

## Features

### 1. Session Creation

When a user logs in:
- Session created in database with metadata
- Cached in Redis (if available) with TTL
- Device, browser, and OS information extracted from user agent
- IP address and location captured

### 2. Session Validation

On every request:
- Check if session exists and is active
- Verify session hasn't expired
- **Validate user still exists and is active**
- Update last activity timestamp

**Key Security Feature**: If a user is deleted or deactivated, their sessions are automatically invalidated.

### 3. Session Viewing

Users can view all their active sessions:
- Device type (desktop, mobile, tablet)
- Browser and version
- Operating system
- IP address
- Location (if available)
- Last activity time
- Creation time

### 4. Session Revocation

Users can:
- **Revoke individual sessions** - Log out from specific devices
- **Revoke all sessions** - Log out from all devices (security feature)

## Database Schema

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device VARCHAR(100),          -- desktop, mobile, tablet
  browser VARCHAR(100),         -- Chrome 120, Firefox 121
  os VARCHAR(100),              -- Windows 11, macOS 14
  location VARCHAR(255),        -- City, Country
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX user_sessions_session_token_idx ON user_sessions(session_token);
CREATE INDEX user_sessions_is_active_idx ON user_sessions(is_active);
CREATE INDEX user_sessions_expires_at_idx ON user_sessions(expires_at);
```

## Cache Setup (Keyv)

The system uses **Keyv** for flexible caching with multiple storage options.

### Storage Priority

1. **Redis** (if `REDIS_URL` is set) - Best performance
2. **PostgreSQL** (if only `DATABASE_URL` is set) - Good performance, no extra setup
3. **In-Memory** (fallback) - Fast but not persistent across restarts

### Redis Setup (Recommended for Production)

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Configuration:**
```env
REDIS_URL=redis://localhost:6379
```

### PostgreSQL Cache (Alternative)

If you don't want to run Redis, Keyv can use PostgreSQL as a cache:

```env
# Just use your existing DATABASE_URL
# Keyv will automatically create a cache table
DATABASE_URL=postgresql://user:password@localhost:5432/cubis_academy
```

**Benefits:**
- No additional service to run
- Persistent cache
- Good performance
- Automatic cleanup

### In-Memory Cache (Development Only)

If neither `REDIS_URL` nor `DATABASE_URL` is set, Keyv uses in-memory storage:

**Pros:**
- No setup required
- Very fast

**Cons:**
- Lost on server restart
- Not shared across instances
- Not suitable for production

## API Endpoints

### GET /api/sessions

Get all active sessions for the current user.

**Response:**
```json
{
  "sessions": [
    {
      "id": "019a32cb-...",
      "device": "desktop",
      "browser": "Chrome 120",
      "os": "macOS 14",
      "ipAddress": "192.168.1.1",
      "location": "San Francisco, US",
      "lastActivity": "2025-10-30T12:34:56Z",
      "created": "2025-10-29T08:00:00Z",
      "isActive": true
    }
  ]
}
```

### POST /api/sessions/[sessionId]/revoke

Revoke a specific session.

**Response:**
```json
{
  "message": "Session revoked successfully"
}
```

### POST /api/sessions/revoke-all

Revoke all sessions for the current user (logs out from all devices).

**Response:**
```json
{
  "message": "All sessions revoked successfully"
}
```

## Usage

### In Profile Page

```typescript
import { SessionsManager } from '@/components/SessionsManager';

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      
      {/* Other profile sections */}
      
      <SessionsManager />
    </div>
  );
}
```

### Programmatic Session Management

```typescript
import {
  createSession,
  getSession,
  validateSession,
  revokeSession,
  revokeAllUserSessions,
  getUserSessions,
} from '@/lib/session-store';

// Create a session
await createSession({
  userId: 'user-id',
  sessionToken: 'token',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  location: 'San Francisco, US',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
});

// Validate a session
const { valid, userId, reason } = await validateSession('token');
if (!valid) {
  console.log('Invalid session:', reason);
}

// Get user's sessions
const sessions = await getUserSessions('user-id');

// Revoke a session
await revokeSession('token');

// Revoke all user sessions
await revokeAllUserSessions('user-id');
```

## Security Features

### 1. Automatic Invalidation

Sessions are automatically invalidated when:
- User is deleted from database
- User is deactivated (`is_active = false`)
- Session expires
- User explicitly revokes the session

### 2. Session Validation

Every request validates:
- Session exists in database/Redis
- Session is marked as active
- Session hasn't expired
- User still exists
- User is still active

### 3. Activity Tracking

- Last activity timestamp updated on each request
- Helps identify inactive sessions
- Can be used for automatic cleanup

### 4. Device Fingerprinting

Sessions track:
- Device type (desktop, mobile, tablet)
- Browser and version
- Operating system
- IP address
- Location (if available)

This helps users identify suspicious sessions.

## Maintenance

### Cleanup Expired Sessions

Run periodically (e.g., daily cron job):

```typescript
import { cleanupExpiredSessions } from '@/lib/session-store';

// Clean up expired sessions
const count = await cleanupExpiredSessions();
console.log(`Cleaned up ${count} expired sessions`);
```

### Monitor Session Count

```sql
-- Active sessions per user
SELECT user_id, COUNT(*) as session_count
FROM user_sessions
WHERE is_active = true AND expires_at > NOW()
GROUP BY user_id
ORDER BY session_count DESC;

-- Total active sessions
SELECT COUNT(*) FROM user_sessions
WHERE is_active = true AND expires_at > NOW();
```

## Performance

### With Redis (Keyv + Redis)

- **Session Lookup**: < 1ms (Redis cache hit)
- **Session Creation**: ~5ms (write to both Redis and DB)
- **Session Validation**: < 1ms (Redis cache hit)

### With PostgreSQL Cache (Keyv + PostgreSQL)

- **Session Lookup**: ~5-10ms (PostgreSQL cache hit)
- **Session Creation**: ~10ms (write to both cache and sessions table)
- **Session Validation**: ~5-10ms (PostgreSQL cache hit)

### In-Memory (Keyv + Memory)

- **Session Lookup**: < 0.1ms (memory access)
- **Session Creation**: ~10ms (write to database)
- **Session Validation**: < 0.1ms (memory access)
- **Note**: Cache lost on restart

### Optimization Tips

1. **Use Redis** for high-traffic applications
2. **Index properly** - all foreign keys and frequently queried columns are indexed
3. **Clean up regularly** - remove expired sessions to keep table small
4. **Monitor Redis memory** - set appropriate TTL and maxmemory policy

## Troubleshooting

### Cache Connection Issues

**Keyv automatically handles failures:**
- If Redis is unavailable, falls back to PostgreSQL cache
- If PostgreSQL cache fails, falls back to in-memory
- No errors thrown, just logs warnings
- Check logs for "Cache error:" messages

**To check which cache is being used:**
```
📦 Using Redis for session cache          ← Best
📦 Using PostgreSQL for session cache     ← Good
📦 Using in-memory for session cache      ← Development only
```

### Session Not Found

Possible causes:
1. Session expired
2. User deleted/deactivated
3. Session explicitly revoked
4. Redis cache cleared (will reload from DB)

### High Memory Usage

**Redis:**
1. Reduce session TTL
2. Set Redis maxmemory policy: `maxmemory-policy allkeys-lru`
3. Clean up expired sessions more frequently

**PostgreSQL Cache:**
1. Keyv automatically cleans up expired entries
2. Monitor the `keyv` table size
3. Run `VACUUM` periodically

**In-Memory:**
1. Memory is automatically freed on expiration
2. Restart server to clear all cache

## Best Practices

### 1. Session Duration

- **Default**: 30 days
- **Sensitive operations**: Require re-authentication
- **Remember me**: Extend to 90 days

### 2. Security

- Always validate sessions on protected routes
- Revoke sessions on password change
- Revoke sessions on email change
- Implement rate limiting on session creation

### 3. User Experience

- Show clear session information (device, location, time)
- Allow users to revoke suspicious sessions
- Notify users of new logins (optional)

### 4. Monitoring

- Track active session count
- Monitor session creation rate
- Alert on unusual patterns (many sessions from one user)

## Migration from JWT-Only

If migrating from JWT-only authentication:

1. **Add session table** - Run migration
2. **Update auth callbacks** - Add session creation
3. **Add validation** - Check user exists and is active
4. **Deploy gradually** - Both systems can coexist
5. **Monitor** - Watch for issues
6. **Clean up** - Remove old JWT-only code

## References

- [Auth.js Documentation](https://authjs.dev/)
- [Redis Documentation](https://redis.io/docs/)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [UA Parser Documentation](https://github.com/faisalman/ua-parser-js)

---

**Status**: ✅ Implemented and tested

**Redis**: Optional (falls back to database-only)

**Security**: Validates user exists and is active on every request
