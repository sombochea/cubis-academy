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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Validate session on every request (check if user still exists and is active)
      if (token.id && trigger !== 'signIn') {
        try {
          const { validateSession } = await import('./lib/session-store');
          const { getUserById } = await import('./lib/drizzle/queries');
          
          // Check if user still exists and is active
          const dbUser = await getUserById(token.id as string);
          
          if (!dbUser || !dbUser.isActive) {
            // User deleted or deactivated - invalidate token
            return null as any;
          }

          // Update token with latest user data
          token.role = dbUser.role;
        } catch (error) {
          console.error('Session validation error:', error);
          // On error, invalidate session to be safe
          return null as any;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token) {
        return null as any;
      }

      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/km/login",
    signOut: "/km/logout",
  },
} satisfies NextAuthConfig;

export default authConfig;
