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
import { createSession, revokeSession } from "./lib/session-store";

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

        console.log("🔐 Login successful:", {
          id: user.id,
          email: user.email,
          name: user.name,
          photo: user.photo,
          role: user.role,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.photo, // Include photo from users table
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  trustHost: true,
  events: {
    async signIn({ user, account, profile }) {
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
              photo: user.image || null, // Save Google profile picture
              googleId:
                account.provider === "google"
                  ? account.providerAccountId
                  : undefined,
              role: "student",
              isActive: true,
              emailVerifiedAt: new Date(), // Auto-verify OAuth2 emails
            })
            .returning();

          // Update user object with role and photo for JWT callback
          user.role = newUser.role;
          user.id = newUser.id;
          user.image = newUser.photo || user.image;

          console.log("✅ New OAuth user created:", {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            photo: newUser.photo,
            role: newUser.role,
          });

          // Create student profile with SUID
          const suid = await generateSuid();
          await db.insert(students).values({
            userId: newUser.id,
            suid,
          });
        } else {
          // Existing user - update user object with role for JWT callback
          user.role = existingUser.role;
          user.id = existingUser.id;
          user.image = existingUser.photo || user.image;

          console.log("✅ Existing OAuth user logged in:", {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            photo: existingUser.photo,
            role: existingUser.role,
            googleImage: user.image,
          });

          // Prepare updates
          const updates: any = {};

          if (!existingUser.emailVerifiedAt) {
            updates.emailVerifiedAt = new Date();
          }

          // Always sync Google profile picture on login
          if (account.provider === "google" && user.image) {
            if (user.image !== existingUser.photo) {
              updates.photo = user.image;
              console.log(
                "📸 Syncing Google profile picture for user:",
                existingUser.id,
                "from:",
                existingUser.photo,
                "to:",
                user.image
              );
            }
          }

          // Apply updates if any
          if (Object.keys(updates).length > 0) {
            updates.updated = new Date();
            await db
              .update(users)
              .set(updates)
              .where(eq(users.id, existingUser.id));
          }
        }
      }
    },
    async signOut(message) {
      // Revoke session from our session store
      const token = "token" in message ? message.token : null;
      if (token?.sessionToken) {
        try {
          await revokeSession(token.sessionToken as string);
          console.log("✅ Session revoked on sign out");
        } catch (error) {
          console.error("Failed to revoke session:", error);
        }
      }
    },
  },
});
