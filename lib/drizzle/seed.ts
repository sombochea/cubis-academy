import "dotenv/config";

import { db } from "./db";
import {
  users,
  students,
  teachers,
  courseCategories,
  courses,
  enrollments,
  payments,
  scores,
  attendances,
} from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateSuid } from "./queries";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Hash password (123456 for all users)
    const password = await bcrypt.hash("123456", 10);

    // Create Admin User
    console.log("Creating admin user...");
    await db
      .insert(users)
      .values({
        name: "Admin User",
        email: "admin@cubisacademy.com",
        phone: "012345678",
        role: "admin",
        passHash: password,
        isActive: true,
      })
      .returning();

    // Create Teachers
    console.log("Creating teachers...");
    const teacherData = [
      {
        name: "John Smith",
        email: "john@cubisacademy.com",
        phone: "+1234567891",
        spec: "Web Development",
        bio: "Full-stack developer with 10+ years experience",
      },
      {
        name: "Sarah Johnson",
        email: "sarah@cubisacademy.com",
        phone: "+1234567892",
        spec: "UX/UI Design",
        bio: "Award-winning designer specializing in user experience",
      },
      {
        name: "Michael Chen",
        email: "michael@cubisacademy.com",
        phone: "+1234567893",
        spec: "DevOps",
        bio: "Cloud infrastructure expert and DevOps consultant",
      },
      {
        name: "Emily Davis",
        email: "emily@cubisacademy.com",
        phone: "+1234567894",
        spec: "Programming",
        bio: "Computer science educator and software architect",
      },
    ];

    const teacherUsers = [];
    for (let i = 0; i < teacherData.length; i++) {
      const [user] = await db
        .insert(users)
        .values({
          name: teacherData[i].name,
          email: teacherData[i].email,
          phone: teacherData[i].phone,
          role: "teacher",
          passHash: password,
          isActive: true,
        })
        .returning();

      await db.insert(teachers).values({
        userId: user.id,
        bio: teacherData[i].bio,
        spec: teacherData[i].spec,
      });

      teacherUsers.push(user);
    }

    // Create Students
    console.log("Creating students...");
    const studentData = [
      {
        name: "Alice Williams",
        email: "alice@example.com",
        phone: "+1234567895",
        dob: "2000-05-15",
        gender: "female",
        address: "123 Main St, New York, NY",
      },
      {
        name: "Bob Martinez",
        email: "bob@example.com",
        phone: "+1234567896",
        dob: "1998-08-22",
        gender: "male",
        address: "456 Oak Ave, Los Angeles, CA",
      },
      {
        name: "Carol Brown",
        email: "carol@example.com",
        phone: "+1234567897",
        dob: "2001-03-10",
        gender: "female",
        address: "789 Pine Rd, Chicago, IL",
      },
      {
        name: "David Lee",
        email: "david@example.com",
        phone: "+1234567898",
        dob: "1999-11-30",
        gender: "male",
        address: "321 Elm St, Houston, TX",
      },
      {
        name: "Eva Garcia",
        email: "eva@example.com",
        phone: "+1234567899",
        dob: "2002-01-18",
        gender: "female",
        address: "654 Maple Dr, Phoenix, AZ",
      },
      {
        name: "Frank Wilson",
        email: "frank@example.com",
        phone: "+1234567800",
        dob: "1997-07-25",
        gender: "male",
        address: "987 Cedar Ln, Philadelphia, PA",
      },
    ];

    const studentUsers = [];
    for (let i = 0; i < studentData.length; i++) {
      const [user] = await db
        .insert(users)
        .values({
          name: studentData[i].name,
          email: studentData[i].email,
          phone: studentData[i].phone,
          role: "student",
          passHash: password,
          isActive: true,
        })
        .returning();

      const suid = await generateSuid();
      await db.insert(students).values({
        userId: user.id,
        suid,
        dob: studentData[i].dob,
        gender: studentData[i].gender,
        address: studentData[i].address,
      });

      studentUsers.push(user);
    }

    // Create Course Categories
    console.log("Creating course categories...");
    const categoryData = [
      {
        name: "Web Development",
        slug: "web-development",
        description: "Learn to build modern web applications",
        icon: "Code",
        color: "#3B82F6",
      },
      {
        name: "UX/UI Design",
        slug: "ux-ui-design",
        description: "Master user experience and interface design",
        icon: "Palette",
        color: "#EC4899",
      },
      {
        name: "DevOps",
        slug: "devops",
        description: "Infrastructure, deployment, and automation",
        icon: "Server",
        color: "#10B981",
      },
      {
        name: "Programming",
        slug: "programming",
        description: "Core programming languages and concepts",
        icon: "Terminal",
        color: "#F59E0B",
      },
      {
        name: "Data Science",
        slug: "data-science",
        description: "Analytics, machine learning, and AI",
        icon: "BarChart",
        color: "#8B5CF6",
      },
      {
        name: "Mobile Development",
        slug: "mobile-development",
        description: "iOS and Android app development",
        icon: "Smartphone",
        color: "#06B6D4",
      },
    ];

    const createdCategories: Array<{ id: string; name: string }> = [];
    for (const category of categoryData) {
      const [created] = await db
        .insert(courseCategories)
        .values(category)
        .returning();
      createdCategories.push(created);
    }

    // Helper to find category by name
    const getCategoryId = (name: string) => {
      const category = createdCategories.find((c) => c.name === name);
      return category?.id || null;
    };

    // Create Courses
    console.log("Creating courses...");
    const courseData = [
      {
        title: "Full-Stack Web Development Bootcamp",
        desc: "Master modern web development with React, Node.js, and PostgreSQL. Build real-world applications from scratch.",
        categoryId: getCategoryId("Web Development"),
        teacherId: teacherUsers[0].id,
        price: "499.99",
        duration: 120,
        level: "intermediate" as const,
        deliveryMode: "hybrid" as const,
        location: "Building A, Room 301",
        youtubeUrl: "https://youtube.com/watch?v=example1",
        zoomUrl: "https://zoom.us/j/example1",
      },
      {
        title: "UX/UI Design Fundamentals",
        desc: "Learn user-centered design principles, wireframing, prototyping, and modern design tools like Figma.",
        categoryId: getCategoryId("UX/UI Design"),
        teacherId: teacherUsers[1].id,
        price: "399.99",
        duration: 80,
        level: "beginner" as const,
        deliveryMode: "online" as const,
        youtubeUrl: "https://youtube.com/watch?v=example2",
        zoomUrl: "https://zoom.us/j/example2",
      },
      {
        title: "DevOps Engineering Masterclass",
        desc: "Master CI/CD, Docker, Kubernetes, AWS, and infrastructure as code. Become a DevOps expert.",
        categoryId: getCategoryId("DevOps"),
        teacherId: teacherUsers[2].id,
        price: "599.99",
        duration: 100,
        level: "advanced" as const,
        deliveryMode: "online" as const,
        youtubeUrl: "https://youtube.com/watch?v=example3",
        zoomUrl: "https://zoom.us/j/example3",
      },
      {
        title: "Python Programming for Beginners",
        desc: "Start your programming journey with Python. Learn syntax, data structures, and build practical projects.",
        categoryId: getCategoryId("Programming"),
        teacherId: teacherUsers[3].id,
        price: "299.99",
        duration: 60,
        level: "beginner" as const,
        deliveryMode: "face_to_face" as const,
        location: "Building B, Computer Lab 1",
        youtubeUrl: "https://youtube.com/watch?v=example4",
        zoomUrl: "https://zoom.us/j/example4",
      },
      {
        title: "Advanced JavaScript & TypeScript",
        desc: "Deep dive into modern JavaScript and TypeScript. Master async programming, design patterns, and more.",
        categoryId: getCategoryId("Programming"),
        teacherId: teacherUsers[3].id,
        price: "449.99",
        duration: 90,
        level: "advanced" as const,
        deliveryMode: "hybrid" as const,
        location: "Building A, Room 205",
        youtubeUrl: "https://youtube.com/watch?v=example5",
        zoomUrl: "https://zoom.us/j/example5",
      },
      {
        title: "Mobile-First Responsive Design",
        desc: "Create beautiful, responsive websites that work perfectly on all devices using modern CSS techniques.",
        categoryId: getCategoryId("UX/UI Design"),
        teacherId: teacherUsers[1].id,
        price: "349.99",
        duration: 70,
        level: "intermediate" as const,
        deliveryMode: "online" as const,
        youtubeUrl: "https://youtube.com/watch?v=example6",
        zoomUrl: "https://zoom.us/j/example6",
      },
    ];

    const createdCourses = [];
    for (const course of courseData) {
      const [created] = await db.insert(courses).values(course).returning();
      createdCourses.push(created);
    }

    // Create Enrollments
    console.log("Creating enrollments...");
    const enrollmentData = [
      {
        studentId: studentUsers[0].id,
        courseId: createdCourses[0].id,
        status: "active" as const,
        progress: 45,
      },
      {
        studentId: studentUsers[0].id,
        courseId: createdCourses[1].id,
        status: "completed" as const,
        progress: 100,
      },
      {
        studentId: studentUsers[1].id,
        courseId: createdCourses[0].id,
        status: "active" as const,
        progress: 30,
      },
      {
        studentId: studentUsers[1].id,
        courseId: createdCourses[3].id,
        status: "active" as const,
        progress: 60,
      },
      {
        studentId: studentUsers[2].id,
        courseId: createdCourses[1].id,
        status: "active" as const,
        progress: 75,
      },
      {
        studentId: studentUsers[2].id,
        courseId: createdCourses[5].id,
        status: "active" as const,
        progress: 20,
      },
      {
        studentId: studentUsers[3].id,
        courseId: createdCourses[2].id,
        status: "active" as const,
        progress: 15,
      },
      {
        studentId: studentUsers[4].id,
        courseId: createdCourses[3].id,
        status: "completed" as const,
        progress: 100,
      },
      {
        studentId: studentUsers[5].id,
        courseId: createdCourses[4].id,
        status: "active" as const,
        progress: 55,
      },
    ];

    const createdEnrollments = [];
    for (const enrollment of enrollmentData) {
      const [created] = await db
        .insert(enrollments)
        .values(enrollment)
        .returning();
      createdEnrollments.push(created);
    }

    // Create Payments
    console.log("Creating payments...");
    let paymentCount = 0;

    for (let i = 0; i < createdEnrollments.length; i++) {
      const enrollment = enrollmentData[i];
      const createdEnrollment = createdEnrollments[i];
      const course = createdCourses.find((c) => c.id === enrollment.courseId);
      const totalAmount = parseFloat(course!.price);

      // Vary payment scenarios for demo
      let paidAmount = 0;
      let paymentScenario: "full" | "partial" | "multiple" = "full";

      if (i % 3 === 0) {
        paymentScenario = "partial"; // Partial payment
        paidAmount = totalAmount * 0.5; // 50% paid
      } else if (i % 3 === 1) {
        paymentScenario = "multiple"; // Multiple payments
        paidAmount = totalAmount; // Fully paid via multiple payments
      } else {
        paymentScenario = "full"; // Full payment
        paidAmount = totalAmount;
      }

      // Update enrollment with payment info
      await db
        .update(enrollments)
        .set({
          totalAmount: course!.price,
          paidAmount: paidAmount.toFixed(2),
        })
        .where(eq(enrollments.id, createdEnrollment.id));

      // Create payment(s) based on scenario
      if (paymentScenario === "full") {
        // Single full payment
        paymentCount++;
        await db.insert(payments).values({
          studentId: enrollment.studentId,
          enrollmentId: createdEnrollment.id,
          amount: totalAmount.toFixed(2),
          method: "bank_transfer",
          status: "completed" as const,
          txnId: `TXN-2025-${String(paymentCount).padStart(6, "0")}`,
          notes: "Full course payment",
        });
      } else if (paymentScenario === "partial") {
        // Partial payment (50%)
        paymentCount++;
        await db.insert(payments).values({
          studentId: enrollment.studentId,
          enrollmentId: createdEnrollment.id,
          amount: (totalAmount * 0.5).toFixed(2),
          method: "credit_card",
          status: "completed" as const,
          txnId: `TXN-2025-${String(paymentCount).padStart(6, "0")}`,
          notes: "Partial payment (50%)",
        });
      } else {
        // Multiple payments (3 installments)
        const installment1 = totalAmount * 0.4;
        const installment2 = totalAmount * 0.3;
        const installment3 = totalAmount * 0.3;

        paymentCount++;
        await db.insert(payments).values({
          studentId: enrollment.studentId,
          enrollmentId: createdEnrollment.id,
          amount: installment1.toFixed(2),
          method: "bank_transfer",
          status: "completed" as const,
          txnId: `TXN-2025-${String(paymentCount).padStart(6, "0")}`,
          notes: "First installment (40%)",
        });

        paymentCount++;
        await db.insert(payments).values({
          studentId: enrollment.studentId,
          enrollmentId: createdEnrollment.id,
          amount: installment2.toFixed(2),
          method: "mobile_payment",
          status: "completed" as const,
          txnId: `TXN-2025-${String(paymentCount).padStart(6, "0")}`,
          notes: "Second installment (30%)",
        });

        paymentCount++;
        await db.insert(payments).values({
          studentId: enrollment.studentId,
          enrollmentId: createdEnrollment.id,
          amount: installment3.toFixed(2),
          method: "cash",
          status: "completed" as const,
          txnId: `TXN-2025-${String(paymentCount).padStart(6, "0")}`,
          notes: "Final installment (30%)",
        });
      }
    }

    // Add some pending payments for demo
    console.log("Creating pending payments...");
    paymentCount++;
    await db.insert(payments).values({
      studentId: studentUsers[0].id,
      enrollmentId: createdEnrollments[0].id,
      amount: "100.00",
      method: "bank_transfer",
      status: "pending" as const,
      txnId: `TXN-2025-${String(paymentCount).padStart(6, "0")}`,
      notes: "Additional payment - pending approval",
    });

    // Create Scores
    console.log("Creating scores...");
    const scoreData = [
      {
        enrollmentId: createdEnrollments[0].id,
        title: "Midterm Project",
        score: "85.5",
        maxScore: "100",
        remarks: "Great work!",
      },
      {
        enrollmentId: createdEnrollments[0].id,
        title: "Quiz 1",
        score: "92.0",
        maxScore: "100",
        remarks: "Excellent",
      },
      {
        enrollmentId: createdEnrollments[1].id,
        title: "Final Project",
        score: "95.0",
        maxScore: "100",
        remarks: "Outstanding!",
      },
      {
        enrollmentId: createdEnrollments[2].id,
        title: "Assignment 1",
        score: "78.0",
        maxScore: "100",
        remarks: "Good effort",
      },
      {
        enrollmentId: createdEnrollments[3].id,
        title: "Quiz 2",
        score: "88.5",
        maxScore: "100",
        remarks: "Well done",
      },
    ];

    for (const score of scoreData) {
      await db.insert(scores).values(score);
    }

    // Create Attendances
    console.log("Creating attendances...");
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      for (let j = 0; j < Math.min(5, createdEnrollments.length); j++) {
        await db.insert(attendances).values({
          enrollmentId: createdEnrollments[j].id,
          date: dateStr,
          status:
            i === 0 && j === 0
              ? ("absent" as const)
              : i === 1 && j === 1
                ? ("late" as const)
                : ("present" as const),
          notes: i === 0 && j === 0 ? "Sick leave" : null,
        });
      }
    }

    console.log("✅ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`- 1 Admin user`);
    console.log(`- ${teacherData.length} Teachers`);
    console.log(`- ${studentData.length} Students`);
    console.log(`- ${categoryData.length} Course Categories`);
    console.log(`- ${courseData.length} Courses`);
    console.log(`- ${enrollmentData.length} Enrollments`);
    console.log(`- ${paymentCount} Payments (full, partial, and installments)`);
    console.log(`- ${scoreData.length} Scores`);
    console.log("- Multiple Attendance records");
    console.log("\n� Poayment Scenarios:");
    console.log("- Full payments (single transaction)");
    console.log("- Partial payments (50% paid, balance due)");
    console.log("- Multiple installments (3 payments per enrollment)");
    console.log("- Pending payments (awaiting approval)");
    console.log("\n🔑 Login credentials (all passwords: 123456):");
    console.log("Admin: admin@cubisacademy.com / 123456");
    console.log("Teacher: john@cubisacademy.com / 123456");
    console.log("Student: alice@example.com / 123456");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("✨ Seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed:", error);
    process.exit(1);
  });
