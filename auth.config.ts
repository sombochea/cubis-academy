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
      const locale = localeMatch ? localeMatch[1] : 'km';
      const pathWithoutLocale = localeMatch ? pathname.slice(3) : pathname;

      // Public routes
      const isPublicRoute =
        pathWithoutLocale === "/" || pathWithoutLocale === "/login" || pathWithoutLocale === "/register" || pathWithoutLocale === "";

      // Auth routes
      const isAuthRoute = pathWithoutLocale === "/login" || pathWithoutLocale === "/register";

      // Role-based routes
      const isStudentRoute = pathWithoutLocale.startsWith("/student");
      const isTeacherRoute = pathWithoutLocale.startsWith("/teacher");
      const isAdminRoute = pathWithoutLocale.startsWith("/admin");

      // Redirect logged-in users away from auth pages
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(
          new URL(
            `/${locale}${userRole === "admin"
              ? "/admin"
              : userRole === "teacher"
              ? "/teacher"
              : "/student"}`,
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
    signIn: "/km/login",
  },
} satisfies NextAuthConfig;

export default authConfig;
