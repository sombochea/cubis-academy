import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/drizzle/db';
import { users } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const sendPasswordSchema = z.object({
  password: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { password } = sendPasswordSchema.parse(body);

    // Get user email
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Implement email sending with Resend
    // For now, we'll just log it
    console.log('Send password email to:', user.email);
    console.log('Password:', password);
    console.log('User:', user.name);

    // In production, use Resend:
    // await resend.emails.send({
    //   from: 'noreply@yourdomain.com',
    //   to: user.email,
    //   subject: 'Your New Password',
    //   html: `
    //     <h2>Password Reset</h2>
    //     <p>Hello ${user.name},</p>
    //     <p>Your new password is: <strong>${password}</strong></p>
    //     <p>Please change it after logging in.</p>
    //   `,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending password email:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
