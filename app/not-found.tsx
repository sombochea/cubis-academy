'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] via-white to-[#F4F5F7] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-[#007FFF]/20 to-[#17224D]/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <div className="relative">
            <h1 className="text-[150px] md:text-[200px] font-bold bg-gradient-to-br from-[#007FFF] to-[#17224D] bg-clip-text text-transparent leading-none">
              404
            </h1>
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
            <Search className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#17224D] mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-[#363942]/70 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
              <Home className="w-5 h-5" />
              Go Home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
          <h3 className="text-sm font-semibold text-[#17224D] mb-4 uppercase tracking-wide">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/en/student/courses"
              className="flex items-center gap-3 p-4 bg-[#F4F5F7] rounded-xl hover:bg-gray-200 transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#17224D]">Courses</p>
                <p className="text-xs text-[#363942]/70">Browse courses</p>
              </div>
            </Link>

            <Link
              href="/en/student"
              className="flex items-center gap-3 p-4 bg-[#F4F5F7] rounded-xl hover:bg-gray-200 transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#17224D]">Dashboard</p>
                <p className="text-xs text-[#363942]/70">Student portal</p>
              </div>
            </Link>

            <Link
              href="/en/login"
              className="flex items-center gap-3 p-4 bg-[#F4F5F7] rounded-xl hover:bg-gray-200 transition-colors group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowLeft className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#17224D]">Login</p>
                <p className="text-xs text-[#363942]/70">Sign in</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-[#363942]/50 mt-8">
          Error Code: 404 • CUBIS Academy
        </p>
      </div>
    </div>
  );
}
