import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const { pathname } = nextUrl;

      // Extract locale from pathname
      const localeMatch = pathname.match(/^\/(km|en)(\/|$)/);
      const locale = localeMatch ? localeMatch[1] : "km";
      const pathWithoutLocale = localeMatch ? pathname.slice(3) : pathname;

      // Public routes
      const isPublicRoute =
        pathWithoutLocale === "/" ||
        pathWithoutLocale === "/login" ||
        pathWithoutLocale === "/register" ||
        pathWithoutLocale === "";

      // Auth routes
      const isAuthRoute =
        pathWithoutLocale === "/login" || pathWithoutLocale === "/register";

      // Role-based routes
      const isStudentRoute = pathWithoutLocale.startsWith("/student");
      const isTeacherRoute = pathWithoutLocale.startsWith("/teacher");
      const isAdminRoute = pathWithoutLocale.startsWith("/admin");

      // Redirect logged-in users away from auth pages
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(
          new URL(
            `/${locale}${
              userRole === "admin"
                ? "/admin"
                : userRole === "teacher"
                  ? "/teacher"
                  : "/student"
            }`,
            nextUrl
          )
        );
      }

      // Protect routes based on authentication
      if (!isPublicRoute && !isLoggedIn) {
        return false;
      }

      // Protect routes based on role
      if (isLoggedIn) {
        if (isStudentRoute && userRole !== "student") {
          return Response.redirect(new URL(`/${locale}/unauthorized`, nextUrl));
        }
        if (isTeacherRoute && userRole !== "teacher" && userRole !== "admin") {
          return Response.redirect(new URL(`/${locale}/unauthorized`, nextUrl));
        }
        if (isAdminRoute && userRole !== "admin") {
          return Response.redirect(new URL(`/${locale}/unauthorized`, nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        // For OAuth users, we need to fetch the user from DB to ensure it exists
        // For credentials users, role comes from authorize function
        if (account?.provider && account.provider !== "credentials") {
          // OAuth login - the signIn event runs AFTER this callback
          // So for new users, we need to use temporary values and let NextAuth call us again
          const { db } = await import("@/lib/drizzle/db");
          const { users } = await import("@/lib/drizzle/schema");
          const { eq } = await import("drizzle-orm");

          // First, check if user already exists (returning user)
          let dbUser = null;
          
          if (account.provider === 'google' && account.providerAccountId) {
            // Try by googleId first
            dbUser = await db.query.users.findFirst({
              where: eq(users.googleId, account.providerAccountId),
            });
            
            // If not found by googleId, try by email
            if (!dbUser) {
              dbUser = await db.query.users.findFirst({
                where: eq(users.email, user.email!),
              });
            }
          } else {
            // Non-Google OAuth, use email
            dbUser = await db.query.users.findFirst({
              where: eq(users.email, user.email!),
            });
          }

          if (dbUser) {
            // Existing user - use database values
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = user.image || dbUser.photo;
            token.loginMethod = account.provider === 'google' ? 'google' : 'oauth';

            // Fetch SUID for students
            if (dbUser.role === 'student') {
              const { students } = await import("@/lib/drizzle/schema");
              const studentProfile = await db.query.students.findFirst({
                where: eq(students.userId, dbUser.id),
                columns: { suid: true },
              });
              if (studentProfile) {
                token.suid = studentProfile.suid;
              }
            }

            console.log("🎫 JWT token created for existing OAuth user:", {
              id: token.id,
              email: token.email,
              role: token.role,
              suid: token.suid,
            });
          } else {
            // New user - signIn event will create them
            // Use temporary values from OAuth provider
            // NextAuth will call this callback again after signIn event
            token.id = user.id; // Temporary ID from NextAuth
            token.role = "student"; // Default role
            token.name = user.name;
            token.email = user.email;
            token.picture = user.image;
            token.loginMethod = account.provider === 'google' ? 'google' : 'oauth';
            token.isNewUser = true; // Flag to indicate this is a new user

            console.log("🆕 JWT token created for NEW OAuth user (temporary):", {
              id: token.id,
              email: token.email,
              role: token.role,
              isNewUser: true,
            });
          }
        } else {
          // Credentials login
          token.role = user.role || "student";
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.picture = user.image;
          token.loginMethod = 'credentials';

          // Fetch SUID for students
          if (token.role === 'student') {
            const { db } = await import("@/lib/drizzle/db");
            const { students } = await import("@/lib/drizzle/schema");
            const { eq } = await import("drizzle-orm");
            
            const studentProfile = await db.query.students.findFirst({
              where: eq(students.userId, user.id),
              columns: { suid: true },
            });
            if (studentProfile) {
              token.suid = studentProfile.suid;
            }
          }

          console.log("🎫 JWT token created for credentials user:", {
            id: token.id,
            email: token.email,
            role: token.role,
            suid: token.suid,
            loginMethod: token.loginMethod,
          });
        }

        // Generate session token on sign in (using Web Crypto API for edge compatibility)
        if (
          typeof globalThis.crypto !== "undefined" &&
          globalThis.crypto.randomUUID
        ) {
          token.sessionToken = globalThis.crypto.randomUUID();
        } else {
          // Fallback for environments without crypto.randomUUID
          token.sessionToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        }
      }

      // If this is a new OAuth user, fetch the real database ID
      if (token.isNewUser && token.email) {
        const { db } = await import("@/lib/drizzle/db");
        const { users } = await import("@/lib/drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // The signIn event should have created the user by now
        // Wait a bit and then fetch the real user
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, token.email as string),
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.isNewUser = false; // Clear the flag
          
          // Fetch SUID for students
          if (dbUser.role === 'student') {
            const { students } = await import("@/lib/drizzle/schema");
            const studentProfile = await db.query.students.findFirst({
              where: eq(students.userId, dbUser.id),
              columns: { suid: true },
            });
            if (studentProfile) {
              token.suid = studentProfile.suid;
            }
          }
          
          console.log("✅ Updated JWT token with real database ID:", {
            id: token.id,
            email: token.email,
            role: token.role,
            suid: token.suid,
          });
        } else {
          console.error("⚠️ New OAuth user still not found in database:", token.email);
        }
      }

      // Handle session update trigger (when user updates profile)
      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        token.email = session.email || token.email;
        token.picture = session.picture || token.picture;

        console.log("🔄 JWT token updated:", {
          name: token.name,
          email: token.email,
          picture: token.picture,
        });
      }

      // Note: Session validation is done in middleware.ts
      // We can't validate here because edge runtime doesn't support Node.js modules

      return token;
    },
    async session({ session, token }) {
      if (!token) {
        return null as any;
      }

      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        // Pass sessionToken, loginMethod, and suid to session
        (session.user as any).sessionToken = token.sessionToken;
        (session.user as any).loginMethod = token.loginMethod;
        (session.user as any).suid = token.suid;
      }
      return session;
    },
  },
  pages: {
    signIn: "/km/login",
    signOut: "/km/logout",
  },
  debug: process.env.NODE_ENV !== "production",
} satisfies NextAuthConfig;

export default authConfig;
