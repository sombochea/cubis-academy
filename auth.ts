import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/drizzle/db";
import { users, students } from "./lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateSuid, getUserByEmail } from "./lib/drizzle/queries";
import { loginSchema } from "./lib/validations/auth";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;
        const user = await getUserByEmail(email);
        if (!user || !user.passHash || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  events: {
    async signIn({ user, account }) {
      // Handle OAuth2 providers (Google, GitHub, etc.)
      if (account?.provider && account.provider !== "credentials") {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email!),
        });

        if (!existingUser) {
          // Create new user with OAuth2
          // OAuth2 providers verify email, so we set emailVerifiedAt
          const [newUser] = await db
            .insert(users)
            .values({
              name: user.name!,
              email: user.email!,
              googleId:
                account.provider === "google"
                  ? account.providerAccountId
                  : undefined,
              role: "student",
              isActive: true,
              emailVerifiedAt: new Date(), // Auto-verify OAuth2 emails
            })
            .returning();

          // Create student profile with SUID
          const suid = await generateSuid();
          await db.insert(students).values({
            userId: newUser.id,
            suid,
          });
        } else if (!existingUser.emailVerifiedAt) {
          // If user exists but email not verified, verify it now
          // OAuth2 providers have already verified the email
          await db
            .update(users)
            .set({
              emailVerifiedAt: new Date(),
              updated: new Date(),
            })
            .where(eq(users.id, existingUser.id));
        }
      }
    },
  },
});
