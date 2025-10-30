'use client';

import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { Trans } from '@lingui/react/macro';

interface LoadingRedirectProps {
  message?: string;
  role?: string;
}

export function LoadingRedirect({ message, role }: LoadingRedirectProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: <Trans>Verifying credentials</Trans>, icon: Loader2 },
    { label: <Trans>Setting up your session</Trans>, icon: Loader2 },
    { label: <Trans>Loading your dashboard</Trans>, icon: Loader2 },
  ];

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Animate steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'from-purple-500 to-pink-500';
      case 'teacher':
        return 'from-blue-500 to-cyan-500';
      case 'student':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-[#007FFF] to-[#17224D]';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 bg-gradient-to-br ${getRoleColor(role)} rounded-2xl flex items-center justify-center shadow-lg animate-pulse`}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-[#17224D] mb-2">
            {message || <Trans>Welcome Back!</Trans>}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            <Trans>Please wait while we prepare your dashboard</Trans>
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getRoleColor(role)} transition-all duration-300 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isCurrent ? 'scale-105' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? `bg-gradient-to-br ${getRoleColor(role)}`
                        : isCurrent
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon
                        className={`w-5 h-5 ${
                          isCurrent ? 'text-blue-600 animate-spin' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isCompleted || isCurrent ? 'text-[#17224D]' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              <Trans>This should only take a moment...</Trans>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
