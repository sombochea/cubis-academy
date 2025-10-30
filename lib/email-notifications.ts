import { Resend } from 'resend';
import { db } from './drizzle/db';
import { users, userSessions } from './drizzle/schema';
import { eq } from 'drizzle-orm';

// Initialize Resend (will be undefined if no API key)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface LoginNotificationData {
  userId: string;
  device?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  loginTime: Date;
}

/**
 * Send login notification email to user
 */
export async function sendLoginNotification(data: LoginNotificationData): Promise<void> {
  try {
    // Get user email
    const user = await db.query.users.findFirst({
      where: eq(users.id, data.userId),
    });

    if (!user || !user.email) {
      console.log('❌ User not found or no email for login notification');
      return;
    }

    // Format device info
    const deviceInfo = formatDeviceInfo(data);
    const timeString = data.loginTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    // Email content
    const subject = '🔐 New login to your CUBIS Academy account';
    const htmlContent = generateLoginNotificationHTML({
      userName: user.name || 'User',
      deviceInfo,
      timeString,
      ipAddress: data.ipAddress,
      location: data.location,
    });

    // Send email
    if (resend) {
      await resend.emails.send({
        from: 'CUBIS Academy <security@cubisacademy.com>',
        to: user.email,
        subject,
        html: htmlContent,
      });

      console.log('✅ Login notification sent to:', user.email);
    } else {
      // Log to console if Resend not configured
      console.log('📧 Login notification (email not configured):');
      console.log(`   To: ${user.email}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Device: ${deviceInfo}`);
      console.log(`   Time: ${timeString}`);
      console.log(`   IP: ${data.ipAddress}`);
      console.log(`   Location: ${data.location || 'Unknown'}`);
    }
  } catch (error) {
    console.error('❌ Failed to send login notification:', error);
  }
}

/**
 * Send password change notification email to user
 */
export async function sendPasswordChangeNotification(
  userId: string,
  revokedSessionsCount: number
): Promise<void> {
  try {
    // Get user email
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.email) {
      console.log('❌ User not found or no email for password change notification');
      return;
    }

    const timeString = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    // Email content
    const subject = '🔐 Your CUBIS Academy password has been changed';
    const htmlContent = generatePasswordChangeNotificationHTML({
      userName: user.name || 'User',
      timeString,
      revokedSessionsCount,
    });

    // Send email
    if (resend) {
      await resend.emails.send({
        from: 'CUBIS Academy <security@cubisacademy.com>',
        to: user.email,
        subject,
        html: htmlContent,
      });

      console.log('✅ Password change notification sent to:', user.email);
    } else {
      // Log to console if Resend not configured
      console.log('📧 Password change notification (email not configured):');
      console.log(`   To: ${user.email}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Time: ${timeString}`);
      console.log(`   Revoked Sessions: ${revokedSessionsCount}`);
    }
  } catch (error) {
    console.error('❌ Failed to send password change notification:', error);
  }
}

/**
 * Format device information for display
 */
function formatDeviceInfo(data: LoginNotificationData): string {
  const parts = [];
  
  if (data.device) {
    parts.push(data.device.charAt(0).toUpperCase() + data.device.slice(1));
  }
  
  if (data.browser) {
    parts.push(data.browser);
  }
  
  if (data.os) {
    parts.push(`on ${data.os}`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'Unknown device';
}

/**
 * Generate HTML email template for login notification
 */
function generateLoginNotificationHTML(data: {
  userName: string;
  deviceInfo: string;
  timeString: string;
  ipAddress?: string;
  location?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Login Alert</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(135deg, #007FFF, #17224D);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .alert-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #17224D;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #64748b;
      font-size: 16px;
    }
    .info-card {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #475569;
    }
    .info-value {
      color: #17224D;
      font-weight: 500;
    }
    .security-notice {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .security-notice h3 {
      color: #92400e;
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    .security-notice p {
      color: #92400e;
      margin: 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #007FFF, #17224D);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CUBIS Academy</div>
      <div class="alert-icon">🔐</div>
      <h1 class="title">New Login Detected</h1>
      <p class="subtitle">Hi ${data.userName}, we detected a new login to your account</p>
    </div>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Device:</span>
        <span class="info-value">${data.deviceInfo}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${data.timeString}</span>
      </div>
      ${data.ipAddress ? `
      <div class="info-row">
        <span class="info-label">IP Address:</span>
        <span class="info-value">${data.ipAddress}</span>
      </div>
      ` : ''}
      ${data.location ? `
      <div class="info-row">
        <span class="info-label">Location:</span>
        <span class="info-value">${data.location}</span>
      </div>
      ` : ''}
    </div>

    <div class="security-notice">
      <h3>🛡️ Was this you?</h3>
      <p>If you recognize this login, you can ignore this email. If you don't recognize this activity, please secure your account immediately by changing your password and reviewing your active sessions.</p>
    </div>

    <div style="text-align: center;">
      <a href="https://cubisacademy.com/profile" class="button">Review Active Sessions</a>
    </div>

    <div class="footer">
      <p>This is an automated security notification from CUBIS Academy.</p>
      <p>If you have any concerns, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML email template for password change notification
 */
function generatePasswordChangeNotificationHTML(data: {
  userName: string;
  timeString: string;
  revokedSessionsCount: number;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(135deg, #007FFF, #17224D);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #17224D;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #64748b;
      font-size: 16px;
    }
    .info-card {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #475569;
    }
    .info-value {
      color: #17224D;
      font-weight: 500;
    }
    .success-notice {
      background: #dcfce7;
      border: 1px solid #16a34a;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .success-notice h3 {
      color: #15803d;
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    .success-notice p {
      color: #15803d;
      margin: 0;
      font-size: 14px;
    }
    .security-info {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .security-info h3 {
      color: #92400e;
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    .security-info p {
      color: #92400e;
      margin: 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #007FFF, #17224D);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CUBIS Academy</div>
      <div class="success-icon">✅</div>
      <h1 class="title">Password Changed Successfully</h1>
      <p class="subtitle">Hi ${data.userName}, your password has been updated</p>
    </div>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Changed At:</span>
        <span class="info-value">${data.timeString}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Sessions Revoked:</span>
        <span class="info-value">${data.revokedSessionsCount} other device${data.revokedSessionsCount !== 1 ? 's' : ''}</span>
      </div>
    </div>

    <div class="success-notice">
      <h3>🛡️ Security Enhanced</h3>
      <p>Your password has been successfully changed and all other active sessions have been automatically logged out for your security.</p>
    </div>

    ${data.revokedSessionsCount > 0 ? `
    <div class="security-info">
      <h3>🔒 Sessions Logged Out</h3>
      <p>We've automatically logged out ${data.revokedSessionsCount} other active session${data.revokedSessionsCount !== 1 ? 's' : ''} on your account. You'll need to log in again on those devices with your new password.</p>
    </div>
    ` : ''}

    <div style="text-align: center;">
      <a href="https://cubisacademy.com/profile" class="button">View Account Security</a>
    </div>

    <div class="footer">
      <p><strong>Didn't change your password?</strong></p>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <p>This is an automated security notification from CUBIS Academy.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Check if this is a new device for the user
 * Returns true if this device/browser combination hasn't been seen before
 */
export async function isNewDevice(
  userId: string,
  device?: string,
  browser?: string,
  os?: string
): Promise<boolean> {
  try {
    // Check if we have any previous sessions with similar device info
    const existingSessions = await db.query.userSessions.findMany({
      where: eq(userSessions.userId, userId),
      columns: {
        device: true,
        browser: true,
        os: true,
      },
    });

    // If no previous sessions, this is definitely a new device
    if (existingSessions.length === 0) {
      return true;
    }

    // Check if we have a similar device/browser/os combination
    const hasMatchingDevice = existingSessions.some((session) => {
      const deviceMatch = !device || !session.device || session.device === device;
      const browserMatch = !browser || !session.browser || 
        session.browser.toLowerCase().includes(browser.toLowerCase().split(' ')[0]);
      const osMatch = !os || !session.os || 
        session.os.toLowerCase().includes(os.toLowerCase().split(' ')[0]);
      
      return deviceMatch && browserMatch && osMatch;
    });

    return !hasMatchingDevice;
  } catch (error) {
    console.error('Error checking if new device:', error);
    // On error, assume it's a new device to be safe
    return true;
  }
}
