'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { registerSchema } from '@/lib/validations/auth';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { BookOpen, Mail, Phone, Lock, User, CalendarIcon, MapPin, AlertCircle, CheckCircle2, ArrowRight, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dob: '',
      gender: '',
      address: '',
    },
    onSubmit: async ({ value }) => {
      // Validate with Zod
      const result = registerSchema.safeParse(value);
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }

      setError('');

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Registration failed');
          return;
        }

        // Auto sign in after registration
        await signIn('credentials', {
          email: value.email,
          password: value.password,
          redirect: false,
        });

        router.push('/student');
        router.refresh();
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    },
  });

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/student' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#007FFF] via-[#17224D] to-[#363942] p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#007FFF]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CUBIS Academy</span>
          </div>
          
          <div className="mt-16">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Start Your<br />Learning Journey
            </h1>
            <p className="text-xl text-[#E5F2FF] leading-relaxed mb-8">
              Join thousands of students mastering technology skills with expert-led courses.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Expert-Led Courses</div>
                  <div className="text-[#99CCFF] text-sm">Learn from industry professionals</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Flexible Learning</div>
                  <div className="text-[#99CCFF] text-sm">Study at your own pace</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">Recognized Certificates</div>
                  <div className="text-[#99CCFF] text-sm">Boost your career prospects</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[#99CCFF] text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-white font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[#F4F5F7] overflow-y-auto">
        <div className="w-full max-w-2xl py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#17224D]">
              CUBIS Academy
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#007FFF]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= 1 ? 'bg-[#007FFF] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Basic Info</span>
                </div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#007FFF]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= 2 ? 'bg-[#007FFF] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Additional Details</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#007FFF] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 2) * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#17224D] mb-2">Create Account</h2>
              <p className="text-[#363942]/70">
                {step === 1 ? 'Fill in your basic information to get started' : 'Complete your profile (optional)'}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (step === 1) {
                  setStep(2);
                } else {
                  form.handleSubmit();
                }
              }}
              className="space-y-5"
            >
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  {/* Name Field */}
                  <form.Field
                    name="name"
                    validators={{
                      onBlur: ({ value }) => {
                        const result = z.string().min(2, 'Name must be at least 2 characters').safeParse(value);
                        return result.success ? undefined : result.error.issues[0].message;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                          <Input
                            id={field.name}
                            type="text"
                            placeholder="John Doe"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Email Field */}
                  <form.Field
                    name="email"
                    validators={{
                      onBlur: ({ value }) => {
                        const result = z.string().email('Invalid email address').safeParse(value);
                        return result.success ? undefined : result.error.issues[0].message;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                          Email Address <span className="text-red-500">*</span>
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
                            className={`pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Phone Field */}
                  <form.Field
                    name="phone"
                    validators={{
                      onBlur: ({ value }) => {
                        const result = z.string().min(10, 'Phone number must be at least 10 digits').safeParse(value);
                        return result.success ? undefined : result.error.issues[0].message;
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                          <Input
                            id={field.name}
                            type="tel"
                            placeholder="+1234567890"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={`pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <form.Field
                      name="password"
                      validators={{
                        onBlur: ({ value }) => {
                          const result = z.string().min(8, 'Password must be at least 8 characters').safeParse(value);
                          return result.success ? undefined : result.error.issues[0].message;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                            Password <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                            <Input
                              id={field.name}
                              type="password"
                              placeholder="••••••••"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className={`pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                            />
                          </div>
                          {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field
                      name="confirmPassword"
                      validators={{
                        onChangeListenTo: ['password'],
                        onChange: ({ value, fieldApi }) => {
                          const password = fieldApi.form.getFieldValue('password');
                          if (value !== password) {
                            return "Passwords don't match";
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                            Confirm Password <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#363942]/40" />
                            <Input
                              id={field.name}
                              type="password"
                              placeholder="••••••••"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className={`pl-10 h-12 border-gray-200 hover:border-[#007FFF]/30 focus-visible:ring-[#007FFF] transition-colors ${field.state.meta.errors.length > 0 ? 'border-red-500' : ''}`}
                            />
                          </div>
                          {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-[#E5F2FF] rounded-lg border border-[#007FFF]/20">
                    <Lock className="w-4 h-4 text-[#007FFF] flex-shrink-0" />
                    <p className="text-xs text-[#17224D]">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-[#E5F2FF] border border-[#007FFF]/20 rounded-xl p-4">
                    <p className="text-sm text-[#17224D] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#007FFF]" />
                      These details are optional but help us personalize your experience
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Date of Birth with Date Picker */}
                    <form.Field name="dob">
                      {(field) => (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-[#17224D]">
                            Date of Birth
                          </Label>
                          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full h-12 justify-start text-left font-normal border-gray-200 hover:bg-[#F4F5F7] hover:border-[#007FFF]/30 ${
                                  !field.state.value && 'text-[#363942]/50'
                                }`}
                              >
                                <CalendarIcon className="mr-2 h-5 w-5 text-[#363942]/40" />
                                {field.state.value ? (
                                  format(new Date(field.state.value), 'PPP')
                                ) : (
                                  <span>Select date</span>
                                )}
                                <ChevronDown className="ml-auto h-4 w-4 text-[#363942]/40" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.state.value ? new Date(field.state.value) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    field.handleChange(format(date, 'yyyy-MM-dd'));
                                    setDatePickerOpen(false);
                                  }
                                }}
                                captionLayout="dropdown"
                                fromYear={1950}
                                toYear={new Date().getFullYear()}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </form.Field>

                    {/* Gender */}
                    <form.Field name="gender">
                      {(field) => (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-[#17224D]">
                            Gender
                          </Label>
                          <Select
                            value={field.state.value}
                            onValueChange={field.handleChange}
                          >
                            <SelectTrigger className="w-full !h-12 border-gray-200 hover:border-[#007FFF]/30 focus:ring-[#007FFF] transition-colors">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </form.Field>
                  </div>

                  {/* Address */}
                  <form.Field name="address">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name} className="text-sm font-semibold text-[#17224D]">
                          Address
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
                      </div>
                    )}
                  </form.Field>

                  <div className="flex items-center gap-2 p-3 bg-[#F4F5F7] rounded-lg">
                    <div className="w-8 h-8 bg-[#007FFF]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-[#007FFF]" />
                    </div>
                    <p className="text-xs text-[#363942]/70">
                      You can skip these fields and complete your profile later from your account settings
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 text-base font-medium border-gray-300 hover:bg-[#F4F5F7] text-[#363942]"
                  >
                    Back
                  </Button>
                )}
                
                {step === 1 ? (
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-base font-semibold bg-[#007FFF] hover:bg-[#007FFF]/90 text-white shadow-lg shadow-[#007FFF]/20"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                  >
                    {([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="flex-1 h-12 text-base font-semibold bg-[#007FFF] hover:bg-[#007FFF]/90 text-white shadow-lg shadow-[#007FFF]/20"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating account...
                          </span>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    )}
                  </form.Subscribe>
                )}
              </div>

              {step === 1 && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-[#363942]/60 font-medium">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full h-12 text-base font-medium border-gray-300 hover:bg-[#F4F5F7] text-[#363942]"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>
                </>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[#363942]/70">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#007FFF] hover:text-[#007FFF]/80">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[#363942]/50 mt-6">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[#363942]/70 hover:text-[#363942] underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#363942]/70 hover:text-[#363942] underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
