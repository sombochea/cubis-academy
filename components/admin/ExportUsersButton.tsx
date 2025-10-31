'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Filter } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function ExportUsersButton() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>('all');
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [open, setOpen] = useState(false);

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
      
      // Close popover after successful export
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">
            <Trans>Filter & Export</Trans>
          </span>
          <span className="sm:hidden">
            <Trans>Export</Trans>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-[#17224D]">
              <Trans>Export Users</Trans>
            </h4>
            <p className="text-xs text-[#363942]/70">
              <Trans>Filter and export users to CSV</Trans>
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="verification-status" className="text-xs font-medium">
                <Trans>Verification Status</Trans>
              </Label>
              <Select value={verificationStatus} onValueChange={setVerificationStatus}>
                <SelectTrigger id="verification-status" className="h-9 w-full">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-medium">
                <Trans>Role</Trans>
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="h-9 w-full">
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
            </div>
          </div>

          <div className="pt-3 border-t">
            <Button
              onClick={handleExport}
              disabled={loading}
              className="w-full gap-2 bg-[#007FFF] hover:bg-[#0066CC]"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <Trans>Exporting...</Trans>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <Trans>Export to CSV</Trans>
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
