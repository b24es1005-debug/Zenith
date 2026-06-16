import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import { authEnv, hasGitHubAuthEnvironment } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: authEnv.AUTH_GOOGLE_ID,
      clientSecret: authEnv.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: Role.USER,
        };
      },
    }),
    ...(hasGitHubAuthEnvironment()
      ? [
          GitHub({
            clientId: authEnv.AUTH_GITHUB_ID,
            clientSecret: authEnv.AUTH_GITHUB_SECRET,
            authorization: {
              params: {
                scope: "read:user user:email",
              },
            },
            profile(profile) {
              return {
                id: profile.id.toString(),
                name: profile.name ?? profile.login,
                email: profile.email,
                image: profile.avatar_url,
                role: Role.USER,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.image = user.image ?? session.user.image;
      }

      return session;
    },
  },
  secret: authEnv.AUTH_SECRET,
});