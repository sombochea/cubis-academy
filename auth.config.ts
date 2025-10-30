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
        if (account?.provider && account.provider !== 'credentials') {
          // OAuth login - fetch user from database to get the actual user ID
          const { db } = await import('@/lib/drizzle/db');
          const { users } = await import('@/lib/drizzle/schema');
          const { eq } = await import('drizzle-orm');
          
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email!),
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.email = dbUser.email;
            // Prioritize Google image over stored photo for OAuth users
            token.picture = user.image || dbUser.photo;
            
            console.log('🎫 JWT token created for OAuth user:', {
              id: token.id,
              email: token.email,
              role: token.role,
              picture: token.picture,
              googleImage: user.image,
              dbPhoto: dbUser.photo,
            });
          } else {
            console.error('❌ OAuth user not found in database:', user.email);
            // User should have been created in signIn event
            // Fallback to user object values
            token.role = user.role || 'student';
            token.id = user.id;
            token.name = user.name;
            token.email = user.email;
            token.picture = user.image;
          }
        } else {
          // Credentials login
          token.role = user.role || 'student';
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.picture = user.image;
          
          console.log('🎫 JWT token created for credentials user:', {
            id: token.id,
            email: token.email,
            role: token.role,
          });
        }
        
        // Generate session token on sign in (using Web Crypto API for edge compatibility)
        if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
          token.sessionToken = globalThis.crypto.randomUUID();
        } else {
          // Fallback for environments without crypto.randomUUID
          token.sessionToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        }
      }

      // Handle session update trigger (when user updates profile)
      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        token.email = session.email || token.email;
        token.picture = session.picture || token.picture;
        
        console.log('🔄 JWT token updated:', {
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
        // Pass sessionToken to session so proxy.ts can access it
        (session.user as any).sessionToken = token.sessionToken;
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
