'use client';

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Sparkles, User, BookOpen, Award, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeOnboardingProps {
  userName: string;
  locale: string;
  onComplete: () => void;
}

export function WelcomeOnboarding({ userName, locale, onComplete }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: <Trans>Welcome to CUBIS Academy!</Trans>,
      description: (
        <Trans>
          Hi {userName}! We're excited to have you here. Let's take a quick tour to help you get started.
        </Trans>
      ),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: User,
      title: <Trans>Complete Your Profile</Trans>,
      description: (
        <Trans>
          Add your personal information, profile photo, and contact details to personalize your learning experience.
        </Trans>
      ),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BookOpen,
      title: <Trans>Explore Courses</Trans>,
      description: (
        <Trans>
          Browse our course catalog, find courses that interest you, and enroll to start your learning journey.
        </Trans>
      ),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Award,
      title: <Trans>Track Your Progress</Trans>,
      description: (
        <Trans>
          Monitor your course progress, view scores, check attendance, and manage your payments all in one place.
        </Trans>
      ),
      color: 'from-orange-500 to-red-500',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-2xl w-full p-8 shadow-2xl">
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-[#007FFF]'
                      : index < currentStep
                      ? 'w-2 bg-[#007FFF]'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#17224D] mb-4">
                {step.title}
              </h2>
              <p className="text-lg text-[#363942]/70 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-[#363942]/70 hover:text-[#363942]"
              >
                <Trans>Skip Tour</Trans>
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#363942]/70">
                  {currentStep + 1} / {steps.length}
                </span>
                <Button
                  onClick={handleNext}
                  className="bg-[#007FFF] hover:bg-[#0066CC] text-white gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <Trans>Get Started</Trans>
                    </>
                  ) : (
                    <>
                      <Trans>Next</Trans>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
