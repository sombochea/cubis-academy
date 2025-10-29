"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  BookOpen,
  Users,
  Award,
  Zap,
  ArrowRight,
  Star,
  Play,
  TrendingUp,
  Clock,
  Globe,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const features = [
    {
      icon: BookOpen,
      title: "Expert-Led Courses",
      description:
        "Learn from industry professionals with real-world experience",
    },
    {
      icon: Users,
      title: "Interactive Learning",
      description: "Engage with teachers and peers in live sessions",
    },
    {
      icon: Award,
      title: "Recognized Certificates",
      description: "Earn certificates that boost your career prospects",
    },
    {
      icon: Zap,
      title: "Fast-Track Skills",
      description: "Short-term courses designed for quick skill acquisition",
    },
  ];

  const stats = [
    { value: "500+", label: "Active Students", icon: Users },
    { value: "50+", label: "Expert Courses", icon: BookOpen },
    { value: "20+", label: "Expert Teachers", icon: Award },
    { value: "95%", label: "Success Rate", icon: TrendingUp },
  ];

  const courses = [
    {
      name: "Web Development",
      students: "250+ students",
      duration: "12 weeks",
      level: "Beginner to Advanced",
    },
    {
      name: "UX/UI Design",
      students: "180+ students",
      duration: "10 weeks",
      level: "Intermediate",
    },
    {
      name: "DevOps Engineering",
      students: "120+ students",
      duration: "14 weeks",
      level: "Advanced",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#17224D]">
                CUBIS Academy
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-5 py-2.5 text-[#363942] hover:text-[#007FFF] transition-colors font-semibold"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-xl hover:shadow-[#007FFF]/20 transition-all duration-300 font-semibold"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity }}
        className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#007FFF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#17224D]/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5F2FF] border border-[#007FFF]/20 rounded-full mb-8"
              >
                <Zap className="w-4 h-4 text-[#007FFF]" />
                <span className="text-sm font-semibold text-[#007FFF]">
                  Transform Your Career Today
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold text-[#17224D] mb-6 leading-tight"
              >
                Learn Skills That <span className="text-[#007FFF]">Matter</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-[#363942]/80 mb-10 leading-relaxed"
              >
                Master technology skills with expert-led courses. From Web
                Development to DevOps, accelerate your career with hands-on
                learning and real-world projects.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-2xl hover:shadow-[#007FFF]/30 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#courses"
                  className="group px-8 py-4 bg-white text-[#363942] rounded-xl border-2 border-gray-200 hover:border-[#007FFF] transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="text-center"
                  >
                    <stat.icon className="w-6 h-6 text-[#007FFF] mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-bold text-[#17224D]">
                      {stat.value}
                    </div>
                    <div className="text-xs text-[#363942]/70 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right - Interactive Course Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + index * 0.1,
                      ease: "easeOut",
                    }}
                    onHoverStart={() => setHoveredCard(index)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="relative h-48"
                    style={{ perspective: "1000px" }}
                  >
                    <motion.div
                      animate={{
                        rotateY: hoveredCard === index ? 180 : 0,
                      }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="relative w-full h-full"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Front Side */}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-[#007FFF] to-[#0066CC] rounded-xl p-5 shadow-lg"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                              <Star className="w-3 h-3 text-white fill-white" />
                              <span className="text-white text-xs font-semibold">
                                Featured
                              </span>
                            </div>
                            <BookOpen className="w-5 h-5 text-white/70" />
                          </div>

                          <h3 className="text-xl font-bold text-white mb-auto">
                            {course.name}
                          </h3>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-white/90 text-xs">
                              <Users className="w-3.5 h-3.5" />
                              <span>{course.students.split(" ")[0]}</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                            >
                              <ArrowRight className="w-4 h-4 text-[#007FFF]" />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-[#17224D] to-[#363942] rounded-xl p-5 shadow-lg"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">
                              {course.name}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white/90 text-xs">
                                <Users className="w-3.5 h-3.5" />
                                <span>{course.students}</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/90 text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-2 text-white/90 text-xs">
                                <Globe className="w-3.5 h-3.5" />
                                <span>{course.level}</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            href="#courses"
                            className="w-full px-4 py-2.5 bg-white text-[#17224D] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors text-center"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block px-4 py-2 bg-[#E5F2FF] border border-[#007FFF]/20 rounded-full text-sm font-semibold mb-6">
              <span className="text-[#007FFF]">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#17224D] mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-[#363942]/70 max-w-2xl mx-auto">
              Comprehensive learning experience designed for your success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all duration-300 hover:shadow-xl h-full"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center mb-6 shadow-lg">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#17224D] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#363942]/70 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#007FFF] via-[#17224D] to-[#363942] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl"
          >
            {/* Subtle Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#007FFF]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Career?
              </h2>

              <p className="text-xl text-[#E5F2FF] mb-10 max-w-2xl mx-auto">
                Join thousands of students mastering technology skills with
                CUBIS Academy. Start your journey today!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-10 py-4 bg-white text-[#007FFF] rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white hover:text-[#007FFF] transition-all duration-300 font-bold text-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#17224D] text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                CUBIS Academy
              </span>
            </div>

            <p className="text-[#99CCFF] mb-8 text-lg">
              Empowering learners with professional skills for the digital age
            </p>

            <div className="border-t border-white/10 pt-8">
              <p className="text-sm text-[#99CCFF]/70">
                © 2025 CUBIS Academy. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
