'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ExportUsersButton() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>('all');
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role !== 'all') {
        params.append('role', role);
      }
      if (verificationStatus !== 'all') {
        params.append('status', verificationStatus);
      }

      const url = `/api/admin/users/export?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const statusLabel = verificationStatus === 'all' ? 'all' : verificationStatus;
      const roleLabel = role === 'all' ? 'all-roles' : role;
      a.download = `users-${statusLabel}-${roleLabel}-${new Date().toISOString().split('T')[0]}.csv`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={verificationStatus} onValueChange={setVerificationStatus}>
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans>All Users</Trans>
          </SelectItem>
          <SelectItem value="verified">
            <Trans>Verified</Trans>
          </SelectItem>
          <SelectItem value="unverified">
            <Trans>Unverified</Trans>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="h-9 w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans>All Roles</Trans>
          </SelectItem>
          <SelectItem value="student">
            <Trans>Students</Trans>
          </SelectItem>
          <SelectItem value="teacher">
            <Trans>Teachers</Trans>
          </SelectItem>
          <SelectItem value="admin">
            <Trans>Admins</Trans>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={handleExport}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <Trans>Exporting...</Trans>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <Trans>Export</Trans>
          </>
        )}
      </Button>
    </div>
  );
}
