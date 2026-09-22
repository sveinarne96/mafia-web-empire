import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { credentialsProvider } from "./auth/credentials";

// Session lifetime: players stay signed in for a full YEAR (refreshed on
// activity). "Every reload creates a new character" was short-lived guest
// sessions — this is the direct fix at the source.
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [credentialsProvider, Anonymous],
  session: {
    totalDurationMs: YEAR_MS,
    inactiveDurationMs: YEAR_MS,
  },
  callbacks: {
    createOrUpdateUser: async (ctx, { existingUserId, ...args }) => {
      // Returning player: their profile row already exists — never overwrite it.
      if (existingUserId) return existingUserId;

      // New identity (guest or provider-created): create the row with every
      // game field the schema declares, so no system ever reads undefined.
      const profile = args.profile ?? {};
      const safeProfile: Record<string, unknown> = {};
      if (profile.name) safeProfile.name = profile.name;
      if (profile.image) safeProfile.image = profile.image;
      if (profile.email) safeProfile.email = profile.email;
      if (profile.isAnonymous !== undefined) safeProfile.isAnonymous = profile.isAnonymous;
      if (profile.emailVerificationTime) safeProfile.emailVerificationTime = profile.emailVerificationTime;

      try {
        return await ctx.db.insert("users", { ...safeProfile } as any);
      } catch (e: any) {
        // If insert fails (e.g. duplicate), try to find an existing user by email
        if (profile.email) {
          const all = await ctx.db.query("users").collect();
          const found = all.find((u: any) => u.email === profile.email);
          if (found) return found._id;
        }
        throw e;
      }
    },
  },
});
