'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Users, TrendingUp } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { ExportUsersButton } from './ExportUsersButton';

interface VerificationStats {
  overall: {
    total: number;
    verified: number;
    unverified: number;
    verificationRate: number;
  };
  byRole: Array<{
    role: string;
    total: number;
    verified: number;
    unverified: number;
    verificationRate: number;
  }>;
  recentVerifications: number;
  authMethods: {
    oauth2: {
      total: number;
      verified: number;
      verificationRate: number;
    };
    credentials: {
      total: number;
      verified: number;
      verificationRate: number;
    };
  };
}

export function VerificationStatsWidget() {
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats/verification');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#17224D]">
          <Trans>Email Verification Statistics</Trans>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="text-sm px-3 py-1.5 text-[#007FFF] hover:text-[#0066CC] hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            <Trans>Refresh</Trans>
          </button>
          <ExportUsersButton />
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">
              {stats.overall.total}
            </span>
          </div>
          <p className="text-sm text-blue-700 font-medium">
            <Trans>Total Users</Trans>
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">
              {stats.overall.verified}
            </span>
          </div>
          <p className="text-sm text-green-700 font-medium">
            <Trans>Verified</Trans>
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">
              {stats.overall.unverified}
            </span>
          </div>
          <p className="text-sm text-yellow-700 font-medium">
            <Trans>Unverified</Trans>
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">
              {stats.overall.verificationRate}%
            </span>
          </div>
          <p className="text-sm text-purple-700 font-medium">
            <Trans>Verification Rate</Trans>
          </p>
        </div>
      </div>

      {/* By Role Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.byRole.map((role) => (
          <div key={role.role} className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
              {role.role}s
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600"><Trans>Total</Trans>:</span>
                <span className="font-semibold text-gray-900">{role.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600"><Trans>Verified</Trans>:</span>
                <span className="font-semibold text-green-600">{role.verified}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600"><Trans>Unverified</Trans>:</span>
                <span className="font-semibold text-yellow-600">{role.unverified}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600"><Trans>Rate</Trans>:</span>
                  <span className="font-bold text-purple-600">{role.verificationRate}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auth Methods Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            <Trans>OAuth2 (Google, etc.)</Trans>
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600"><Trans>Total</Trans>:</span>
              <span className="font-semibold text-gray-900">{stats.authMethods.oauth2.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600"><Trans>Verified</Trans>:</span>
              <span className="font-semibold text-green-600">{stats.authMethods.oauth2.verified}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600"><Trans>Rate</Trans>:</span>
                <span className="font-bold text-purple-600">{stats.authMethods.oauth2.verificationRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            <Trans>Email/Password</Trans>
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600"><Trans>Total</Trans>:</span>
              <span className="font-semibold text-gray-900">{stats.authMethods.credentials.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600"><Trans>Verified</Trans>:</span>
              <span className="font-semibold text-green-600">{stats.authMethods.credentials.verified}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600"><Trans>Rate</Trans>:</span>
                <span className="font-bold text-purple-600">{stats.authMethods.credentials.verificationRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{stats.recentVerifications}</strong> <Trans>users verified their email in the last 7 days</Trans>
        </p>
      </div>
    </div>
  );
}
