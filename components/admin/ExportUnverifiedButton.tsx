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

export function ExportUnverifiedButton() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>('all');

  const handleExport = async () => {
    setLoading(true);
    try {
      const url = role === 'all' 
        ? '/api/admin/users/export-unverified'
        : `/api/admin/users/export-unverified?role=${role}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `unverified-${role}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export unverified users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
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
            <Trans>Export Unverified</Trans>
          </>
        )}
      </Button>
    </div>
  );
}
