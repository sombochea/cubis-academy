import { db } from './db';
import { users, students, teachers, courses, enrollments, payments, scores, attendances } from './schema';
import { eq, and, desc } from 'drizzle-orm';

// User queries
export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      student: true,
      teacher: true,
    },
  });
}

// Student queries
export async function getStudentBySuid(suid: string) {
  return db.query.students.findFirst({
    where: eq(students.suid, suid),
    with: {
      user: true,
    },
  });
}

export async function getStudentEnrollments(studentId: string) {
  return db.query.enrollments.findMany({
    where: eq(enrollments.studentId, studentId),
    with: {
      course: {
        with: {
          teacher: {
            with: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: [desc(enrollments.enrolled)],
  });
}

export async function getStudentPayments(studentId: string) {
  return db.query.payments.findMany({
    where: eq(payments.studentId, studentId),
    with: {
      course: true,
    },
    orderBy: [desc(payments.created)],
  });
}

// Course queries
export async function getAllCourses() {
  return db.query.courses.findMany({
    where: eq(courses.isActive, true),
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
    orderBy: [desc(courses.created)],
  });
}

export async function getCourseById(id: string) {
  return db.query.courses.findFirst({
    where: eq(courses.id, id),
    with: {
      teacher: {
        with: {
          user: true,
        },
      },
    },
  });
}

export async function getTeacherCourses(teacherId: string) {
  return db.query.courses.findMany({
    where: eq(courses.teacherId, teacherId),
    orderBy: [desc(courses.created)],
  });
}

// Enrollment queries
export async function getEnrollmentScores(enrollmentId: string) {
  return db.query.scores.findMany({
    where: eq(scores.enrollmentId, enrollmentId),
    orderBy: [desc(scores.created)],
  });
}

export async function getEnrollmentAttendances(enrollmentId: string) {
  return db.query.attendances.findMany({
    where: eq(attendances.enrollmentId, enrollmentId),
    orderBy: [desc(attendances.date)],
  });
}

// Generate SUID
export async function generateSuid(): Promise<string> {
  const year = new Date().getFullYear();
  const lastStudent = await db.query.students.findFirst({
    orderBy: [desc(students.enrolled)],
  });
  
  let sequence = 1;
  if (lastStudent?.suid) {
    const lastSequence = parseInt(lastStudent.suid.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `STU-${year}-${sequence.toString().padStart(6, '0')}`;
}
