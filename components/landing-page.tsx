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
import { useLocale } from "@/lib/hooks/useLocale";
import { Trans } from "@lingui/react/macro";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const locale = useLocale();

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
      tech: ["React", "Node.js", "TypeScript"],
    },
    {
      name: "UX/UI Design",
      students: "180+ students",
      duration: "10 weeks",
      level: "Intermediate",
      tech: ["Figma", "Adobe XD", "Prototyping"],
    },
    {
      name: "DevOps Engineering",
      students: "120+ students",
      duration: "14 weeks",
      level: "Advanced",
      tech: ["Docker", "Kubernetes", "AWS"],
    },
    {
      name: "Mobile Development",
      students: "150+ students",
      duration: "11 weeks",
      level: "Intermediate",
      tech: ["React Native", "Flutter", "iOS/Android"],
    },
  ];

  const technologies = [
    { name: "React", color: "from-cyan-500 to-blue-500" },
    { name: "Node.js", color: "from-green-500 to-emerald-600" },
    { name: "TypeScript", color: "from-blue-600 to-indigo-600" },
    { name: "Docker", color: "from-blue-500 to-cyan-500" },
    { name: "AWS", color: "from-orange-500 to-yellow-500" },
    { name: "Kubernetes", color: "from-blue-600 to-purple-600" },
    { name: "Python", color: "from-yellow-500 to-blue-500" },
    { name: "PostgreSQL", color: "from-blue-700 to-indigo-700" },
  ];

  const instructorHighlights = [
    {
      title: "Industry Experts",
      description: "Learn from professionals with 10+ years of experience",
      icon: Award,
    },
    {
      title: "Real-World Projects",
      description: "Build portfolio-worthy projects with mentor guidance",
      icon: Zap,
    },
    {
      title: "Career Support",
      description: "Get job-ready with interview prep and career coaching",
      icon: TrendingUp,
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
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-[#17224D]">
                CUBIS Academy
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSwitcher />
              <Link
                href={`/${locale}/login`}
                className="hidden sm:inline-block px-3 sm:px-5 py-2 sm:py-2.5 text-[#363942] hover:text-[#007FFF] transition-colors font-semibold text-sm sm:text-base"
              >
                <Trans>Login</Trans>
              </Link>
              <Link
                href={`/${locale}/register`}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-lg sm:rounded-xl hover:shadow-xl hover:shadow-[#007FFF]/20 transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                <span className="hidden sm:inline">
                  <Trans>Get Started Free</Trans>
                </span>
                <span className="sm:hidden">
                  <Trans>Sign Up</Trans>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity }}
        className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#007FFF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#17224D]/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#E5F2FF] border border-[#007FFF]/20 rounded-full mb-6 sm:mb-8"
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#007FFF]" />
                <span className="text-xs sm:text-sm font-semibold text-[#007FFF]">
                  Transform Your Career Today
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#17224D] mb-4 sm:mb-6 leading-tight"
              >
                Learn Skills That <span className="text-[#007FFF]">Matter</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base sm:text-lg md:text-xl text-[#363942]/80 mb-6 sm:mb-8 leading-relaxed"
              >
                Master cutting-edge technology skills with industry-leading
                instructors. From Web Development to DevOps, accelerate your
                career with hands-on learning, real-world projects, and
                professional mentorship.
              </motion.p>

              {/* Technology Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="flex flex-wrap gap-1.5 sm:gap-2 mb-8 sm:mb-10"
              >
                <span className="text-xs sm:text-sm text-[#363942]/60 font-medium w-full sm:w-auto mb-1 sm:mb-0">
                  Technologies:
                </span>
                {technologies.slice(0, 6).map((tech, index) => (
                  <motion.span
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    className={`px-2.5 sm:px-3 py-1 bg-gradient-to-r ${tech.color} text-white text-xs font-semibold rounded-full shadow-sm`}
                  >
                    {tech.name}
                  </motion.span>
                ))}
                <span className="px-2.5 sm:px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                  +10 more
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12"
              >
                <Link
                  href={`/${locale}/register`}
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-lg sm:rounded-xl hover:shadow-2xl hover:shadow-[#007FFF]/30 transition-all duration-300 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Trans>Start Learning Free</Trans>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#courses"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#363942] rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-[#007FFF] transition-all duration-300 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <Trans>Watch Demo</Trans>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="text-center"
                  >
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#007FFF] mx-auto mb-1.5 sm:mb-2" />
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#17224D]">
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
                            <h3 className="text-base font-bold text-white mb-2">
                              {course.name}
                            </h3>
                            <div className="space-y-1.5 mb-3">
                              <div className="flex items-center gap-1.5 text-white/90 text-xs">
                                <Users className="w-3 h-3" />
                                <span>{course.students}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-white/90 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-white/90 text-xs">
                                <Globe className="w-3 h-3" />
                                <span>{course.level}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {course.tech.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          <Link
                            href="#courses"
                            className="w-full px-4 py-2 bg-white text-[#17224D] rounded-lg font-semibold text-xs hover:bg-gray-50 transition-colors text-center"
                          >
                            <Trans>View Details</Trans>
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
      <section
        id="features"
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#E5F2FF] border border-[#007FFF]/20 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              <span className="text-[#007FFF]">
                <Trans>Why Choose Us</Trans>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#17224D] mb-4 sm:mb-6 px-4">
              <Trans>Everything You Need to Succeed</Trans>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#363942]/70 max-w-2xl mx-auto px-4">
              <Trans>
                Comprehensive learning experience designed for your success
              </Trans>
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
                  className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all duration-300 hover:shadow-xl h-full"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#17224D] mb-2 sm:mb-3">
                    <Trans>{feature.title}</Trans>
                  </h3>
                  <p className="text-sm sm:text-base text-[#363942]/70 leading-relaxed">
                    <Trans>{feature.description}</Trans>
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Instructors Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#E5F2FF] border border-[#007FFF]/20 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              <span className="text-[#007FFF]">
                <Trans>Learn from the Best</Trans>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#17224D] mb-4 sm:mb-6 px-4">
              <Trans>Trained by Industry Professionals</Trans>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#363942]/70 max-w-3xl mx-auto px-4">
              <Trans>
                Our instructors bring real-world experience from leading tech
                companies, ensuring you learn practical skills that matter in
                today's job market
              </Trans>
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {instructorHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
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
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-[#007FFF]/30 transition-all duration-300 shadow-lg hover:shadow-xl h-full"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                    <highlight.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#17224D] mb-3 sm:mb-4">
                    <Trans>{highlight.title}</Trans>
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-[#363942]/70 leading-relaxed">
                    <Trans>{highlight.description}</Trans>
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Technology Stack Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl border border-gray-100"
          >
            <div className="text-center mb-8 sm:mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#17224D] mb-3 sm:mb-4 px-4">
                <Trans>Master Modern Technologies</Trans>
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-[#363942]/70 max-w-2xl mx-auto px-4">
                <Trans>
                  Learn the latest tools and frameworks used by top tech
                  companies worldwide
                </Trans>
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
              {technologies.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r ${tech.color} text-white font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer text-sm sm:text-base`}
                >
                  {tech.name}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10 md:mt-12 text-center">
              <Link
                href={`/${locale}/register`}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-lg sm:rounded-xl hover:shadow-xl hover:shadow-[#007FFF]/30 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg"
              >
                <Trans>Explore All Courses</Trans>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Side - Content */}
              <div className="p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E5F2FF] border border-[#007FFF]/20 rounded-full text-xs font-semibold mb-6 w-fit">
                  <Zap className="w-3.5 h-3.5 text-[#007FFF]" />
                  <span className="text-[#007FFF]">
                    <Trans>Start Your Journey</Trans>
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#17224D] mb-4 leading-tight">
                  <Trans>Ready to Level Up Your Skills?</Trans>
                </h2>

                <p className="text-base sm:text-lg text-[#363942]/70 mb-8 leading-relaxed">
                  <Trans>
                    Join 500+ students already learning with CUBIS Academy. Get
                    instant access to expert-led courses, real-world projects,
                    and career support.
                  </Trans>
                </p>

                {/* Benefits List */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-[#363942]">
                      <Trans>
                        Free account setup - no credit card required
                      </Trans>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-[#363942]">
                      <Trans>Access to 50+ expert-led courses</Trans>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-[#363942]">
                      <Trans>Learn at your own pace, anytime</Trans>
                    </span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/${locale}/register`}
                    className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#007FFF] to-[#17224D] text-white rounded-xl hover:shadow-xl hover:shadow-[#007FFF]/30 transition-all duration-300 font-semibold text-base flex items-center justify-center gap-2"
                  >
                    <Trans>Get Started Free</Trans>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={`/${locale}/login`}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#363942] border-2 border-gray-200 rounded-xl hover:border-[#007FFF] hover:text-[#007FFF] transition-all duration-300 font-semibold text-base flex items-center justify-center"
                  >
                    <Trans>Sign In</Trans>
                  </Link>
                </div>

                {/* Trust Badge */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-[#363942]/60">
                    <Users className="w-4 h-4" />
                    <span>
                      <Trans>Trusted by 500+ students worldwide</Trans>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Visual */}
              <div className="relative bg-gradient-to-br from-[#007FFF] to-[#17224D] p-8 sm:p-10 md:p-12 lg:p-14 flex items-center justify-center min-h-[400px] lg:min-h-0">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#007FFF]/20 rounded-full blur-3xl" />

                {/* Stats Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-6 w-full max-w-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      500+
                    </div>
                    <div className="text-sm text-white/80">
                      <Trans>Students</Trans>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      50+
                    </div>
                    <div className="text-sm text-white/80">
                      <Trans>Courses</Trans>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      20+
                    </div>
                    <div className="text-sm text-white/80">
                      <Trans>Instructors</Trans>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      95%
                    </div>
                    <div className="text-sm text-white/80">
                      <Trans>Success Rate</Trans>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#17224D] text-gray-300 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#007FFF] to-[#17224D] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">
                CUBIS Academy
              </span>
            </div>

            <p className="text-[#99CCFF] mb-6 sm:mb-8 text-base sm:text-lg px-4">
              <Trans>
                Empowering learners with professional skills for the digital age
              </Trans>
            </p>

            <div className="border-t border-white/10 pt-6 sm:pt-8">
              <p className="text-xs sm:text-sm text-[#99CCFF]/70">
                © 2025 CUBIS Academy. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
