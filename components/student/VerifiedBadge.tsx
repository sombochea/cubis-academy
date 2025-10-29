'use client';

import { CheckCircle2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function VerifiedBadge({ size = 'md', showText = false }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <CheckCircle2 
        className={`${sizeClasses[size]} text-green-600 flex-shrink-0`}
        title="Email verified"
      />
      {showText && (
        <span className={`${textSizeClasses[size]} text-green-600 font-medium`}>
          <Trans>Verified</Trans>
        </span>
      )}
    </div>
  );
}
