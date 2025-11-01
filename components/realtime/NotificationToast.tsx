/**
 * Real-time Notification Toast
 * 
 * Displays real-time notifications from Pusher events.
 */

'use client';

import { useNotifications } from '@/lib/realtime/hooks';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationToastProps {
  userId: string;
}

export function NotificationToast({ userId }: NotificationToastProps) {
  const { notifications, dismissNotification } = useNotifications(userId);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.timestamp}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`
              bg-white rounded-lg shadow-lg border-l-4 p-4 pr-12 relative
              ${notification.type === 'success' ? 'border-green-500' : ''}
              ${notification.type === 'error' ? 'border-red-500' : ''}
              ${notification.type === 'warning' ? 'border-yellow-500' : ''}
              ${notification.type === 'info' ? 'border-blue-500' : ''}
            `}
          >
            <button
              onClick={() => dismissNotification(notification)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {notification.type === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                {notification.type === 'warning' && (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                {notification.type === 'info' && (
                  <Info className="w-5 h-5 text-blue-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#17224D] mb-1">
                  {notification.title}
                </p>
                <p className="text-sm text-[#363942]/70">
                  {notification.message}
                </p>
                {notification.link && (
                  <a
                    href={notification.link}
                    className="text-sm text-[#007FFF] hover:underline mt-2 inline-block"
                  >
                    View details →
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
