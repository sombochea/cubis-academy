import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const { pathname } = nextUrl;

      // Public routes
      const isPublicRoute =
        pathname === "/" || pathname === "/login" || pathname === "/register";

      // Auth routes
      const isAuthRoute = pathname === "/login" || pathname === "/register";

      // Role-based routes
      const isStudentRoute = pathname.startsWith("/student");
      const isTeacherRoute = pathname.startsWith("/teacher");
      const isAdminRoute = pathname.startsWith("/admin");

      // Redirect logged-in users away from auth pages
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(
          new URL(
            userRole === "admin"
              ? "/admin"
              : userRole === "teacher"
              ? "/teacher"
              : "/student",
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
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
        if (isTeacherRoute && userRole !== "teacher" && userRole !== "admin") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
        if (isAdminRoute && userRole !== "admin") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export default authConfig;
