"use client";

import { useState, useEffect } from "react";
import { Trans } from "@lingui/react/macro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEnsureSession } from "@/lib/hooks/useEnsureSession";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  MapPin,
  Clock,
  Shield,
  X,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Icons } from "./icons";

interface Session {
  id: string;
  device?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  deviceId?: string;
  lastActivity: string;
  created: string;
  isActive: boolean;
  isCurrent?: boolean;
  isOAuth?: boolean;
}

export function SessionsManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showRevokeAll, setShowRevokeAll] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);

  // Ensure session is created in our store
  useEnsureSession();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/revoke`, {
        method: "POST",
      });

      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId));
      }
    } catch (error) {
      console.error("Failed to revoke session:", error);
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllSessions = async () => {
    setRevokingAll(true);
    try {
      const response = await fetch("/api/sessions/revoke-all", {
        method: "POST",
      });

      if (response.ok) {
        // Reload page to force re-authentication
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to revoke all sessions:", error);
      setRevokingAll(false);
    }
  };

  const getDeviceIcon = (device?: string) => {
    if (!device) return <Monitor className="w-5 h-5" />;
    if (device.toLowerCase().includes("mobile"))
      return <Smartphone className="w-5 h-5" />;
    if (device.toLowerCase().includes("tablet"))
      return <Tablet className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#007FFF]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#17224D]">
            <Trans>Active Sessions</Trans>
          </h3>
          <p className="text-sm text-gray-600">
            <Trans>Manage your active login sessions across devices</Trans>
          </p>
        </div>
        {sessions.filter((s) => !s.isCurrent).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRevokeAll(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Shield className="w-4 h-4 mr-2" />
            <Trans>Revoke All Sessions</Trans>
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          <Trans>No active sessions found</Trans>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1 text-gray-600">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-[#17224D]">
                        {session.browser || "Unknown Browser"}
                      </h4>
                      {session.isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <Trans>Current Session</Trans>
                        </span>
                      )}
                      {session.isOAuth && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          <Icons.Google className="w-3 h-3" />
                          <Trans>Google</Trans>
                        </span>
                      )}
                      {!session.isCurrent && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          <Trans>Active</Trans>
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      {session.os && (
                        <div className="flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          <span>{session.os}</span>
                        </div>
                      )}
                      {session.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{session.location}</span>
                        </div>
                      )}
                      {session.ipAddress && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">
                            IP: {session.ipAddress}
                          </span>
                        </div>
                      )}
                      {session.deviceId && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-mono">
                            Device: {session.deviceId.substring(0, 8)}...
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          <Trans>Last active</Trans>{" "}
                          {formatDistanceToNow(new Date(session.lastActivity), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession(session.id)}
                    disabled={revoking === session.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {revoking === session.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={showRevokeAll} onOpenChange={setShowRevokeAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <Trans>Revoke All Sessions?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                This will log you out from all devices and browsers. You will
                need to log in again on this device.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokingAll}>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={revokeAllSessions}
              disabled={revokingAll}
              className="bg-red-600 hover:bg-red-700"
            >
              {revokingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <Trans>Revoking...</Trans>
                </>
              ) : (
                <Trans>Yes, Revoke All</Trans>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
