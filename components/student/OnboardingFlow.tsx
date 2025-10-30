'use client';

import { useState, useEffect } from 'react';
import { WelcomeOnboarding } from './WelcomeOnboarding';
import { ProfileSetup } from './ProfileSetup';

interface OnboardingFlowProps {
  userId: string;
  userName: string;
  userEmail: string;
  locale: string;
  onboardingCompleted: boolean;
}

export function OnboardingFlow({
  userId,
  userName,
  userEmail,
  locale,
  onboardingCompleted,
}: OnboardingFlowProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    // Only show onboarding if not completed
    if (!onboardingCompleted) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [onboardingCompleted]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setShowProfileSetup(true);
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
  };

  if (!showWelcome && !showProfileSetup) {
    return null;
  }

  return (
    <>
      {showWelcome && (
        <WelcomeOnboarding
          userName={userName}
          locale={locale}
          onComplete={handleWelcomeComplete}
        />
      )}
      {showProfileSetup && (
        <ProfileSetup
          userId={userId}
          userName={userName}
          userEmail={userEmail}
          locale={locale}
          onComplete={handleProfileSetupComplete}
        />
      )}
    </>
  );
}
