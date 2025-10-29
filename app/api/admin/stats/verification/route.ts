import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { sql, isNull, isNotNull, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get overall stats
    const [totalStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        verified: sql<number>`count(${users.emailVerifiedAt})::int`,
        unverified: sql<number>`count(*) filter (where ${users.emailVerifiedAt} is null)::int`,
      })
      .from(users);

    // Get stats by role
    const roleStats = await db
      .select({
        role: users.role,
        total: sql<number>`count(*)::int`,
        verified: sql<number>`count(${users.emailVerifiedAt})::int`,
        unverified: sql<number>`count(*) filter (where ${users.emailVerifiedAt} is null)::int`,
      })
      .from(users)
      .groupBy(users.role);

    // Get recent verifications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentVerifications] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(sql`${users.emailVerifiedAt} >= ${sevenDaysAgo}`);

    // Get OAuth2 vs Credentials stats
    const [authMethodStats] = await db
      .select({
        oauth2Count: sql<number>`count(*) filter (where ${users.googleId} is not null)::int`,
        credentialsCount: sql<number>`count(*) filter (where ${users.passHash} is not null)::int`,
        oauth2Verified: sql<number>`count(*) filter (where ${users.googleId} is not null and ${users.emailVerifiedAt} is not null)::int`,
        credentialsVerified: sql<number>`count(*) filter (where ${users.passHash} is not null and ${users.emailVerifiedAt} is not null)::int`,
      })
      .from(users);

    // Calculate verification rate
    const verificationRate = totalStats.total > 0 
      ? ((totalStats.verified / totalStats.total) * 100).toFixed(2)
      : '0.00';

    return NextResponse.json({
      overall: {
        total: totalStats.total,
        verified: totalStats.verified,
        unverified: totalStats.unverified,
        verificationRate: parseFloat(verificationRate),
      },
      byRole: roleStats.map(stat => ({
        role: stat.role,
        total: stat.total,
        verified: stat.verified,
        unverified: stat.unverified,
        verificationRate: stat.total > 0 
          ? parseFloat(((stat.verified / stat.total) * 100).toFixed(2))
          : 0,
      })),
      recentVerifications: recentVerifications.count,
      authMethods: {
        oauth2: {
          total: authMethodStats.oauth2Count,
          verified: authMethodStats.oauth2Verified,
          verificationRate: authMethodStats.oauth2Count > 0
            ? parseFloat(((authMethodStats.oauth2Verified / authMethodStats.oauth2Count) * 100).toFixed(2))
            : 0,
        },
        credentials: {
          total: authMethodStats.credentialsCount,
          verified: authMethodStats.credentialsVerified,
          verificationRate: authMethodStats.credentialsCount > 0
            ? parseFloat(((authMethodStats.credentialsVerified / authMethodStats.credentialsCount) * 100).toFixed(2))
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Verification stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification statistics' },
      { status: 500 }
    );
  }
}
