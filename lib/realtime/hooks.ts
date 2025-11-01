/**
 * Real-time React Hooks
 * 
 * Custom hooks for subscribing to real-time events in React components.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPusherClient, RealtimeEvent, RealtimeChannels } from './pusher';
import type { Channel } from 'pusher-js';

/**
 * Hook for subscribing to a Pusher channel
 */
export function usePusherChannel(channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const pusherRef = useRef<ReturnType<typeof createPusherClient>>(null);

  useEffect(() => {
    // Initialize Pusher client
    if (!pusherRef.current) {
      pusherRef.current = createPusherClient();
    }

    const pusher = pusherRef.current;
    if (!pusher) {
      console.warn('[Pusher] Client not available');
      return;
    }

    // Subscribe to channel
    const ch = pusher.subscribe(channelName);
    setChannel(ch);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Pusher] Subscribed to ${channelName}`);
    }

    // Cleanup
    return () => {
      if (pusher) {
        pusher.unsubscribe(channelName);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Pusher] Unsubscribed from ${channelName}`);
        }
      }
    };
  }, [channelName]);

  return channel;
}

/**
 * Hook for listening to real-time dashboard updates
 */
export function useDashboardUpdates(userId: string, onUpdate: (data: any) => void) {
  const channel = usePusherChannel(RealtimeChannels.userChannel(userId));

  useEffect(() => {
    if (!channel) return;

    const handleUpdate = (data: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] Dashboard update received:', data);
      }
      onUpdate(data);
    };

    channel.bind(RealtimeEvent.DASHBOARD_UPDATE, handleUpdate);

    return () => {
      channel.unbind(RealtimeEvent.DASHBOARD_UPDATE, handleUpdate);
    };
  }, [channel, onUpdate]);
}

/**
 * Hook for listening to stats updates
 */
export function useStatsUpdates(channelName: string, onUpdate: (stats: any) => void) {
  const channel = usePusherChannel(channelName);

  useEffect(() => {
    if (!channel) return;

    const handleUpdate = (stats: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] Stats update received:', stats);
      }
      onUpdate(stats);
    };

    channel.bind(RealtimeEvent.STATS_UPDATE, handleUpdate);

    return () => {
      channel.unbind(RealtimeEvent.STATS_UPDATE, handleUpdate);
    };
  }, [channel, onUpdate]);
}

/**
 * Hook for listening to new enrollments
 */
export function useNewEnrollments(
  courseId: string,
  onNewEnrollment: (enrollment: any) => void
) {
  const channel = usePusherChannel(RealtimeChannels.courseEnrollments(courseId));

  useEffect(() => {
    if (!channel) return;

    const handleEnrollment = (enrollment: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] New enrollment received:', enrollment);
      }
      onNewEnrollment(enrollment);
    };

    channel.bind(RealtimeEvent.NEW_ENROLLMENT, handleEnrollment);

    return () => {
      channel.unbind(RealtimeEvent.NEW_ENROLLMENT, handleEnrollment);
    };
  }, [channel, onNewEnrollment]);
}

/**
 * Hook for listening to notifications
 */
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const channel = usePusherChannel(RealtimeChannels.userChannel(userId));

  useEffect(() => {
    if (!channel) return;

    const handleNotification = (notification: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] Notification received:', notification);
      }
      
      setNotifications(prev => [notification, ...prev]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n !== notification));
      }, 5000);
    };

    channel.bind(RealtimeEvent.NEW_NOTIFICATION, handleNotification);

    return () => {
      channel.unbind(RealtimeEvent.NEW_NOTIFICATION, handleNotification);
    };
  }, [channel]);

  const dismissNotification = useCallback((notification: any) => {
    setNotifications(prev => prev.filter(n => n !== notification));
  }, []);

  return { notifications, dismissNotification };
}

/**
 * Hook for listening to payment events
 */
export function usePaymentEvents(
  userId: string,
  onPaymentReceived?: (payment: any) => void,
  onPaymentApproved?: (payment: any) => void
) {
  const channel = usePusherChannel(RealtimeChannels.userChannel(userId));

  useEffect(() => {
    if (!channel) return;

    const handlePaymentReceived = (payment: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] Payment received:', payment);
      }
      onPaymentReceived?.(payment);
    };

    const handlePaymentApproved = (payment: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] Payment approved:', payment);
      }
      onPaymentApproved?.(payment);
    };

    if (onPaymentReceived) {
      channel.bind(RealtimeEvent.PAYMENT_RECEIVED, handlePaymentReceived);
    }

    if (onPaymentApproved) {
      channel.bind(RealtimeEvent.PAYMENT_APPROVED, handlePaymentApproved);
    }

    return () => {
      if (onPaymentReceived) {
        channel.unbind(RealtimeEvent.PAYMENT_RECEIVED, handlePaymentReceived);
      }
      if (onPaymentApproved) {
        channel.unbind(RealtimeEvent.PAYMENT_APPROVED, handlePaymentApproved);
      }
    };
  }, [channel, onPaymentReceived, onPaymentApproved]);
}

/**
 * Hook for listening to score events
 */
export function useScoreEvents(userId: string, onNewScore: (score: any) => void) {
  const channel = usePusherChannel(RealtimeChannels.userChannel(userId));

  useEffect(() => {
    if (!channel) return;

    const handleNewScore = (score: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] New score received:', score);
      }
      onNewScore(score);
    };

    channel.bind(RealtimeEvent.NEW_SCORE, handleNewScore);

    return () => {
      channel.unbind(RealtimeEvent.NEW_SCORE, handleNewScore);
    };
  }, [channel, onNewScore]);
}

/**
 * Hook for listening to attendance events
 */
export function useAttendanceEvents(
  userId: string,
  onAttendanceMarked: (attendance: any) => void
) {
  const channel = usePusherChannel(RealtimeChannels.userChannel(userId));

  useEffect(() => {
    if (!channel) return;

    const handleAttendance = (attendance: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] Attendance marked:', attendance);
      }
      onAttendanceMarked(attendance);
    };

    channel.bind(RealtimeEvent.ATTENDANCE_MARKED, handleAttendance);

    return () => {
      channel.unbind(RealtimeEvent.ATTENDANCE_MARKED, handleAttendance);
    };
  }, [channel, onAttendanceMarked]);
}

/**
 * Hook for presence channel (who's online)
 */
export function usePresence(channelName: string) {
  const [members, setMembers] = useState<any[]>([]);
  const channel = usePusherChannel(channelName);

  useEffect(() => {
    if (!channel || !channelName.startsWith('presence-')) return;

    const handleSubscriptionSucceeded = (members: any) => {
      const membersList: any[] = [];
      members.each((member: any) => {
        membersList.push(member);
      });
      setMembers(membersList);
    };

    const handleMemberAdded = (member: any) => {
      setMembers(prev => [...prev, member]);
    };

    const handleMemberRemoved = (member: any) => {
      setMembers(prev => prev.filter(m => m.id !== member.id));
    };

    channel.bind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
    channel.bind('pusher:member_added', handleMemberAdded);
    channel.bind('pusher:member_removed', handleMemberRemoved);

    return () => {
      channel.unbind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
      channel.unbind('pusher:member_added', handleMemberAdded);
      channel.unbind('pusher:member_removed', handleMemberRemoved);
    };
  }, [channel, channelName]);

  return members;
}

/**
 * Hook for public announcements
 */
export function usePublicAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const channel = usePusherChannel(RealtimeChannels.publicAnnouncements());

  useEffect(() => {
    if (!channel) return;

    const handleAnnouncement = (announcement: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Pusher] Announcement received:', announcement);
      }
      
      setAnnouncements(prev => [announcement, ...prev]);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        setAnnouncements(prev => prev.filter(a => a !== announcement));
      }, 10000);
    };

    channel.bind('announcement', handleAnnouncement);

    return () => {
      channel.unbind('announcement', handleAnnouncement);
    };
  }, [channel]);

  const dismissAnnouncement = useCallback((announcement: any) => {
    setAnnouncements(prev => prev.filter(a => a !== announcement));
  }, []);

  return { announcements, dismissAnnouncement };
}
