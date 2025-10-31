import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/drizzle/db';
import { courses, enrollments, users, students, scores } from '@/lib/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TeacherNav } from '@/components/teacher/TeacherNav';
import { ScoreManager } from '@/components/teacher/ScoreManager';
import { Trans } from '@lingui/react/macro';
import { ArrowLeft, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { setI18n } from '@lingui/react/server';
import { loadCatalog, i18n } from '@/lib/i18n';

export default async function CourseScoresPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await loadCatalog(locale);
  setI18n(i18n);

  const session = await auth();

  if (!session?.user || session.user.role !== 'teacher') {
    redirect(`/${locale}/login`);
  }

  // Verify course ownership
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, id), eq(courses.teacherId, session.user.id)));

  if (!course) {
    notFound();
  }

  // Get enrolled students with their scores
  const enrolledStudents = await db
    .select({
      enrollmentId: enrollments.id,
      studentId: students.userId,
      studentName: users.name,
      studentEmail: users.email,
      progress: enrollments.progress,
      status: enrollments.status,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(enrollments.courseId, id))
    .orderBy(users.name);

  // Get all scores for this course
  const courseScores = await db
    .select({
      id: scores.id,
      enrollmentId: scores.enrollmentId,
      title: scores.title,
      score: scores.score,
      maxScore: scores.maxScore,
      remarks: scores.remarks,
      created: scores.created,
    })
    .from(scores)
    .innerJoin(enrollments, eq(scores.enrollmentId, enrollments.id))
    .where(eq(enrollments.courseId, id))
    .orderBy(desc(scores.created));

  // Group scores by enrollment
  type ScoreRecord = typeof courseScores[number];
  const scoresByEnrollment = new Map<string, ScoreRecord[]>();
  courseScores.forEach((score) => {
    if (!scoresByEnrollment.has(score.enrollmentId)) {
      scoresByEnrollment.set(score.enrollmentId, []);
    }
    scoresByEnrollment.get(score.enrollmentId)!.push(score);
  });

  // Calculate average scores
  const studentsWithScores = enrolledStudents.map((student) => {
    const studentScores = scoresByEnrollment.get(student.enrollmentId) || [];
    
    // Convert score and maxScore from string to number for the component
    const scoresWithNumbers = studentScores.map(score => ({
      ...score,
      score: Number(score.score),
      maxScore: Number(score.maxScore),
    }));
    
    const avgScore = scoresWithNumbers.length > 0
      ? Math.round(
          scoresWithNumbers.reduce((sum: number, s) => sum + (s.score / s.maxScore) * 100, 0) /
            scoresWithNumbers.length
        )
      : null;

    return {
      ...student,
      scores: scoresWithNumbers,
      avgScore,
    };
  });

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <TeacherNav locale={locale} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={`/${locale}/teacher/courses/${id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Trans>Back to Course</Trans>
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#17224D]">
                <Trans>Grade Management</Trans>
              </h1>
              <p className="text-[#363942]/70">{course.title}</p>
            </div>
          </div>
          <p className="text-[#363942]/70">
            <Trans>Add and manage student scores for assessments and assignments</Trans>
          </p>
        </div>

        {/* Score Manager */}
        <ScoreManager
          students={studentsWithScores}
          courseId={id}
          locale={locale}
        />
      </div>
    </div>
  );
}
