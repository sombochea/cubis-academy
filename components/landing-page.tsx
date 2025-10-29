'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, Users, Award, Zap, ArrowRight, CheckCircle, Star } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with real-world experience',
    },
    {
      icon: Users,
      title: 'Interactive Learning',
      description: 'Engage with teachers and peers in live sessions',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn recognized certificates upon course completion',
    },
    {
      icon: Zap,
      title: 'Fast-Track Skills',
      description: 'Short-term courses designed for quick skill acquisition',
    },
  ];

  const stats = [
    { value: '500+', label: 'Students' },
    { value: '50+', label: 'Courses' },
    { value: '20+', label: 'Expert Teachers' },
    { value: '95%', label: 'Success Rate' },
  ];

  const courses = [
    { name: 'Web Development', color: 'from-blue-500 to-cyan-500' },
    { name: 'UX/UI Design', color: 'from-purple-500 to-pink-500' },
    { name: 'DevOps', color: 'from-orange-500 to-red-500' },
    { name: 'Programming', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CUBIS Academy
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4"
            >
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6"
                >
                  🚀 Transform Your Career
                </motion.span>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Learn Skills That{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Matter
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Master technology skills with expert-led courses. From Web Development to DevOps,
                  accelerate your career with hands-on learning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                  >
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 font-semibold flex items-center justify-center"
                  >
                    Browse Courses
                  </Link>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-4 gap-4 mt-12"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Animated Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[500px]">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.name}
                    initial={{ opacity: 0, y: 50, rotate: -5 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotate: 0,
                    }}
                    transition={{
                      delay: 0.6 + index * 0.1,
                      duration: 0.6,
                    }}
                    whileHover={{
                      scale: 1.05,
                      rotate: 2,
                      zIndex: 10,
                    }}
                    className="absolute w-72 h-40 rounded-2xl shadow-xl cursor-pointer"
                    style={{
                      top: `${index * 80}px`,
                      left: `${index * 20}px`,
                      background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    }}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${course.color} rounded-2xl p-6 flex flex-col justify-between`}>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-white fill-white" />
                        <span className="text-white text-sm font-semibold">Featured</span>
                      </div>
                      <div>
                        <h3 className="text-white text-2xl font-bold">{course.name}</h3>
                        <p className="text-white/80 text-sm mt-1">Professional Course</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CUBIS Academy?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to succeed in your learning journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of students learning with CUBIS Academy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CUBIS Academy</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering learners with professional skills for the digital age
          </p>
          <p className="text-sm text-gray-500">
            © 2025 CUBIS Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
