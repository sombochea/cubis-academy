"use client";

import { useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  User,
  MapPin,
  Phone,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

interface ProfileSetupProps {
  userId: string;
  userName: string;
  userEmail: string;
  locale: string;
  onComplete: () => void;
}

const profileSchema = z.object({
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export function ProfileSetup({
  userId,
  userName,
  userEmail,
  locale,
  onComplete,
}: ProfileSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      dob: "",
      gender: "",
      address: "",
      phone: "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/student/profile/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        onComplete();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      // Mark onboarding as complete even if skipped
      await fetch("/api/student/profile/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipOnboarding: true }),
      });
      onComplete();
      router.refresh();
    } catch (err) {
      setError("Failed to skip onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl my-8"
      >
        <Card className="p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#17224D] mb-2">
              <Trans>Complete Your Profile</Trans>
            </h2>
            <p className="text-[#363942]/70">
              <Trans>Help us personalize your learning experience</Trans>
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Current Info */}
            <div className="bg-[#F4F5F7] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-[#363942]/70" />
                <span className="text-[#363942]/70">
                  <Trans>Name:</Trans>
                </span>
                <span className="font-medium text-[#17224D]">{userName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#363942]/70" />
                <span className="text-[#363942]/70">
                  <Trans>Email:</Trans>
                </span>
                <span className="font-medium text-[#17224D]">{userEmail}</span>
              </div>
            </div>

            {/* Date of Birth and Gender - Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Date of Birth with Date Picker */}
              <form.Field name="dob">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#17224D]">
                      <Trans>Date of Birth</Trans>
                    </Label>
                    <DatePicker
                      date={
                        field.state.value
                          ? new Date(field.state.value)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          field.handleChange(format(date, "yyyy-MM-dd"));
                        } else {
                          field.handleChange("");
                        }
                      }}
                      placeholder="Select date"
                      disabled={(date) => date > new Date()}
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Gender */}
              <form.Field name="gender">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#17224D]">
                      <Trans>Gender</Trans>
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger className="w-full !h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">
                          <Trans>Male</Trans>
                        </SelectItem>
                        <SelectItem value="female">
                          <Trans>Female</Trans>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            {/* Phone */}
            <form.Field name="phone">
              {(field) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-semibold text-[#17224D]"
                  >
                    <Trans>Phone Number</Trans>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                    <Input
                      id={field.name}
                      type="tel"
                      placeholder="012345678"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors ${
                        field.state.meta.errors.length > 0
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Address */}
            <form.Field name="address">
              {(field) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-semibold text-[#17224D]"
                  >
                    <Trans>Address</Trans>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-[#363942]/40" />
                    <Textarea
                      id={field.name}
                      placeholder="Street address, city, state, postal code..."
                      rows={3}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pl-10 resize-none border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF]"
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-[#363942]/70 hover:text-[#363942]"
              >
                <Trans>Skip for Now</Trans>
              </Button>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="bg-[#007FFF] hover:bg-[#0066CC] text-white gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <Trans>Saving...</Trans>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <Trans>Complete Setup</Trans>
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
