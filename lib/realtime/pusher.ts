/**
 * Pusher Real-time Client
 * 
 * Provides WebSocket-based real-time updates for dashboards,
 * notifications, and live data synchronization.
 */

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance (for triggering events)
export const pusherServer = process.env.PUSHER_APP_ID && 
  process.env.PUSHER_KEY && 
  process.env.PUSHER_SECRET && 
  process.env.PUSHER_CLUSTER
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    })
  : null;

// Client-side Pusher instance factory
export function createPusherClient() {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
    console.warn('[Pusher] Client not configured');
    return null;
  }

  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    forceTLS: true,
  });
}

/**
 * Real-time event types
 */
export enum RealtimeEvent {
  // Dashboard events
  DASHBOARD_UPDATE = 'dashboard-update',
  STATS_UPDATE = 'stats-update',
  
  // Enrollment events
  NEW_ENROLLMENT = 'new-enrollment',
  ENROLLMENT_UPDATE = 'enrollment-update',
  
  // Payment events
  PAYMENT_RECEIVED = 'payment-received',
  PAYMENT_APPROVED = 'payment-approved',
  
  // Score events
  NEW_SCORE = 'new-score',
  SCORE_UPDATE = 'score-update',
  
  // Attendance events
  ATTENDANCE_MARKED = 'attendance-marked',
  
  // Notification events
  NEW_NOTIFICATION = 'new-notification',
  
  // Presence events
  USER_ONLINE = 'user-online',
  USER_OFFLINE = 'user-offline',
}

/**
 * Channel naming conventions
 */
export const RealtimeChannels = {
  // Private user channels
  userChannel: (userId: string) => `private-user-${userId}`,
  
  // Private dashboard channels
  studentDashboard: (studentId: string) => `private-student-dashboard-${studentId}`,
  teacherDashboard: (teacherId: string) => `private-teacher-dashboard-${teacherId}`,
  adminDashboard: () => 'private-admin-dashboard',
  
  // Private course channels
  course: (courseId: string) => `private-course-${courseId}`,
  courseEnrollments: (courseId: string) => `private-course-enrollments-${courseId}`,
  
  // Presence channels
  coursePresence: (courseId: string) => `presence-course-${courseId}`,
  
  // Public channels
  publicAnnouncements: () => 'public-announcements',
};

/**
 * Real-time service for triggering events
 */
export class RealtimeService {
  /**
   * Trigger dashboard update for a user
   */
  static async triggerDashboardUpdate(userId: string, data: any): Promise<void> {
    if (!pusherServer) {
      console.warn('[Pusher] Server not configured, skipping event');
      return;
    }

    try {
      await pusherServer.trigger(
        RealtimeChannels.userChannel(userId),
        RealtimeEvent.DASHBOARD_UPDATE,
        data
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] Dashboard update sent to user ${userId}`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to trigger dashboard update:', error);
    }
  }

  /**
   * Trigger stats update for a dashboard
   */
  static async triggerStatsUpdate(
    channelName: string,
    stats: any
  ): Promise<void> {
    if (!pusherServer) return;

    try {
      await pusherServer.trigger(
        channelName,
        RealtimeEvent.STATS_UPDATE,
        stats
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] Stats update sent to ${channelName}`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to trigger stats update:', error);
    }
  }

  /**
   * Notify about new enrollment
   */
  static async notifyNewEnrollment(
    courseId: string,
    teacherId: string,
    enrollment: any
  ): Promise<void> {
    if (!pusherServer) return;

    try {
      // Notify course channel
      await pusherServer.trigger(
        RealtimeChannels.courseEnrollments(courseId),
        RealtimeEvent.NEW_ENROLLMENT,
        enrollment
      );

      // Notify teacher dashboard
      await pusherServer.trigger(
        RealtimeChannels.teacherDashboard(teacherId),
        RealtimeEvent.NEW_ENROLLMENT,
        enrollment
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] New enrollment notification sent`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to notify new enrollment:', error);
    }
  }

  /**
   * Notify about payment received
   */
  static async notifyPaymentReceived(
    studentId: string,
    teacherId: string,
    payment: any
  ): Promise<void> {
    if (!pusherServer) return;

    try {
      // Notify student
      await pusherServer.trigger(
        RealtimeChannels.userChannel(studentId),
        RealtimeEvent.PAYMENT_RECEIVED,
        payment
      );

      // Notify teacher
      await pusherServer.trigger(
        RealtimeChannels.userChannel(teacherId),
        RealtimeEvent.PAYMENT_RECEIVED,
        payment
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] Payment notification sent`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to notify payment:', error);
    }
  }

  /**
   * Notify about payment approval
   */
  static async notifyPaymentApproved(
    studentId: string,
    payment: any
  ): Promise<void> {
    if (!pusherServer) return;

    try {
      await pusherServer.trigger(
        RealtimeChannels.userChannel(studentId),
        RealtimeEvent.PAYMENT_APPROVED,
        payment
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] Payment approval notification sent`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to notify payment approval:', error);
    }
  }

  /**
   * Notify about new score
   */
  static async notifyNewScore(
    studentId: string,
    score: any
  ): Promise<void> {
    if (!pusherServer) return;

    try {
      await pusherServer.trigger(
        RealtimeChannels.userChannel(studentId),
        RealtimeEvent.NEW_SCORE,
        score
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] New score notification sent`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to notify new score:', error);
    }
  }

  /**
   * Notify about attendance marked
   */
  static async notifyAttendanceMarked(
    studentIds: string[],
    attendance: any
  ): Promise<void> {
    if (!pusherServer) return;

    try {
      // Batch trigger to multiple students
      await pusherServer.triggerBatch(
        studentIds.map(studentId => ({
          channel: RealtimeChannels.userChannel(studentId),
          name: RealtimeEvent.ATTENDANCE_MARKED,
          data: attendance,
        }))
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] Attendance notifications sent to ${studentIds.length} students`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to notify attendance:', error);
    }
  }

  /**
   * Send notification to user
   */
  static async sendNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      link?: string;
    }
  ): Promise<void> {
    if (!pusherServer) return;

    try {
      await pusherServer.trigger(
        RealtimeChannels.userChannel(userId),
        RealtimeEvent.NEW_NOTIFICATION,
        {
          ...notification,
          timestamp: new Date().toISOString(),
        }
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] Notification sent to user ${userId}`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to send notification:', error);
    }
  }

  /**
   * Broadcast public announcement
   */
  static async broadcastAnnouncement(announcement: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }): Promise<void> {
    if (!pusherServer) return;

    try {
      await pusherServer.trigger(
        RealtimeChannels.publicAnnouncements(),
        'announcement',
        {
          ...announcement,
          timestamp: new Date().toISOString(),
        }
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Pusher] Public announcement broadcast`);
      }
    } catch (error) {
      console.error('[Pusher] Failed to broadcast announcement:', error);
    }
  }
}

/**
 * Pusher authentication for private/presence channels
 */
export function authenticatePusherChannel(
  socketId: string,
  channelName: string,
  userId: string
): { auth: string; channel_data?: string } | null {
  if (!pusherServer) {
    return null;
  }

  try {
    // For presence channels, include user data
    if (channelName.startsWith('presence-')) {
      const presenceData = {
        user_id: userId,
        user_info: {
          id: userId,
        },
      };

      return pusherServer.authorizeChannel(socketId, channelName, presenceData);
    }

    // For private channels
    return pusherServer.authorizeChannel(socketId, channelName);
  } catch (error) {
    console.error('[Pusher] Authentication failed:', error);
    return null;
  }
}
