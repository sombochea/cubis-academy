import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import KeyvPostgres from "@keyv/postgres";
import { db } from "./drizzle/db";
import { userSessions, users } from "./drizzle/schema";
import { eq, and, gt, ne, lt } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

// Keyv cache instance with multiple storage options
let cache: Keyv | null = null;

function getCache(): Keyv {
  if (!cache) {
    // Priority: Redis > PostgreSQL > In-Memory
    if (process.env.REDIS_URL) {
      console.log("📦 Using Redis for session cache");
      cache = new Keyv({
        store: new KeyvRedis(process.env.REDIS_URL),
        namespace: "session",
        ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    } else if (process.env.DATABASE_URL) {
      console.log("📦 Using PostgreSQL for session cache");
      cache = new Keyv({
        store: new KeyvPostgres(process.env.DATABASE_URL),
        namespace: "session",
        ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    } else {
      console.log("📦 Using in-memory for session cache");
      cache = new Keyv({
        namespace: "session",
        ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    // Handle errors
    cache.on("error", (err) => {
      console.error("Cache error:", err);
    });
  }

  return cache;
}

interface SessionData {
  id: string;
  userId: string;
  sessionToken: string;
  deviceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  created: Date;
}

interface CreateSessionOptions {
  userId: string;
  sessionToken: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  expiresAt: Date;
  loginMethod?: 'credentials' | 'google' | 'oauth'; // Track how user logged in
}

/**
 * Parse user agent to extract device, browser, and OS info
 */
function parseUserAgent(userAgent?: string) {
  if (!userAgent) {
    return { device: undefined, browser: undefined, os: undefined };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    device: result.device.type || "desktop",
    browser: result.browser.name
      ? `${result.browser.name} ${result.browser.version || ""}`
      : undefined,
    os: result.os.name
      ? `${result.os.name} ${result.os.version || ""}`
      : undefined,
  };
}

/**
 * Create a new session in both cache and database
 */
export async function createSession(
  options: CreateSessionOptions
): Promise<SessionData> {
  const { device, browser, os } = parseUserAgent(options.userAgent);

  // Check if session already exists
  const existingSession = await db.query.userSessions.findFirst({
    where: eq(userSessions.sessionToken, options.sessionToken),
  });

  if (existingSession) {
    console.log("⚠️ Session already exists, updating instead:", {
      sessionToken: options.sessionToken.substring(0, 10) + "...",
    });

    // Update existing session
    const [session] = await db
      .update(userSessions)
      .set({
        deviceId: options.deviceId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        device,
        browser,
        os,
        location: options.location,
        loginMethod: options.loginMethod,
        isActive: true,
        lastActivity: new Date(),
        expiresAt: options.expiresAt,
      })
      .where(eq(userSessions.sessionToken, options.sessionToken))
      .returning();

    // Update cache
    const keyv = getCache();
    const ttl = options.expiresAt.getTime() - Date.now();
    await keyv.set(options.sessionToken, session, ttl);

    return session;
  }

  // Create new session in database
  const [session] = await db
    .insert(userSessions)
    .values({
      userId: options.userId,
      sessionToken: options.sessionToken,
      deviceId: options.deviceId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      device,
      browser,
      os,
      location: options.location,
      loginMethod: options.loginMethod,
      isActive: true,
      lastActivity: new Date(),
      expiresAt: options.expiresAt,
    })
    .returning();

  // Cache in Keyv
  const keyv = getCache();
  const ttl = options.expiresAt.getTime() - Date.now();
  await keyv.set(options.sessionToken, session, ttl);

  console.log("✅ Session created:", {
    userId: options.userId,
    sessionToken: options.sessionToken.substring(0, 10) + "...",
    device,
    browser,
  });

  return session;
}

/**
 * Get session by token (checks cache first, then database)
 */
export async function getSession(
  sessionToken: string
): Promise<SessionData | null> {
  // Try cache first
  const keyv = getCache();
  const cached = await keyv.get<SessionData>(sessionToken);

  if (cached) {
    // Verify cached session is still active in database
    const dbSession = await db.query.userSessions.findFirst({
      where: eq(userSessions.sessionToken, sessionToken),
      columns: { isActive: true, expiresAt: true },
    });

    // If session is inactive or expired, remove from cache and return null
    if (!dbSession || !dbSession.isActive || dbSession.expiresAt < new Date()) {
      await keyv.delete(sessionToken);
      return null;
    }

    // Convert date strings back to Date objects (Keyv serializes them)
    if (typeof cached.lastActivity === "string") {
      cached.lastActivity = new Date(cached.lastActivity);
    }
    if (typeof cached.expiresAt === "string") {
      cached.expiresAt = new Date(cached.expiresAt);
    }
    if (typeof cached.created === "string") {
      cached.created = new Date(cached.created);
    }
    return cached;
  }

  // Fallback to database
  const session = await db.query.userSessions.findFirst({
    where: and(
      eq(userSessions.sessionToken, sessionToken),
      eq(userSessions.isActive, true),
      gt(userSessions.expiresAt, new Date())
    ),
  });

  if (session) {
    // Cache for next time
    const ttl = session.expiresAt.getTime() - Date.now();
    await keyv.set(sessionToken, session, ttl);
  }

  return session || null;
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(
  sessionToken: string
): Promise<void> {
  const now = new Date();

  // Update database
  await db
    .update(userSessions)
    .set({ lastActivity: now })
    .where(eq(userSessions.sessionToken, sessionToken));

  // Update cache
  const keyv = getCache();
  const cached = await keyv.get<SessionData>(sessionToken);

  if (cached) {
    cached.lastActivity = now;
    const ttl = new Date(cached.expiresAt).getTime() - Date.now();
    await keyv.set(sessionToken, cached, ttl);
  }
}

/**
 * Revoke a session (mark as inactive)
 */
export async function revokeSession(sessionToken: string): Promise<void> {
  // Update database
  await db
    .update(userSessions)
    .set({ isActive: false })
    .where(eq(userSessions.sessionToken, sessionToken));

  // Remove from cache
  const keyv = getCache();
  await keyv.delete(sessionToken);

  console.log("🔒 Session revoked:", sessionToken.substring(0, 10) + "...");
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  // Get all active sessions
  const sessions = await db.query.userSessions.findMany({
    where: and(
      eq(userSessions.userId, userId),
      eq(userSessions.isActive, true)
    ),
  });

  // Update database
  await db
    .update(userSessions)
    .set({ isActive: false })
    .where(eq(userSessions.userId, userId));

  // Remove from cache
  const keyv = getCache();
  if (sessions.length > 0) {
    await Promise.all(sessions.map((s) => keyv.delete(s.sessionToken)));
  }

  console.log(`🔒 All sessions revoked for user: ${userId}`);
}

/**
 * Revoke all sessions for a user except the current session
 * Used when user changes password - keep current session active
 */
export async function revokeAllUserSessionsExceptCurrent(
  userId: string,
  currentSessionToken: string
): Promise<number> {
  // Get all active sessions except current
  const sessions = await db.query.userSessions.findMany({
    where: and(
      eq(userSessions.userId, userId),
      eq(userSessions.isActive, true),
      ne(userSessions.sessionToken, currentSessionToken)
    ),
  });

  if (sessions.length === 0) {
    console.log('🔒 No other sessions to revoke');
    return 0;
  }

  // Update database - revoke all except current
  await db
    .update(userSessions)
    .set({ isActive: false })
    .where(
      and(
        eq(userSessions.userId, userId),
        ne(userSessions.sessionToken, currentSessionToken)
      )
    );

  // Remove from cache
  const keyv = getCache();
  await Promise.all(sessions.map((s) => keyv.delete(s.sessionToken)));

  console.log(`🔒 ${sessions.length} sessions revoked for user: ${userId} (kept current session)`);
  return sessions.length;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
  const sessions = await db.query.userSessions.findMany({
    where: and(
      eq(userSessions.userId, userId),
      eq(userSessions.isActive, true),
      gt(userSessions.expiresAt, new Date())
    ),
    orderBy: (sessions, { desc }) => [desc(sessions.lastActivity)],
  });

  return sessions;
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const now = new Date();

  // Get expired sessions (expiresAt < now)
  const expiredSessions = await db.query.userSessions.findMany({
    where: and(
      eq(userSessions.isActive, true),
      lt(userSessions.expiresAt, now)
    ),
  });

  if (expiredSessions.length === 0) {
    return 0;
  }

  // Mark as inactive in database
  await db
    .update(userSessions)
    .set({ isActive: false })
    .where(
      and(eq(userSessions.isActive, true), lt(userSessions.expiresAt, now))
    );

  // Remove from cache
  const keyv = getCache();
  if (expiredSessions.length > 0) {
    await Promise.all(expiredSessions.map((s) => keyv.delete(s.sessionToken)));
  }

  console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);
  return expiredSessions.length;
}

/**
 * Validate session and check if user still exists and is active
 */
export async function validateSession(
  sessionToken: string
): Promise<{ valid: boolean; userId?: string; reason?: string }> {
  const session = await getSession(sessionToken);

  if (!session) {
    return { valid: false, reason: "Session not found" };
  }

  if (!session.isActive) {
    return { valid: false, reason: "Session is inactive" };
  }

  if (session.expiresAt < new Date()) {
    await revokeSession(sessionToken);
    return { valid: false, reason: "Session expired" };
  }

  // Check if user still exists and is active
  const user = await db.query.users.findFirst({
    where: eq(userSessions.userId, session.userId),
  });

  if (!user) {
    await revokeSession(sessionToken);
    return { valid: false, reason: "User not found" };
  }

  if (!user.isActive) {
    await revokeSession(sessionToken);
    return { valid: false, reason: "User is inactive" };
  }

  // Update last activity
  await updateSessionActivity(sessionToken);

  return { valid: true, userId: session.userId };
}

/**
 * Clear all cache (useful for testing or maintenance)
 */
export async function clearCache(): Promise<void> {
  const keyv = getCache();
  await keyv.clear();
  console.log("🧹 Cache cleared");
}
