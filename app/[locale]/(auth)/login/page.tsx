"use client";

import { useForm } from "@tanstack/react-form";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BookOpen, Mail, Lock, AlertCircle } from "lucide-react";
import { LoadingRedirect } from "@/components/LoadingRedirect";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Get callback URL from query params
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError("");

      const result = loginSchema.safeParse(value);
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }

      try {
        const signInResult = await signIn("credentials", {
          email: value.email,
          password: value.password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("Invalid email or password");
        } else {
          // Show loading state before redirect
          setIsRedirecting(true);
          
          // Small delay to show loading animation
          setTimeout(() => {
            router.push(callbackUrl);
            router.refresh();
          }, 1500);
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      }
    },
  });

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    signIn("google", { callbackUrl });
  };

  // Show loading screen when redirecting
  if (isRedirecting) {
    return <LoadingRedirect />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#007FFF] via-[#17224D] to-[#363942] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#007FFF]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href={"/"}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                CUBIS Academy
              </span>
            </div>
          </Link>

          <div className="mt-16">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome Back to
              <br />
              Your Learning Journey
            </h1>
            <p className="text-xl text-[#E5F2FF] leading-relaxed">
              Access your courses, track your progress, and continue building
              the skills that matter.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-8 text-white">
            <div>
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-[#99CCFF] text-sm">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-[#99CCFF] text-sm">Expert Courses</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">95%</div>
              <div className="text-[#99CCFF] text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[#F4F5F7]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href={"/"}>
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#17224D]">
                CUBIS Academy
              </span>
            </div>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#17224D] mb-2">
                Sign In
              </h2>
              <p className="text-[#363942]/70">
                Enter your credentials to access your account
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-5"
            >
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form.Field
                name="email"
                validators={{
                  onBlur: ({ value }) => {
                    const result = z
                      .string()
                      .email("Invalid email address")
                      .safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0].message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-[#17224D]"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="you@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`pl-10 h-12 border-gray-200 focus-visible:ring-[#007FFF] ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onBlur: ({ value }) => {
                    const result = z
                      .string()
                      .min(6, "Password must be at least 6 characters")
                      .safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0].message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-semibold text-[#17224D]"
                      >
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-[#007FFF] hover:text-[#007FFF]/80 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="••••••••"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={`pl-10 h-12 border-gray-200 focus-visible:ring-[#007FFF] ${
                          field.state.meta.errors.length > 0
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full h-12 text-base font-semibold bg-[#007FFF] hover:bg-[#007FFF]/90 text-white shadow-lg shadow-[#007FFF]/20"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                )}
              </form.Subscribe>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#363942]/60 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full h-12 text-base font-medium border-gray-300 hover:bg-[#F4F5F7] text-[#363942]"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[#363942]/70">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#007FFF] hover:text-[#007FFF]/80"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[#363942]/50 mt-8">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-[#363942]/70 hover:text-[#363942] underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#363942]/70 hover:text-[#363942] underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
